const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: '拒绝访问：未提供令牌'
        });
    }

    try {
        const tokenWithoutBearer = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token验证失败:', error);
        res.status(401).json({
            success: false,
            message: '令牌无效或已过期'
        });
    }
};