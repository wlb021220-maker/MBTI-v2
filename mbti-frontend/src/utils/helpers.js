// 工具函数集合

/**
 * 生成随机ID
 * @param {Number} length - ID长度
 * @returns {String} 随机ID
 */
export const generateId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * 格式化日期
 * @param {Date|String} date - 日期
 * @param {String} format - 格式
 * @returns {String} 格式化后的日期
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

/**
 * 验证邮箱格式
 * @param {String} email - 邮箱地址
 * @returns {Boolean} 是否有效
 */
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

/**
 * 深度复制对象
 * @param {Object} obj - 要复制的对象
 * @returns {Object} 复制后的对象
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {Number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {Number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit) => {
    let inThrottle
    return function () {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * 安全获取对象属性
 * @param {Object} obj - 对象
 * @param {String} path - 属性路径
 * @param {*} defaultValue - 默认值
 * @returns {*} 属性值
 */
export const get = (obj, path, defaultValue = null) => {
    const travel = (regexp) =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
    return result === undefined || result === obj ? defaultValue : result
}

/**
 * 数组去重
 * @param {Array} array - 数组
 * @returns {Array} 去重后的数组
 */
export const uniqueArray = (array) => {
    return [...new Set(array)]
}

/**
 * 生成测试结果摘要
 * @param {Object} testData - 测试数据
 * @returns {String} 摘要
 */
export const generateTestSummary = (testData) => {
    const { userInfo, mbtiType, dimensionScores } = testData
    return `
测试结果摘要:
- 姓名: ${userInfo.name}
- MBTI类型: ${mbtiType}
- 各维度得分: ${dimensionScores.map(d => `${d.dimension}: ${d.score}`).join(', ')}
- 提交时间: ${new Date().toLocaleString('zh-CN')}
  `.trim()
}

export default {
    generateId,
    formatDate,
    validateEmail,
    deepClone,
    debounce,
    throttle,
    get,
    uniqueArray,
    generateTestSummary
}