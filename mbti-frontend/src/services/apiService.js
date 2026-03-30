// apiService.js - 修复版本
class ApiService {
    constructor() {
        // 确保这里指向正确的后端地址
        this.baseURL = '/api'  // 使用相对路径，通过前端服务器代理

        // 实际API端点（与后端完全匹配）
        this.endpoints = {
            submitTest: '/submit-test',
            adminLogin: '/admin/login',
            getResults: '/admin/results',
            getStatistics: '/admin/statistics',
            getCurrentUser: '/admin/me',
            exportCSV: '/admin/export/csv',
            createAdmin: '/admin/create',
            changePassword: '/admin/change-password',
            uploadJson: '/admin/results/upload-json'
        }
    }

    /**
     * 提交测试结果到后端
     * @param {Object} data - 测试数据
     * @returns {Promise} - API响应
     */
    async submitTestResults(data) {
        try {
            console.log('开始提交测试结果，数据:', data)

            // 准备提交数据，完全匹配后端结构
            const submissionData = {
                user_info: data.userInfo,
                test_results: {
                    mbti_type: data.mbtiType,
                    dimension_scores: data.dimensionScores,
                    answers: data.answers,
                    test_duration: data.testDuration,
                    test_id: data.testId || this.generateTestId(),
                    submission_time: new Date().toISOString()
                },
                metadata: {
                    test_version: '2.0',
                    platform: 'web',
                    user_agent: navigator.userAgent,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    ip_address: await this.getClientIP()
                }
            }

            console.log('发送请求到:', `${this.baseURL}${this.endpoints.submitTest}`)
            console.log('请求数据:', submissionData)

            const response = await fetch(`${this.baseURL}${this.endpoints.submitTest}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            })

            console.log('响应状态:', response.status)

            // 尝试解析响应文本
            const responseText = await response.text()
            console.log('响应内容:', responseText)

            let result
            try {
                result = JSON.parse(responseText)
            } catch (e) {
                console.error('响应不是有效的JSON:', responseText)
                throw new Error('服务器响应格式错误')
            }

            if (!response.ok) {
                throw new Error(result.message || `API错误: ${response.status}`)
            }

            console.log('提交成功:', result)
            return result

        } catch (error) {
            console.error('提交测试结果时出错:', error)
            throw error
        }
    }

    /**
     * 生成测试ID
     * @returns {String}
     */
    generateTestId() {
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 10000)
        return `MBTI-${timestamp}-${random.toString().padStart(4, '0')}`
    }

    /**
     * 管理员登录（用于查看结果）
     * @param {String} username - 用户名
     * @param {String} password - 密码
     * @returns {Promise} - 登录响应
     */
    async adminLogin(username, password) {
        try {
            console.log('尝试登录:', { username })

            const response = await fetch(`${this.baseURL}${this.endpoints.adminLogin}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            const result = await response.json()
            console.log('登录响应:', result)

            if (!response.ok) {
                throw new Error(result.message || '登录失败')
            }

            // 确保返回的数据结构正确
            if (result.token && result.user) {
                // 保存token和用户信息到localStorage
                localStorage.setItem('admin_token', result.token)
                localStorage.setItem('admin_user', JSON.stringify(result.user))

                console.log('登录成功，用户信息已保存:', result.user)
                return result
            } else {
                throw new Error('服务器返回的数据格式不正确')
            }
        } catch (error) {
            console.error('管理员登录时出错:', error)
            // 清理可能存在的错误数据
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_user')
            throw error
        }
    }

    /**
     * 获取测试结果（需要管理员权限）
     * @param {Object} filters - 筛选条件
     * @returns {Promise} - 结果数据
     */
    async getTestResults(filters = {}) {
    try {
        // 获取token
        const token = localStorage.getItem('admin_token')

        if (!token) {
            throw new Error('未登录，请先登录')
        }

        // 构建查询参数 - 修正参数名与后端一致
        const params = new URLSearchParams()
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                // 将前端参数名映射到后端参数名
                const paramMap = {
                    'page': 'page',
                    'limit': 'limit',
                    'search': 'search',
                    'selectedType': 'mbti_type',
                    'dateFrom': 'date_from',
                    'dateTo': 'date_to',
                    'candidate_type': 'candidate_type', // 确保candidate_type被正确处理
                    'candidateTypeFilter': 'candidate_type' // 添加candidateTypeFilter到candidate_type的映射
                }
                const backendKey = paramMap[key] || key
                params.append(backendKey, filters[key])
            }
        })

        const url = `${this.baseURL}${this.endpoints.getResults}?${params.toString()}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const result = await response.json()

        if (!response.ok) {
            // 如果返回401，可能是token过期
            if (response.status === 401) {
                this.logout()
                throw new Error('登录已过期，请重新登录')
            }
            throw new Error(result.message || '获取数据失败')
        }

        return result
    } catch (error) {
        console.error('获取测试结果时出错:', error)
        throw error
    }
}

    /**
     * 获取统计数据
     * @returns {Promise} - 统计数据
     */
    async getStatistics() {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.getStatistics}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '获取统计数据失败')
            }

            return result
        } catch (error) {
            console.error('获取统计数据时出错:', error)
            throw error
        }
    }

    /**
     * 导出数据为CSV
     * @returns {Promise} - CSV文件
     */
    async exportToCSV() {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.exportCSV}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || '导出数据失败')
            }

            // 创建下载链接
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            const filename = `mbti-results-${new Date().toISOString().split('T')[0]}.csv`

            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            return { success: true, filename }
        } catch (error) {
            console.error('导出CSV时出错:', error)
            throw error
        }
    }

    /**
     * 获取当前登录用户信息
     * @returns {Promise} - 用户信息
     */
    async getCurrentUser() {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                return { success: false, user: null }
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.getCurrentUser}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                localStorage.removeItem('admin_token')
                localStorage.removeItem('admin_user')
                return { success: false, user: null }
            }

            const result = await response.json()
            return result
        } catch (error) {
            console.error('获取用户信息时出错:', error)
            return { success: false, user: null }
        }
    }

    /**
     * 获取客户端IP（备用方法）
     * @returns {Promise<String>} - IP地址
     */
    async getClientIP() {
        try {
            // 使用免费IP API
            const response = await fetch('https://api.ipify.org?format=json', {
                timeout: 5000
            })
            const data = await response.json()
            return data.ip
        } catch (error) {
            console.warn('无法获取IP地址:', error)
            return 'unknown'
        }
    }

    /**
     * 登出
     */
    logout() {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
    }

    /**
     * 检查是否已登录
     * @returns {Boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem('admin_token')
    }

    /**
 * 更新测试结果状态
 * @param {String} id - 结果ID
 * @param {String} status - 新状态
 * @param {String} notes - 审核备注
 * @returns {Promise}
 */
    async updateResultStatus(id, status, notes = '', notifyUser = false) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}/admin/results/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status,
                    review_notes: notes,
                    notify_user: notifyUser
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '更新状态失败')
            }

            return result
        } catch (error) {
            console.error('更新状态时出错:', error)
            throw error
        }
    }

    /**
     * 删除测试结果
     * @param {String} id - 结果ID
     * @returns {Promise}
     */
    async deleteResult(id) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}/admin/results/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '删除失败')
            }

            return result
        } catch (error) {
            console.error('删除结果时出错:', error)
            throw error
        }
    }

    /**
     * 批量删除测试结果
     * @param {Array} ids - 结果ID数组
     * @returns {Promise}
     */
    async deleteResults(ids) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}/admin/results/batch-delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '批量删除失败')
            }

            return result
        } catch (error) {
            console.error('批量删除结果时出错:', error)
            throw error
        }
    }

    /**
     * 批量更新测试结果状态
     * @param {Array} ids - 结果ID数组
     * @param {String} status - 新状态
     * @returns {Promise}
     */
    async batchUpdateStatus(ids, status) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}/admin/results/batch-update-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids, status })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '批量更新状态失败')
            }

            return result
        } catch (error) {
            console.error('批量更新状态时出错:', error)
            throw error
        }
    }

    /**
     * 更新被测者英文名字
     * @param {String} id - 结果ID
     * @param {String} englishName - 英文名字
     * @returns {Promise}
     */
    async updateEnglishName(id, englishName) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}/admin/results/${id}/english-name`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ english_name: englishName })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '更新英文名字失败')
            }

            return result
        } catch (error) {
            console.error('更新英文名字时出错:', error)
            throw error
        }
    }

    /**
     * 上传测试数据
     * @param {Array} data - 测试数据数组
     * @returns {Promise}
     */
    async uploadTestData(data) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}/admin/results/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '上传数据失败')
            }

            return result
        } catch (error) {
            console.error('上传测试数据时出错:', error)
            throw error
        }
    }

    /**
     * 创建新管理员账户
     * @param {Object} adminData - 管理员数据
     * @param {String} adminData.username - 用户名
     * @param {String} adminData.password - 密码
     * @param {String} adminData.displayName - 显示名称
     * @returns {Promise}
     */
    async createAdmin(adminData) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.createAdmin}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adminData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '创建管理员账户失败')
            }

            return result
        } catch (error) {
            console.error('创建管理员账户时出错:', error)
            throw error
        }
    }

    /**
     * 修改密码
     * @param {Object} passwordData - 密码数据
     * @param {String} passwordData.currentPassword - 当前密码
     * @param {String} passwordData.newPassword - 新密码
     * @returns {Promise}
     */
    async changePassword(passwordData) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.changePassword}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '修改密码失败')
            }

            return result
        } catch (error) {
            console.error('修改密码时出错:', error)
            throw error
        }
    }

    /**
     * 上传单个JSON文件并导入
     * @param {Object} jsonData - JSON数据
     * @returns {Promise}
     */
    async uploadJsonFile(jsonData) {
        try {
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('未登录，请先登录')
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.uploadJson}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || '上传JSON文件失败')
            }

            return result
        } catch (error) {
            console.error('上传JSON文件时出错:', error)
            throw error
        }
    }
}

// 导出单例
export default new ApiService()