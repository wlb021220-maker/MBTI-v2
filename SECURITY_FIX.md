# MBTI 系统安全加固指南

## ⚠️ 紧急修复（生产环境部署前必须完成）

### 1. MongoDB 安全加固

#### 步骤 1: 在远程服务器上启用 MongoDB 认证

```bash
# 连接到远程服务器的 MongoDB
mongo

# 创建管理员账户
use admin
db.createUser({
  user: "admin",
  pwd: "YourStrongPassword123!",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# 创建应用专用账户
use mbti_test
db.createUser({
  user: "mbti_app",
  pwd: "MbtiAppSecurePass456!",
  roles: [ { role: "readWrite", db: "mbti_test" } ]
})
```

#### 步骤 2: 修改 MongoDB 配置文件

编辑 `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled

# 绑定到本地，禁止公网直接访问
net:
  bindIp: 127.0.0.1
  port: 27017
```

#### 步骤 3: 更新应用连接字符串

修改 `.env.production`:
```
MONGODB_URI=mongodb://mbti_app:MbtiAppSecurePass456!@localhost:27017/mbti_test
```

### 2. 使用 SSH 隧道（推荐）

不要直接暴露 MongoDB 端口，使用 SSH 隧道：

```bash
# 在应用服务器上建立隧道
ssh -N -L 27017:localhost:27017 root@139.180.215.236

# 然后应用连接本地端口
MONGODB_URI=mongodb://localhost:27017/mbti_test
```

### 3. 防火墙配置

```bash
# 禁止外部访问 MongoDB 端口
iptables -A INPUT -p tcp --dport 27017 -j DROP

# 只允许特定 IP 访问
iptables -A INPUT -p tcp --dport 27017 -s YOUR_APP_SERVER_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 27017 -j DROP
```

### 4. 修改后端 CORS 配置

修改 `server.js`:

```javascript
// 生产环境只允许特定域名
const allowedOrigins = [
    'http://localhost:5173',  // 开发环境
    'https://your-domain.com', // 生产环境域名
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('不允许的域名'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5. 添加请求频率限制

安装依赖：
```bash
npm install express-rate-limit
```

修改 `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

// API 请求限制
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 每个 IP 限制 100 次请求
    message: '请求过于频繁，请稍后再试'
});

app.use('/api/', apiLimiter);

// 登录接口更严格的限制
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 15 分钟内最多 5 次登录尝试
    message: '登录尝试次数过多，请 15 分钟后再试'
});

app.use('/api/admin/login', loginLimiter);
```

### 6. 数据备份策略

创建备份脚本 `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"

# 创建备份
mongodump --host 139.180.215.236 --username mbti_app --password "MbtiAppSecurePass456!" --db mbti_test --out $BACKUP_DIR/$DATE

# 压缩备份
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# 保留最近 30 天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "备份完成: $DATE.tar.gz"
```

添加到定时任务：
```bash
# 每天凌晨 2 点备份
crontab -e
0 2 * * * /path/to/backup.sh >> /var/log/mongodb_backup.log 2>&1
```

## 🔒 生产环境检查清单

- [ ] MongoDB 已启用认证
- [ ] MongoDB 端口未暴露公网（使用 SSH 隧道或 VPN）
- [ ] 防火墙已配置
- [ ] CORS 只允许特定域名
- [ ] 已添加请求频率限制
- [ ] JWT_SECRET 已修改为强密码
- [ ] 已配置自动备份
- [ ] 服务器已禁用 root 远程登录
- [ ] 已安装 fail2ban 防止暴力破解
- [ ] 已启用 HTTPS

## 🚨 勒索软件防护

1. **永远不要**将 MongoDB 端口直接暴露到公网
2. **定期备份**数据到异地
3. **使用强密码**并定期更换
4. **监控异常**登录和查询
5. **及时更新**系统和软件补丁
