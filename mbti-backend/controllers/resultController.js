const Result = require('../models/Result');
const { pushToWeCom, batchPushToWeCom } = require('../services/wecomService');

// 提交测试结果 - 完全适配前端数据结构
exports.submitTest = async (req, res) => {
    try {
        const { user_info, test_results, metadata } = req.body;

        // 验证必要字段
        if (!user_info || !user_info.name || !user_info.email) {
            return res.status(400).json({
                success: false,
                message: '姓名和邮箱为必填项'
            });
        }

        if (!test_results || !test_results.mbti_type) {
            return res.status(400).json({
                success: false,
                message: 'MBTI类型为必填项'
            });
        }

        // 补充自动生成的元数据
        const enhancedMetadata = {
            ...metadata,
            submission_time: new Date().toISOString(),
            ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            user_agent: req.headers['user-agent']
        };

        // 创建结果记录
        const result = new Result({
            user_info,
            test_results,
            metadata: enhancedMetadata
        });

        await result.save();

        // 异步推送数据到企业微信（不阻塞响应）
        pushToWeCom(result).catch(error => {
            console.error('企业微信推送失败:', error);
        });

        // 返回与前端API一致的结构
        res.status(201).json({
            success: true,
            message: '测试结果已成功提交',
            test_id: result.test_results.test_id || `MBTI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            submission_time: result.submission_time.toISOString(),
            result_id: result._id
        });

    } catch (error) {
        console.error('提交测试结果错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
};

// 获取测试结果 - 适配前端数据结构
exports.getResults = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = '-submission_time',
            search = '',
            mbti_type = '',
            status = '',
            candidate_type = '',
            date_from = '',
            date_to = ''
        } = req.query;

        // 构建查询条件
        const query = {};

        // 搜索条件
        if (search) {
            query.$or = [
                { 'user_info.name': { $regex: search, $options: 'i' } },
                { 'user_info.email': { $regex: search, $options: 'i' } },
                { 'test_results.mbti_type': { $regex: search, $options: 'i' } }
            ];
        }

        // MBTI类型筛选
        if (mbti_type) {
            query['test_results.mbti_type'] = mbti_type;
        }

        // 状态筛选
        if (status) {
            query.status = status;
        }

        // 日期范围筛选
        if (date_from || date_to) {
            query.submission_time = {};
            if (date_from) query.submission_time.$gte = new Date(date_from);
            if (date_to) query.submission_time.$lte = new Date(date_to);
        }

        // 候选人类型筛选
        if (candidate_type) {
            query.candidate_type = candidate_type;
        }

        // 计算跳过的文档数
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 执行查询
        const results = await Result.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // 获取总数
        const total = await Result.countDocuments(query);

        res.json({
            success: true,
            data: {
                results: results,
                total: total
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('获取测试结果错误:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
};

// 获取统计数据
exports.getStatistics = async (req, res) => {
    try {
        // 总测试数
        const totalTests = await Result.countDocuments();
        
        // 今日测试数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTests = await Result.countDocuments({
            submission_time: { $gte: today }
        });
        
        // 待审核数量
        const pendingReview = await Result.countDocuments({
            status: 'pending'
        });
        
        // 独立用户数
        const uniqueUsers = await Result.distinct('user_info.email').then(emails => emails.length);

        // MBTI类型分布
        const typeDistribution = await Result.aggregate([
            {
                $group: {
                    _id: "$test_results.mbti_type",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 部门分布
        const departmentDistribution = await Result.aggregate([
            {
                $match: { 'user_info.purpose': { $ne: '' } }
            },
            {
                $group: {
                    _id: "$user_info.purpose",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 地区分布
        const regionDistribution = await Result.aggregate([
            {
                $match: { 'user_info.region': { $ne: '' } }
            },
            {
                $group: {
                    _id: "$user_info.region",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 最近7天的提交趋势
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const timeDistribution = await Result.aggregate([
            {
                $match: {
                    submission_time: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$submission_time"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalTests,
                todayTests,
                pendingReview,
                uniqueUsers,
                typeDistribution,
                departmentDistribution,
                regionDistribution,
                timeDistribution
            }
        });

    } catch (error) {
        console.error('获取统计数据错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败',
            error: error.message
        });
    }
};

// 导出CSV
exports.exportCSV = async (req, res) => {
    try {
        const { ids } = req.body;
        
        let query = {};
        if (ids && Array.isArray(ids) && ids.length > 0) {
            query = { _id: { $in: ids } };
        }

        const results = await Result.find(query).sort({ submission_time: -1 });

        // CSV头部
        const headers = [
            'ID',
            '姓名',
            '年龄',
            '性别',
            '邮箱',
            '求职类型',
            '学历',
            '投递部门',
            '地区',
            '毕业院校',
            'MBTI类型',
            '测试耗时(秒)',
            '提交时间',
            'IP地址'
        ];

        // 生成CSV数据行
        const csvRows = results.map(result => [
            result._id,
            result.user_info.name,
            result.user_info.age || '',
            result.user_info.gender || '',
            result.user_info.email,
            result.user_info.Employment || '',
            result.user_info.education || '',
            result.user_info.purpose || '',
            result.user_info.region || '',
            result.user_info.organization || '',
            result.test_results.mbti_type,
            result.test_results.test_duration || '',
            result.submission_time.toISOString(),
            result.metadata?.ip_address || ''
        ]);

        // 组合CSV内容
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // 设置响应头
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=mbti-results-${new Date().toISOString().split('T')[0]}.csv`);

        res.send(csvContent);

    } catch (error) {
        console.error('导出CSV错误:', error);
        res.status(500).json({
            success: false,
            message: '导出数据失败',
            error: error.message
        });
    }
};

// 更新被测者英文名字
exports.updateEnglishName = async (req, res) => {
    try {
        const { english_name } = req.body;
        
        if (!english_name) {
            return res.status(400).json({
                success: false,
                message: '英文名字不能为空'
            });
        }

        const result = await Result.findByIdAndUpdate(
            req.params.id,
            { $set: { 'user_info.english_name': english_name } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: '未找到该测试结果'
            });
        }

        res.json({
            success: true,
            message: '英文名字已成功更新',
            data: {
                id: result._id,
                english_name: result.user_info.english_name
            }
        });

    } catch (error) {
        console.error('更新英文名字错误:', error);
        res.status(500).json({
            success: false,
            message: '更新失败',
            error: error.message
        });
    }
};

// 更新候选人类型
exports.updateCandidateType = async (req, res) => {
    try {
        console.log('后端收到更新候选人类型请求:', req.body);
        console.log('请求参数:', req.params);
        
        const { candidate_type } = req.body;
        
        // 验证候选人类型
        const validTypes = ['interview', 'employee', 'former'];
        console.log('有效类型:', validTypes);
        console.log('请求类型:', candidate_type);
        
        if (!validTypes.includes(candidate_type)) {
            return res.status(400).json({
                success: false,
                message: `候选人类型无效，有效值: ${validTypes.join(', ')}`
            });
        }

        const result = await Result.findByIdAndUpdate(
            req.params.id,
            { $set: { candidate_type } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: '未找到该测试结果'
            });
        }

        res.json({
            success: true,
            message: '候选人类型已成功更新',
            data: {
                id: result._id,
                candidate_type: result.candidate_type
            }
        });

    } catch (error) {
        console.error('更新候选人类型错误:', error);
        res.status(500).json({
            success: false,
            message: '更新失败',
            error: error.message
        });
    }
};

// 上传测试数据
exports.uploadTestData = async (req, res) => {
    try {
        const uploadedData = req.body;
        
        // 验证数据格式
        if (!Array.isArray(uploadedData)) {
            return res.status(400).json({
                success: false,
                message: '上传的数据必须是JSON数组格式'
            });
        }

        // 数据转换和导入逻辑
        let importedCount = 0;
        let skippedCount = 0;

        for (const item of uploadedData) {
            try {
                // 检查数据是否已存在
                const existingRecord = await Result.findOne({
                    'user_info.name': item.user_info?.name,
                    'submission_time': item.submission_time
                });

                if (existingRecord) {
                    skippedCount++;
                    continue;
                }

                // 创建新记录
                const newResult = new Result(item);
                await newResult.save();
                importedCount++;
            } catch (itemError) {
                console.error('导入单条数据失败:', itemError.message);
                continue;
            }
        }

        res.json({
            success: true,
            message: '数据导入完成',
            totalCount: uploadedData.length,
            importedCount: importedCount,
            skippedCount: skippedCount
        });
    } catch (error) {
        console.error('上传数据处理失败:', error);
        res.status(500).json({
            success: false,
            message: '数据处理失败',
            error: error.message
        });
    }
};

// 上传单个JSON文件并导入（支持批量导入）
exports.uploadJsonFile = async (req, res) => {
    try {
        console.log('开始处理JSON文件上传...');
        console.log('请求方法:', req.method);
        console.log('请求路径:', req.path);
        console.log('请求体是否存在:', !!req.body);
        console.log('请求体类型:', typeof req.body);
        
        // 检查请求体是否为空
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('请求体为空');
            return res.status(400).json({
                success: false,
                message: '请求体为空，请上传有效的JSON数据'
            });
        }
        
        // 尝试安全地获取请求体长度
        let bodyLength = 0;
        try {
            bodyLength = JSON.stringify(req.body).length;
            console.log('请求体长度:', bodyLength);
        } catch (stringifyError) {
            console.error('请求体序列化失败:', stringifyError);
        }
        
        let jsonData = req.body;
        
        // 判断是单条数据还是数组
        let dataArray = [];
        if (Array.isArray(jsonData)) {
            dataArray = jsonData;
            console.log(`检测到数组格式，包含 ${dataArray.length} 条数据`);
        } else {
            dataArray = [jsonData];
            console.log('检测到单条数据格式');
        }
        
        // 数据清洗：处理 dirty data
        dataArray.forEach(item => {
            if (item.user_info && item.user_info.age === "未提供") {
                item.user_info.age = null;
            }
        });
        
        // 处理候选类型映射
        const mapCandidateType = (type) => {
            if (type === 'intern') {
                return 'interview';
            }
            const validTypes = ['interview', 'employee', 'former'];
            return validTypes.includes(type) ? type : 'interview';
        };
        
        // 处理百分比值转换
        const processDimensionScores = (scores) => {
            if (!Array.isArray(scores)) return [];
            return scores.map(item => {
                let percentage = item['百分比'] || item.percentage || 0;
                if (typeof percentage === 'string') {
                    percentage = parseFloat(percentage.replace(/[^\d.]/g, '')) || 0;
                }
                
                let score = item['得分'] || item.score || 0;
                if (typeof score === 'string') {
                    score = parseFloat(score) || 0;
                }
                
                return {
                    dimension: item['维度'] || item.dimension,
                    score: score,
                    percentage: percentage
                };
            });
        };
        
        // 转换单条数据的函数
        const transformSingleData = (item, index) => {
            try {
                const testId = `MBTI-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
                
                // 处理候选人类型
                let candidateType = item['候选人类型'] || item['candidate_type'] || item.candidate_type;
                if (!candidateType) {
                    const employmentType = item['用户信息']?.['求职类型'] || item['求职类型'] || 
                                          item.user_info?.employment || item.employment;
                    if (employmentType === '实习' || employmentType === '全职' || employmentType === '兼职') {
                        candidateType = 'interview';
                    } else {
                        candidateType = 'interview';
                    }
                }
                
                // 处理投递部门/目的
                let purpose = item['用户信息']?.['投递部门'] || item['投递部门'] || 
                             item.user_info?.purpose || item.purpose || '';
                if (!purpose) {
                    purpose = item['用户信息']?.['部门'] || item['部门'] || 
                             item.user_info?.department || item.department || '';
                }
                
                // 处理提交时间
                let submissionTime;
                if (item.submission_time) {
                    if (item.submission_time.$date) {
                        submissionTime = new Date(item.submission_time.$date);
                    } else {
                        submissionTime = new Date(item.submission_time);
                    }
                } else if (item['测试信息']?.['提交时间']) {
                    submissionTime = new Date(item['测试信息']['提交时间']);
                } else {
                    submissionTime = new Date();
                }
                
                // 处理元数据中的提交时间
                let metadataSubmissionTime;
                if (item.metadata?.submission_time) {
                    if (item.metadata.submission_time.$date) {
                        metadataSubmissionTime = new Date(item.metadata.submission_time.$date);
                    } else {
                        metadataSubmissionTime = new Date(item.metadata.submission_time);
                    }
                } else {
                    metadataSubmissionTime = submissionTime;
                }
                
                return {
                    user_info: {
                        name: item['用户信息']?.['姓名'] || item['姓名'] || 
                              item.user_info?.name || item.name || '未知',
                        english_name: item['用户信息']?.['英文名'] || item['英文名'] || 
                                     item.user_info?.english_name || item.english_name || '',
                        age: item['用户信息']?.['年龄'] || item['年龄'] || 
                             item.user_info?.age || item.age || null,
                        gender: item['用户信息']?.['性别'] || item['性别'] || 
                                item.user_info?.gender || item.gender || '',
                        email: item['用户信息']?.['邮箱'] || item['邮箱'] || 
                               item.user_info?.email || item.email || '',
                        employment: item['用户信息']?.['求职类型'] || item['求职类型'] || 
                                   item.user_info?.employment || item.employment || '',
                        purpose: purpose,
                        education: item['用户信息']?.['学历'] || item['学历'] || 
                                  item.user_info?.education || item.education || '',
                        organization: item['用户信息']?.['毕业院校'] || item['毕业院校'] || 
                                     item.user_info?.organization || item.organization || 
                                     item['用户信息']?.['组织'] || item['组织'] || '',
                        region: item['用户信息']?.['所在地区'] || item['所在地区'] || 
                                item.user_info?.region || item.region || '',
                        comments: item['用户信息']?.['用户备注'] || item['用户备注'] || 
                                 item.user_info?.comments || item.comments || ''
                    },
                    candidate_type: mapCandidateType(candidateType),
                    test_results: {
                        mbti_type: item['测试信息']?.['MBTI类型'] || item['MBTI类型'] || 
                                  item.test_results?.mbti_type || item.mbti_type || '未知',
                        dimension_scores: processDimensionScores(
                            item['维度得分'] || item.test_results?.dimension_scores || 
                            item.dimension_scores || []
                        ),
                        answers: (item['答题详情'] || item.test_results?.answers || 
                                 item.answers || []).map(ans => ({
                            question_id: ans['题号'] || ans.question_id,
                            question: ans['问题'] || ans.question,
                            selected_option: ans['用户选择'] || ans['answer'] || 
                                            ans.selected_option || ans.answer || '',
                            score: ans['得分'] || ans['score'] || ans.score || ''
                        })),
                        test_duration: item['测试信息']?.['测试时长'] || item['测试时长'] || 
                                      item.test_results?.test_duration || item.test_duration || 0,
                        test_id: item.test_results?.test_id || item.test_id || testId
                    },
                    metadata: {
                        test_version: item['元数据']?.['测试版本'] || item['测试版本'] || 
                                     item.metadata?.test_version || item.test_version || '2.0',
                        platform: item['元数据']?.['测试平台'] || item['测试平台'] || 
                                 item.metadata?.platform || item.platform || 'web',
                        ip_address: item['元数据']?.['IP地址'] || item['IP地址'] || 
                                   item.metadata?.ip_address || item.ip_address || '',
                        user_agent: item['元数据']?.['设备信息'] || item['设备信息'] || 
                                   item.metadata?.user_agent || item.user_agent || '',
                        screen_resolution: item.metadata?.screen_resolution || '',
                        submission_time: metadataSubmissionTime
                    },
                    submission_time: submissionTime,
                    status: item['审核信息']?.['当前状态'] || item['状态'] || 
                           item.status || 'pending',
                    review_notes: item.review_notes || '',
                    reviewed_by: item.reviewed_by || null,
                    reviewed_at: item.reviewed_at || null
                };
            } catch (error) {
                console.error(`转换第 ${index + 1} 条数据失败:`, error);
                throw error;
            }
        };
        
        // 批量转换数据
        console.log('开始转换数据格式...');
        let transformedDataArray = [];
        try {
            transformedDataArray = dataArray.map((item, index) => {
                console.log(`转换第 ${index + 1}/${dataArray.length} 条数据...`);
                return transformSingleData(item, index);
            });
            console.log(`成功转换 ${transformedDataArray.length} 条数据`);
        } catch (transformError) {
            console.error('数据格式转换失败:', transformError);
            return res.status(400).json({
                success: false,
                message: '数据格式转换失败',
                error: transformError.message
            });
        }
        
        // 批量保存到数据库
        console.log('开始批量保存到数据库...');
        let savedResults = [];
        let failedCount = 0;
        
        try {
            // 使用 insertMany 批量插入，性能更好
            savedResults = await Result.insertMany(transformedDataArray, { 
                ordered: false  // 即使某条失败，也继续插入其他
            });
            console.log(`成功保存 ${savedResults.length} 条记录`);
        } catch (insertError) {
            // 如果有部分插入失败
            if (insertError.writeErrors) {
                failedCount = insertError.writeErrors.length;
                savedResults = insertError.insertedDocs || [];
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
        
        res.status(201).json({
            success: true,
            message: `JSON文件导入成功，共导入 ${savedResults.length} 条记录`,
            importedCount: savedResults.length,
            failedCount: failedCount,
            totalCount: dataArray.length,
            resultIds: savedResults.map(r => r._id)
        });
        
    } catch (error) {
        console.error('JSON文件导入失败:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({
            success: false,
            message: 'JSON文件导入失败',
            error: error.message
        });
    }
};

// 批量更新结果状态
exports.batchUpdateStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        
        // 验证状态值
        const validStatuses = ['pending', 'processed', 'rejected', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `状态值无效，有效值: ${validStatuses.join(', ')}`
            });
        }
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要更新的结果ID数组'
            });
        }
        
        // 处理更新请求
        let updateResult;
        try {
            // 尝试使用字符串ID直接更新
            updateResult = await Result.updateMany(
                { _id: { $in: ids } },
                {
                    $set: {
                        status,
                        reviewed_by: req.user?.username || 'admin',
                        reviewed_at: new Date()
                    }
                }
            );
            console.log(`批量更新结果状态: ${updateResult.modifiedCount} 条记录`);
        } catch (error) {
            console.error('直接更新失败，尝试转换为ObjectId:', error.message);
            
            // 如果直接更新失败，尝试转换为ObjectId
            const mongoose = require('mongoose');
            const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
            
            updateResult = await Result.updateMany(
                { _id: { $in: objectIds } },
                {
                    $set: {
                        status,
                        reviewed_by: req.user?.username || 'admin',
                        reviewed_at: new Date()
                    }
                }
            );
            console.log(`转换为ObjectId后批量更新: ${updateResult.modifiedCount} 条记录`);
        }
        
        res.json({
            success: true,
            message: `成功更新 ${updateResult.modifiedCount} 条测试结果的状态`,
            modifiedCount: updateResult.modifiedCount,
            updatedIds: ids
        });
        
    } catch (error) {
        console.error('批量更新状态错误:', error);
        res.status(500).json({
            success: false,
            message: '批量更新状态失败',
            error: error.message
        });
    }
};

// 手动推送测试结果到企业微信
exports.pushToWeComManual = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 查找测试结果
        const result = await Result.findById(id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '未找到该测试结果'
            });
        }
        
        // 推送到企业微信
        const success = await pushToWeCom(result);
        
        if (success) {
            res.json({
                success: true,
                message: '已成功推送到企业微信智能表格',
                data: {
                    id: result._id,
                    name: result.user_info?.name,
                    mbti_type: result.test_results?.mbti_type
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: '推送到企业微信失败，请检查 Webhook 配置'
            });
        }
        
    } catch (error) {
        console.error('手动推送企业微信错误:', error);
        res.status(500).json({
            success: false,
            message: '推送失败',
            error: error.message
        });
    }
};

// 批量推送测试结果到企业微信
exports.batchPushToWeCom = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要推送的结果ID数组'
            });
        }
        
        // 查找所有指定的结果
        const results = await Result.find({ _id: { $in: ids } });
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定的测试结果'
            });
        }
        
        // 批量推送
        const stats = await batchPushToWeCom(results);
        
        res.json({
            success: true,
            message: `批量推送完成，成功 ${stats.success} 条，失败 ${stats.failed} 条`,
            stats
        });
        
    } catch (error) {
        console.error('批量推送企业微信错误:', error);
        res.status(500).json({
            success: false,
            message: '批量推送失败',
            error: error.message
        });
    }
};

// 获取单个测试结果详情
exports.getResultDetail = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '未找到该测试结果'
            });
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('获取测试结果详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
};

// 更新测试结果状态
exports.updateStatus = async (req, res) => {
    try {
        const { status, review_notes, notify_user } = req.body;
        
        const validStatuses = ['pending', 'processed', 'rejected', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `状态值无效，有效值: ${validStatuses.join(', ')}`
            });
        }
        
        const result = await Result.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status,
                    review_notes,
                    reviewed_by: req.user?.username || 'admin',
                    reviewed_at: new Date()
                }
            },
            { new: true }
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '未找到该测试结果'
            });
        }
        
        res.json({
            success: true,
            message: '状态更新成功',
            data: result
        });
    } catch (error) {
        console.error('更新状态错误:', error);
        res.status(500).json({
            success: false,
            message: '更新失败',
            error: error.message
        });
    }
};

// 删除单个测试结果
exports.deleteResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '未找到该测试结果'
            });
        }
        
        res.json({
            success: true,
            message: '删除成功',
            data: { id: req.params.id }
        });
    } catch (error) {
        console.error('删除结果错误:', error);
        res.status(500).json({
            success: false,
            message: '删除失败',
            error: error.message
        });
    }
};

// 批量删除测试结果
exports.batchDeleteResults = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要删除的结果ID数组'
            });
        }
        
        const deleteResult = await Result.deleteMany({ _id: { $in: ids } });
        
        res.json({
            success: true,
            message: `成功删除 ${deleteResult.deletedCount} 条测试结果`,
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('批量删除错误:', error);
        res.status(500).json({
            success: false,
            message: '批量删除失败',
            error: error.message
        });
    }
};
