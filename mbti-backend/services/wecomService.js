/**
 * 企业微信智能表格推送服务
 */

const axios = require('axios');

// 企业微信 Webhook 配置
const WECOM_WEBHOOK_URL = process.env.WECOM_WEBHOOK_URL || '';

/**
 * 格式化维度得分
 * @param {Array} dimensionScores - 维度得分数组
 * @returns {string} - 格式化后的字符串，如 "ENTP | E17I4-N14S12-T15F9-J9P13"
 */
const formatDimensionScores = (dimensionScores) => {
    if (!dimensionScores || !Array.isArray(dimensionScores) || dimensionScores.length === 0) {
        return '';
    }

    const dimensionPairs = [
        ['E', 'I'],
        ['N', 'S'],
        ['T', 'F'],
        ['J', 'P']
    ];

    const parts = [];
    dimensionPairs.forEach(pair => {
        const dim1 = dimensionScores.find(d => d.dimension === pair[0]);
        const dim2 = dimensionScores.find(d => d.dimension === pair[1]);
        if (dim1 && dim2) {
            parts.push(`${pair[0]}${dim1.score}${pair[1]}${dim2.score}`);
        }
    });

    return parts.join('-');
};

/**
 * 推送测试结果到企业微信智能表格
 * @param {Object} result - 测试结果对象
 * @returns {Promise<boolean>} - 推送是否成功
 */
const pushToWeCom = async (result) => {
    try {
        if (!WECOM_WEBHOOK_URL) {
            console.log('⚠️  未配置企业微信 Webhook，跳过推送');
            return false;
        }

        const mbtiType = result.test_results?.mbti_type || '未分类';
        const dimensionScores = result.test_results?.dimension_scores || [];
        const scoreText = formatDimensionScores(dimensionScores);
        const fullResult = `${mbtiType} | ${scoreText}`;

        // 准备推送数据
        const payload = {
            // 根据企业微信智能表格 Webhook 格式调整
            data: {
                姓名: result.user_info?.name || '未提供',
                英文名: result.user_info?.english_name || '',
                邮箱: result.user_info?.email || '',
                性别: result.user_info?.gender || '',
                年龄: result.user_info?.age || '',
                学历: result.user_info?.education || '',
                MBTI类型: mbtiType,
                详细结果: fullResult,
                测试ID: result.test_results?.test_id || '',
                提交时间: new Date().toLocaleString('zh-CN'),
                候选人类型: result.candidate_type || 'interview'
            }
        };

        console.log('📤 正在推送数据到企业微信:', payload);

        const response = await axios.post(WECOM_WEBHOOK_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data && response.data.errcode === 0) {
            console.log('✅ 企业微信推送成功');
            return true;
        } else {
            console.error('❌ 企业微信推送失败:', response.data);
            return false;
        }

    } catch (error) {
        console.error('❌ 企业微信推送错误:', error.message);
        return false;
    }
};

/**
 * 批量推送测试结果到企业微信
 * @param {Array} results - 测试结果数组
 * @returns {Promise<Object>} - 推送结果统计
 */
const batchPushToWeCom = async (results) => {
    const stats = {
        total: results.length,
        success: 0,
        failed: 0
    };

    for (const result of results) {
        const success = await pushToWeCom(result);
        if (success) {
            stats.success++;
        } else {
            stats.failed++;
        }
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return stats;
};

module.exports = {
    pushToWeCom,
    batchPushToWeCom,
    formatDimensionScores
};
