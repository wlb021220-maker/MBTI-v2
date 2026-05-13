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

// 从JSON文件批量导入管理员
exports.importUsersFromJson = async (req, res) => {
    try {
        console.log('开始批量导入管理员...');
        console.log('请求体类型:', typeof req.body);
        console.log('请求体内容预览:', JSON.stringify(req.body).substring(0, 200));
        
        // 检查请求体
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('请求体为空');
            return res.status(400).json({
                success: false,
                message: '请求体为空，请上传有效的JSON数据'
            });
        }
        
        let jsonData = req.body;
        
        // 判断是单条数据还是数组
        let dataArray = [];
        if (Array.isArray(jsonData)) {
            dataArray = jsonData;
            console.log(`检测到数组格式，包含 ${dataArray.length} 条管理员数据`);
        } else {
            dataArray = [jsonData];
            console.log('检测到单条数据格式');
        }
        
        // 转换和验证数据
        const transformedData = [];
        const errors = [];
        const existingUsernames = [];  // 记录已存在的用户名
        const skippedUsers = [];       // 记录被跳过的用户
        
        for (let i = 0; i < dataArray.length; i++) {
            const item = dataArray[i];
            console.log(`处理第 ${i + 1} 条数据:`, JSON.stringify(item).substring(0, 100));
            
            try {
                // 提取用户名（支持多种字段名）
                const username = item.username || item['用户名'];
                console.log(`  提取用户名: ${username}`);
                
                if (!username) {
                    errors.push(`第 ${i + 1} 条数据缺少用户名`);
                    console.log(`  ❌ 缺少用户名，跳过`);
                    continue;
                }
                
                // 提取密码（支持多种字段名）
                let password = item.password || item['密码'];
                // 如果没有密码但有明文密码字段，使用明文密码
                if (!password && item['明文密码']) {
                    password = item['明文密码'];
                }
                // 如果没有密码，生成默认密码
                if (!password) {
                    password = username + '@123456';
                    console.log(`  ⚠️ 使用默认密码: ${password}`);
                } else {
                    console.log(`  ✅ 使用提供的密码`);
                }
                
                // 提取显示名称（支持多种字段名）
                const displayName = item.displayName || item['显示名称'] || item.display_name || username;
                console.log(`  显示名称: ${displayName}`);
                
                // 提取角色（默认为 admin）
                const role = item.role || item['角色'] || 'admin';
                
                // 检查用户名是否已存在
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    console.log(`  ⚠️ 用户名 ${username} 已存在，跳过`);
                    existingUsernames.push(username);
                    skippedUsers.push({ username, displayName, reason: '已存在' });
                    continue;
                }
                
                // 处理创建时间（支持 MongoDB $date 格式）
                let createdAt = new Date();
                if (item.createdAt) {
                    if (item.createdAt.$date) {
                        createdAt = new Date(item.createdAt.$date);
                    } else {
                        createdAt = new Date(item.createdAt);
                    }
                }
                
                transformedData.push({
                    username,
                    password,
                    displayName,
                    role,
                    createdAt
                });
                console.log(`  ✅ 第 ${i + 1} 条数据验证通过`);
            } catch (error) {
                errors.push(`第 ${i + 1} 条数据处理失败: ${error.message}`);
                console.error(`  ❌ 处理失败:`, error.message);
            }
        }
        
        console.log(`验证完成，准备导入 ${transformedData.length} 条数据，跳过/失败 ${dataArray.length - transformedData.length} 条`);
        
        // 如果没有新数据可导入，返回清晰的反馈
        if (transformedData.length === 0) {
            let message = '没有有效的管理员数据可导入';
            
            // 根据情况提供更具体的反馈
            if (existingUsernames.length > 0 && errors.length === 0) {
                message = `所有管理员账户已存在，无需导入。已存在的账户：${existingUsernames.join(', ')}`;
            } else if (existingUsernames.length > 0 && errors.length > 0) {
                message = `部分账户已存在，部分数据格式错误。已存在的账户：${existingUsernames.join(', ')}`;
            } else if (errors.length > 0) {
                message = '数据格式错误，请检查JSON文件格式';
            }
            
            console.log(message);
            return res.status(400).json({
                success: false,
                message: message,
                details: {
                    totalReceived: dataArray.length,
                    existingCount: existingUsernames.length,
                    errorCount: errors.length,
                    existingUsernames: existingUsernames,
                    errors: errors,
                    skippedUsers: skippedUsers
                }
            });
        }
        
        console.log(`准备导入 ${transformedData.length} 条管理员数据`);
        
        // 批量插入数据
        let savedUsers = [];
        let failedCount = 0;
        
        try {
            savedUsers = await User.insertMany(transformedData, {
                ordered: false  // 即使某条失败，也继续插入其他
            });
            console.log(`成功导入 ${savedUsers.length} 个管理员账户`);
        } catch (insertError) {
            if (insertError.writeErrors) {
                failedCount = insertError.writeErrors.length;
                savedUsers = insertError.insertedDocs || [];
                console.error(`${failedCount} 条记录插入失败`);
            } else {
                console.error('数据库保存失败:', insertError);
                return res.status(400).json({
                    success: false,
                    message: '数据库保存失败',
                    error: insertError.message
                });
            }
        }
        
        // 返回结果（不包含密码）
        const userResponses = savedUsers.map(user => ({
            id: user._id.toString(),
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            createdAt: user.createdAt
        }));
        
        res.status(201).json({
            success: true,
            message: `成功导入 ${savedUsers.length} 个管理员账户`,
            importedCount: savedUsers.length,
            failedCount: failedCount,
            skippedCount: dataArray.length - transformedData.length - failedCount,
            totalCount: dataArray.length,
            users: userResponses,
            errors: errors.length > 0 ? errors : undefined
        });
        
    } catch (error) {
        console.error('批量导入管理员失败:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({
            success: false,
            message: '批量导入管理员失败',
            error: error.message
        });
    }
};