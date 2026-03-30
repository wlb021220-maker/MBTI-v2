// data/dimensionData.js
export const dimensionExplanations = {
    'E-I': {
        description: '精力支配方式',
        E: {
            name: '外向型',
            characteristics: [
                '喜欢与人交往',
                '表达想法和感受',
                '行动先于思考',
                '通过社交获取能量'
            ]
        },
        I: {
            name: '内向型',
            characteristics: [
                '喜欢独处或小团体',
                '深入思考后表达',
                '思考先于行动',
                '通过独处恢复能量'
            ]
        }
    },
    'S-N': {
        description: '信息获取方式',
        S: {
            name: '实感型',
            characteristics: [
                '关注具体事实',
                '注重实际经验',
                '循序渐进',
                '相信现实数据'
            ]
        },
        N: {
            name: '直觉型',
            characteristics: [
                '关注抽象概念',
                '注重未来可能',
                '跳跃思维',
                '相信直觉灵感'
            ]
        }
    },
    'T-F': {
        description: '决策方式',
        T: {
            name: '思维型',
            characteristics: [
                '注重逻辑分析',
                '追求客观公正',
                '理性决策',
                '关注事物规律'
            ]
        },
        F: {
            name: '情感型',
            characteristics: [
                '注重情感价值',
                '追求人际和谐',
                '感性决策',
                '关注他人感受'
            ]
        }
    },
    'J-P': {
        description: '生活态度',
        J: {
            name: '判断型',
            characteristics: [
                '喜欢计划和条理',
                '重视目标达成',
                '决定果断',
                '偏好确定性'
            ]
        },
        P: {
            name: '感知型',
            characteristics: [
                '喜欢灵活适应',
                '重视过程体验',
                '决定审慎',
                '偏好开放性'
            ]
        }
    }
}

// 维度描述文本
export const getDimensionScoreText = (dimension, score) => {
    const ranges = {
        'E-I': {
            high: '明显外向倾向',
            medium: '中等外向倾向',
            low: '内向倾向',
            balanced: '内外向平衡'
        },
        'S-N': {
            high: '明显直觉倾向',
            medium: '中等直觉倾向',
            low: '实感倾向',
            balanced: '实感直觉平衡'
        },
        'T-F': {
            high: '明显思维倾向',
            medium: '中等思维倾向',
            low: '情感倾向',
            balanced: '思维情感平衡'
        },
        'J-P': {
            high: '明显判断倾向',
            medium: '中等判断倾向',
            low: '感知倾向',
            balanced: '判断感知平衡'
        }
    }
    
    if (score >= 70) return ranges[dimension].high
    if (score >= 60) return ranges[dimension].medium
    if (score >= 40 && score <= 60) return ranges[dimension].balanced
    return ranges[dimension].low
}