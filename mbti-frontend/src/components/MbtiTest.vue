<template>
    <div>
        <ProgressBar :progress="progressPercentage" :answered-count="answeredCount" :total-questions="totalQuestions" />

        <form @submit.prevent="handleSubmit" id="mbtiTestForm" v-if="!showThankYou">
            <!-- 增强的用户信息收集 -->
            <EnhancedUserInfo v-model:userInfo="userInfo" @save-user-info="saveProgress" />

            <!-- 测试题目部分 -->
            <QuestionSection :questions="questions" :user-answers="userAnswers" @select-option="handleSelectOption" />

            <div class="submit-section">
                <button type="submit" class="submit-btn" :disabled="!canSubmit || isSubmitting">
                    <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                    {{ submitButtonText }}
                </button>

                <div v-if="validationError" class="validation-error">
                    <i class="fas fa-exclamation-triangle"></i> {{ validationError }}
                </div>
            </div>
        </form>

        <!-- 提交状态指示器 -->
        <div v-if="isSubmitting" class="submission-overlay">
            <div class="submission-modal">
                <div class="spinner"></div>
                <h3>正在提交测试结果...</h3>
                <p>请稍候，不要关闭页面</p>
                <div class="progress-steps">
                    <div :class="['step', { active: submissionStep >= 1 }]">
                        <div class="step-number">1</div>
                        <div class="step-text">验证数据</div>
                    </div>
                    <div :class="['step', { active: submissionStep >= 2 }]">
                        <div class="step-number">2</div>
                        <div class="step-text">提交到服务器</div>
                    </div>
                    <div :class="['step', { active: submissionStep >= 3 }]">
                        <div class="step-number">3</div>
                        <div class="step-text">生成确认</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 感谢页面 -->
        <ThankYouPage v-if="showThankYou" :user-name="userInfo.name" :user-email="userInfo.email"
            :submission-time="submissionTime" :test-id="testId" @download-confirmation="downloadConfirmation"
            @restart-test="restartTest" />

        <!-- 通知 -->
        <div v-if="showNotification" class="notification">
            <i class="fas" :class="notificationIcon"></i> {{ notificationMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import ProgressBar from './ProgressBar.vue'
import EnhancedUserInfo from './EnhancedUserInfo.vue'
import QuestionSection from './QuestionSection.vue'
import ThankYouPage from './ThankYouPage.vue'
import apiService from '../services/apiService'
import {
    mbtiQuestions,
    personalityDescriptions,
    dimensionExplanations
} from '../data/mbtiData.js'




// 响应式数据
const userInfo = reactive({
    name: '',
    age: '',
    gender: '',
    email: '',
    occupation: '',
    education: '',
    purpose: '',
    region: '',
    organization: '',
    comments: '',
    employment: ''
})

const userAnswers = ref({})
const showThankYou = ref(false)
const isSubmitting = ref(false)
const submissionStep = ref(0)
const testId = ref('')
const submissionTime = ref('')
const validationError = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationIcon = ref('fa-info-circle')

// 题目数据
const questions = mbtiQuestions

// 从sessionStorage加载保存的进度
const loadSavedProgress = () => {
    const savedProgress = sessionStorage.getItem('mbtiTestProgress')
    const savedUserInfo = sessionStorage.getItem('mbtiUserInfo')

    if (savedProgress) {
        try {
            const progressData = JSON.parse(savedProgress)
            userAnswers.value = progressData.answers || {}
        } catch (e) {
            console.error('加载测试进度时出错:', e)
        }
    }

    if (savedUserInfo) {
        try {
            const userData = JSON.parse(savedUserInfo)
            Object.assign(userInfo, userData)
        } catch (e) {
            console.error('加载用户信息时出错:', e)
        }
    }
}

// 保存进度到sessionStorage
const saveProgress = () => {
    const progressData = {
        answers: userAnswers.value,
        timestamp: new Date().toISOString()
    }

    sessionStorage.setItem('mbtiTestProgress', JSON.stringify(progressData))
}

// 显示通知
const showNotificationMessage = (message, type = 'info') => {
    notificationMessage.value = message
    notificationIcon.value = type === 'error' ? 'fa-exclamation-triangle' :
        type === 'success' ? 'fa-check-circle' : 'fa-info-circle'
    showNotification.value = true

    setTimeout(() => {
        showNotification.value = false
    }, 3000)
}

// 处理选项选择
const handleSelectOption = (questionId, score) => {
    const currentScore = userAnswers.value[questionId]

    if (currentScore === score) {
        // 如果点击的是已选选项，则取消选择
        delete userAnswers.value[questionId]
    } else {
        // 选择新选项
        userAnswers.value[questionId] = score
    }

    // 保存进度
    saveProgress()

    // 显示通知
    showNotificationMessage('答题进度已自动保存', 'info')
}

// 计算属性
const totalQuestions = computed(() => questions.length)

const answeredCount = computed(() => {
    return Object.keys(userAnswers.value).length
})

const progressPercentage = computed(() => {
    return Math.round((answeredCount.value / totalQuestions.value) * 100)
})

const canSubmit = computed(() => {
    return answeredCount.value === totalQuestions.value &&
        userInfo.name &&
        userInfo.email
})

const submitButtonText = computed(() => {
    if (isSubmitting.value) {
        return '提交中...'
    } else if (canSubmit.value) {
        return '提交测试结果'
    } else {
        if (!userInfo.name || !userInfo.email) {
            return '请填写必要信息'
        } else {
            return `请完成所有题目 (${answeredCount.value}/${totalQuestions.value})`
        }
    }
})

// 验证表单
const validateForm = () => {
    validationError.value = ''

    if (!userInfo.name.trim()) {
        validationError.value = '请输入您的姓名'
        return false
    }

    if (!userInfo.email.trim()) {
        validationError.value = '请输入您的邮箱地址'
        return false
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userInfo.email)) {
        validationError.value = '请输入有效的邮箱地址'
        return false
    }

    

    if (answeredCount.value < totalQuestions.value) {
        validationError.value = '请完成所有测试题目'
        return false
    }

    return true
}

// 计算MBTI类型
const calculateMBTIType = () => {
    const dimensionScores = {
        "E": 0, "I": 0,
        "S": 0, "N": 0,
        "T": 0, "F": 0,
        "J": 0, "P": 0
    };

    Object.values(userAnswers.value).forEach(score => {
        if (dimensionScores.hasOwnProperty(score)) {
            dimensionScores[score]++
        }
    });

    let mbtiType = ""
    mbtiType += dimensionScores["E"] >= dimensionScores["I"] ? "E" : "I"
    mbtiType += dimensionScores["S"] >= dimensionScores["N"] ? "S" : "N"
    mbtiType += dimensionScores["T"] >= dimensionScores["F"] ? "T" : "F"
    mbtiType += dimensionScores["J"] >= dimensionScores["P"] ? "J" : "P"

    return mbtiType
}

// 计算维度得分
const calculateDimensionScores = () => {
    const dimensionScores = {
        "E": 0, "I": 0,
        "S": 0, "N": 0,
        "T": 0, "F": 0,
        "J": 0, "P": 0
    };

    Object.values(userAnswers.value).forEach(score => {
        if (dimensionScores.hasOwnProperty(score)) {
            dimensionScores[score]++
        }
    });

    return Object.entries(dimensionScores).map(([dimension, score]) => ({
        dimension,
        score,
        percentage: Math.round((score / totalQuestions.value) * 100)
    }))
}

// 处理表单提交
const handleSubmit = async () => {
    // 验证表单
    if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
    }

    // 开始提交
    isSubmitting.value = true
    submissionStep.value = 1

    try {
        // 步骤1: 验证数据
        await new Promise(resolve => setTimeout(resolve, 500))
        submissionStep.value = 2

        // 计算MBTI类型和维度得分
        const mbtiType = calculateMBTIType()
        const dimensionScores = calculateDimensionScores()

        // 将用户答案转换为后端期望的格式
        const formattedAnswers = []
        questions.forEach(question => {
            if (userAnswers.value[question.id]) {
                formattedAnswers.push({
                    question_id: question.id,
                    question: question.question,
                    selected_option: getOptionText(question, userAnswers.value[question.id]),
                    score: userAnswers.value[question.id]
                })
            }
        })

        // 准备提交数据，完全匹配 apiService.js 中的结构
        const submissionData = {
            userInfo: {
                name: userInfo.name,
                age: userInfo.age,
                gender: userInfo.gender,
                email: userInfo.email,
                occupation: userInfo.occupation,
                education: userInfo.education,
                purpose: userInfo.purpose, // 注意：这里是数组
                region: userInfo.region,
                organization: userInfo.organization,
                comments: userInfo.comments,
                employment: userInfo.employment
            },
            mbtiType: mbtiType,
            dimensionScores: dimensionScores,
            answers: formattedAnswers, // 使用格式化后的答案
            testDuration: calculateTestDuration(),
            testId: generateTestId()
        }

        console.log('准备提交的数据:', submissionData)

        // 步骤2: 提交到后端服务器
        const apiResponse = await apiService.submitTestResults(submissionData)

        console.log('API响应:', apiResponse)

        submissionStep.value = 3
        await new Promise(resolve => setTimeout(resolve, 500))

        // 保存完整结果到sessionStorage（仅用于确认）
        saveFullResults(submissionData, apiResponse)

        // 设置显示信息
        testId.value = apiResponse.test_id || submissionData.testId
        submissionTime.value = new Date().toLocaleString('zh-CN')

        // 步骤3: 显示感谢页面
        setTimeout(() => {
            isSubmitting.value = false
            showThankYou.value = true
            window.scrollTo({ top: 0, behavior: 'smooth' })
            showNotificationMessage('测试结果已成功提交！', 'success')
        }, 1000)

    } catch (error) {
        console.error('提交失败:', error)
        isSubmitting.value = false
        submissionStep.value = 0
        showNotificationMessage(`提交失败: ${error.message}`, 'error')

        // 滚动到顶部以便用户看到错误
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

// 获取选项文本的辅助函数
const getOptionText = (question, score) => {
    const option = question.options.find(opt => opt.score === score)
    return option ? option.text : ''
}

// 生成测试ID
const generateTestId = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `MBTI-${timestamp}-${random.toString().padStart(4, '0')}`
}

// 计算测试耗时
const calculateTestDuration = () => {
    const savedProgress = sessionStorage.getItem('mbtiTestProgress')
    if (savedProgress) {
        try {
            const progressData = JSON.parse(savedProgress)
            if (progressData.startTime) {
                const startTime = new Date(progressData.startTime)
                const endTime = new Date()
                return Math.round((endTime - startTime) / 1000) // 返回秒数
            }
        } catch (e) {
            console.error('计算测试耗时出错:', e)
        }
    }
    return 0
}

// 保存完整结果到sessionStorage
const saveFullResults = (submissionData, apiResponse) => {
    const fullResults = {
        userInfo: submissionData.userInfo,
        mbtiType: submissionData.mbtiType,
        dimensionScores: submissionData.dimensionScores,
        answers: submissionData.answers,
        testDuration: submissionData.testDuration,
        testId: submissionData.testId,
        apiResponse: apiResponse,
        timestamp: new Date().toISOString()
    }

    sessionStorage.setItem('mbtiTestFullResults', JSON.stringify(fullResults, null, 2))
}

// 下载确认函
const downloadConfirmation = () => {
    // 这个功能在ThankYouPage组件中实现
    console.log('下载确认函')
}

// 重新开始测试
const restartTest = () => {
    if (confirm('确定要重新开始测试吗？当前的回答和用户信息将被清除。')) {
        // 清除保存的数据
        sessionStorage.removeItem('mbtiTestProgress')
        sessionStorage.removeItem('mbtiUserInfo')

        // 重置变量
        Object.keys(userInfo).forEach(key => {
            if (key !== 'privacyAgreed') {
                userInfo[key] = ''
            } else {
                userInfo[key] = false
            }
        })
        userAnswers.value = {}
        showThankYou.value = false
        isSubmitting.value = false
        submissionStep.value = 0
        testId.value = ''
        submissionTime.value = ''
        validationError.value = ''

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })

        showNotificationMessage('测试已重置，您可以重新开始', 'info')
    }
}

// 初始化测试开始时间
const initTestStartTime = () => {
    const savedProgress = sessionStorage.getItem('mbtiTestProgress')
    if (!savedProgress || !JSON.parse(savedProgress).startTime) {
        const progressData = {
            startTime: new Date().toISOString(),
            answers: {}
        }
        sessionStorage.setItem('mbtiTestProgress', JSON.stringify(progressData))
    }
}

// 生命周期钩子
onMounted(() => {
    console.log("MBTI测试系统加载完成，题目数量:", questions.length)

    // 初始化测试开始时间
    initTestStartTime()

    // 从sessionStorage加载之前的回答
    loadSavedProgress()
})
</script>

<style scoped>
.submission-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

.submission-modal {
    background-color: white;
    border-radius: 16px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.submission-modal h3 {
    color: var(--dark-blue);
    margin: 20px 0 10px;
    font-size: 1.5rem;
}

.submission-modal p {
    color: #666;
    margin-bottom: 30px;
}

.spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

.progress-steps {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

.step.active {
    opacity: 1;
}

.step-number {
    width: 40px;
    height: 40px;
    background-color: #f3f3f3;
    color: #999;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    margin-bottom: 8px;
    transition: all 0.3s ease;
}

.step.active .step-number {
    background-color: var(--primary-blue);
    color: white;
}

.step-text {
    font-size: 0.9rem;
    color: #666;
    white-space: nowrap;
}

.validation-error {
    margin-top: 15px;
    padding: 12px 20px;
    background-color: #ffeaea;
    border: 1px solid #ffcccc;
    border-radius: 8px;
    color: #d63031;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    animation: shake 0.5s ease;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    10%,
    30%,
    50%,
    70%,
    90% {
        transform: translateX(-5px);
    }

    20%,
    40%,
    60%,
    80% {
        transform: translateX(5px);
    }
}

.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--primary-blue);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    z-index: 100;
    animation: fadeInOut 3s ease-in-out;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 400px;
}

.notification i {
    font-size: 1.2rem;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    20% {
        opacity: 1;
        transform: translateY(0);
    }

    80% {
        opacity: 1;
        transform: translateY(0);
    }

    100% {
        opacity: 0;
        transform: translateY(20px);
    }
}

@media (max-width: 768px) {
    .submission-modal {
        padding: 20px;
    }

    .progress-steps {
        flex-direction: column;
        gap: 10px;
    }

    .notification {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}



</style>