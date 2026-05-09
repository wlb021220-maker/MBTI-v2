const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const memoryUsage = require('process').memoryUsage;
require('dotenv').config();

const app = express();

// 记录服务器启动时间
let serverStartTime = Date.now();

// 内存监控
function monitorMemory() {
    const mem = memoryUsage();
    const format = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

    if (mem.heapUsed > 400 * 1024 * 1024) { // 超过400MB
        console.warn('⚠️ 内存使用过高:', {
            heapUsed: format(mem.heapUsed),
            heapTotal: format(mem.heapTotal),
            rss: format(mem.rss)
        });
    }
}
setInterval(monitorMemory, 30000);

// 中间件配置
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'frame-src': ["'self'", "*"],
            'frame-ancestors': ["'self'", "*"]
        }
    }
}));
app.use(compression());
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));
app.set('trust proxy', true);

app.get('/health', (req, res) => {
    // 获取真实的数据库连接状态
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;

    const uptime = (Date.now() - serverStartTime) / 1000;
    const mem = memoryUsage();

    // 构建响应数据
    const healthInfo = {
        status: isDbConnected ? 'ok' : 'error', // 状态标识
        database: isDbConnected ? 'connected' : 'disconnected',
        dbStateCode: dbState,
        timestamp: new Date().toISOString(),
        uptime: uptime,
        memory: {
            heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
            heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2) + ' MB'
        },
        service: 'mbti-backend'
    };

    // 【核心逻辑】如果数据库没连上，返回 500
    // Docker 收到 500 会标记为 unhealthy -> 触发 Autoheal 重启
    if (isDbConnected) {
        res.status(200).json(healthInfo);
    } else {
        console.error(`Health Check Failed: DB State is ${dbState}`);
        res.status(500).json(healthInfo);
    }
});

// 数据库连接重试函数
function connectWithRetry() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/mbti_test';
    console.log('🔄 尝试连接MongoDB:', mongoUri);

    mongoose.connect(mongoUri, {
        // useNewUrlParser 等选项在 Mongoose 6+ 实际上已经默认开启，但保留也无妨
        serverSelectionTimeoutMS: 5000, // 【优化】缩短超时时间，让错误更快暴露
        socketTimeoutMS: 45000,
        family: 4 // 强制 IPv4，防止部分环境解析慢
    }).then(() => {
        console.log('✅ MongoDB连接成功');
        // 创建初始管理员账户
        try {
            require('./controllers/authController').createAdmin();
        } catch (error) {
            console.error('⚠️ 创建初始管理员账户失败:', error.message);
        }
    }).catch(err => {
        console.error('❌ MongoDB连接失败，将在5秒后重试:', err.message);
        setTimeout(connectWithRetry, 5000);
    });
}

// 启动数据库连接
connectWithRetry();

// 数据库连接断开时的全局监听 (增加日志)
mongoose.connection.on('disconnected', () => {
    console.error('⚠️ MongoDB 连接已断开！');
});

// 路由加载
let resultsRouter, authRouter;
try {
    resultsRouter = require('./routes/results');
    authRouter = require('./routes/auth');
    app.use('/api', resultsRouter);
    app.use('/api', authRouter);
    console.log('✅ 路由加载成功');
} catch (error) {
    console.error('❌ 路由加载失败:', error.message);
    console.error('错误堆栈:', error.stack);
}

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API端点不存在',
        path: req.originalUrl
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    // 确保服务不会因为错误而崩溃
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误'
    });
});

// 启动服务
const PORT = process.env.PORT || 3003;
const server = app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
});

// 优雅关闭
const gracefulShutdown = () => {
    console.log('正在关闭服务器...');
    server.close(() => {
        console.log('HTTP服务器已关闭');
        mongoose.disconnect(() => {
            console.log('数据库连接已关闭');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);