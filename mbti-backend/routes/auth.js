const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// 管理员登录
router.post('/admin/login', authController.adminLogin);

// 获取当前用户信息
router.get('/admin/me', auth, authController.getCurrentUser);

// 创建新管理员账户
router.post('/admin/create', auth, authController.createNewAdmin);

// 修改密码
router.post('/admin/change-password', auth, authController.changePassword);

// 批量导入管理员（从JSON文件）
router.post('/admin/import-users', auth, authController.importUsersFromJson);

module.exports = router;