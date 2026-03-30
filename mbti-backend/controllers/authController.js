const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 管理员登录 - 完全适配前端API
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 生成JWT令牌
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // 确保返回的结构包含所有必要字段
        const userResponse = {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            displayName: user.displayName || user.username,
            permissions: ['view_results', 'export_data', 'manage_results'],
            createdAt: user.createdAt
        };

        console.log('登录成功，返回用户数据:', userResponse);

        res.json({
            success: true,
            token: token,
            user: userResponse
        });

    } catch (error) {
        console.error('管理员登录错误:', error);
        res.status(500).json({
            success: false,
            message: '登录失败',
            error: error.message
        });
    }
};

// 创建初始管理员账户
exports.createAdmin = async () => {
    try {
        // 定义要创建的管理员账户列表
        const admins = [
            { username: 'ally', password: 'ally@zzy123', displayName: 'Ally' },
            { username: 'stella', password: 'stella@zzy123', displayName: 'Stella' },
            { username: 'allen', password: 'allen@zzy123', displayName: 'Allen' },
            { username: 'vivian', password: 'vivian@zzy123', displayName: 'Vivian' }
        ];

        for (const adminData of admins) {
            // 检查当前管理员是否已存在
            const adminExists = await User.findOne({ username: adminData.username });

            if (!adminExists) {
                const admin = new User({
                    username: adminData.username,
                    password: adminData.password, // 在保存时会自动加密
                    role: 'admin',
                    displayName: adminData.displayName
                });

                await admin.save();
                console.log(`初始管理员账户已创建`);
                console.log(`用户名: ${adminData.username}`);
                console.log(`密码: ${adminData.password}`);
            }
        }
    } catch (error) {
        console.error('创建管理员账户失败:', error);
    }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                displayName: user.displayName,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '获取用户信息失败',
            error: error.message
        });
    }
};

// 创建新管理员账户
exports.createNewAdmin = async (req, res) => {
    try {
        const { username, password, displayName } = req.body;

        // 验证权限 - 只有管理员可以创建新管理员
        //const currentUser = await User.findById(req.user.userId);
        //if (currentUser.role !== 'admin') {
            //return res.status(403).json({
                //success: false,
                //message: '权限不足：只有管理员可以创建新管理员账户'
            //});
        //}

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 创建新管理员
        const newAdmin = new User({
            username,
            password,
            role: 'admin',
            displayName: displayName || username
        });

        await newAdmin.save();

        // 返回不包含密码的用户信息
        const adminResponse = {
            id: newAdmin._id.toString(),
            username: newAdmin.username,
            role: newAdmin.role,
            displayName: newAdmin.displayName,
            createdAt: newAdmin.createdAt
        };

        console.log('新管理员账户创建成功:', adminResponse);

        res.status(201).json({
            success: true,
            message: '新管理员账户创建成功',
            user: adminResponse
        });

    } catch (error) {
        console.error('创建管理员账户错误:', error);
        res.status(500).json({
            success: false,
            message: '创建管理员账户失败',
            error: error.message
        });
    }
};

// 修改密码
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 查找当前用户
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 验证当前密码
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '当前密码错误'
            });
        }

        // 更新密码
        user.password = newPassword;
        await user.save();

        console.log('密码修改成功:', user.username);

        res.json({
            success: true,
            message: '密码修改成功'
        });

    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({
            success: false,
            message: '修改密码失败',
            error: error.message
        });
    }
};