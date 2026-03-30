const http = require('http');
const fs = require('fs');
const path = require('path');

// 静态文件目录
const publicDirectory = path.join(__dirname, 'dist');

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // 处理API请求，转发到后端
    if (req.url.startsWith('/api')) {
        const proxyReq = http.request({
            hostname: 'localhost',
            port: 3002,
            path: req.url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    // 处理静态文件请求
    let filePath = path.join(publicDirectory, req.url);

    // 如果是目录，默认返回index.html
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    // 如果文件不存在，返回index.html（SPA路由支持）
    if (!fs.existsSync(filePath)) {
        filePath = path.join(publicDirectory, 'index.html');
    }

    // 获取文件扩展名
    const extname = String(path.extname(filePath)).toLowerCase();
    // 获取对应的MIME类型
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 读取并返回文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(500);
            res.end('服务器错误: ' + error.code);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 前端静态服务器运行在端口 ${PORT}`);
    console.log(`📁 静态文件目录: ${publicDirectory}`);
    console.log(`🌐 访问地址: http://139.180.215.236:${PORT}`);
});
