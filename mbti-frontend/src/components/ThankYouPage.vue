<template>
    <div class="thank-you-container">
        <div class="thank-you-card">
            <div class="thank-you-header">
                <i class="fas fa-check-circle success-icon"></i>
                <h2>测试完成！感谢您的参与</h2>
            </div>

            <div class="thank-you-content">
                <p class="thank-you-message">
                    亲爱的 <span class="user-name">{{ userName }}</span>，您已成功完成职业性格测试，结果已提交。
                </p>

                <div class="submission-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <div class="info-label">提交时间</div>
                            <div class="info-value">{{ submissionTime }}</div>
                        </div>
                    </div>

                    <div class="info-item">
                        <i class="fas fa-file-alt"></i>
                        <div>
                            <div class="info-label">测试ID</div>
                            <div class="info-value">{{ testId }}</div>
                        </div>
                    </div>
                </div>

                <div class="result-notice">
                    <h3><i class="fas fa-info-circle"></i> 关于测试结果</h3>
                    <p>测试结果暂不直接向面试小伙伴开放噢~</p>
                    <p>测试是为了发掘更有潜力与特质的小伙伴，但请放心，测试结果不会主导录用情况。</p>

                    <div class="research-purpose">
                        <h4><i class="fas fa-flask"></i> 测试目的</h4>
                        <ul>
                            <li>分析小伙伴与公司人才需求是否匹配</li>
                            <li>探索职业性格与未来发展路径相关性</li>
                            <li>验证职业性格与现实工作表现一致性</li>
                            <li>为公司顶层设计提供长期人才画像库</li>
                        </ul>
                    </div>
                </div>

                <div class="contact-info">
                    <h3><i class="fas fa-headset"></i> 如有疑问</h3>
                    <p>如果您对本次测试有任何疑问，或需要进一步了解面试进展，请联系Spark(HR Dept.)：</p>
                    <div class="contact-details">
                        <p><i class="fas fa-envelope"></i> 联系邮箱: hr@zzy66.com</p>
                        <p><i class="fas fa-globe"></i> 官网: <a href="https://zzy88.com" target="_blank">zzy88.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'


const props = defineProps({
    userName: {
        type: String,
        default: ''
    },
    userEmail: {
        type: String,
        default: ''
    },
    submissionTime: {
        type: String,
        default: ''
    },
    testId: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['download-confirmation', 'restart-test'])

// 生成测试ID
const generateTestId = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `MBTI-${timestamp}-${random.toString().padStart(4, '0')}`
}

// 下载测试确认函
const downloadConfirmation = () => {
    const confirmationContent = generateConfirmationContent()
    const blob = new Blob([confirmationContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MBTI测试确认_${props.userName || '匿名用户'}_${props.testId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    emit('download-confirmation')
}

// 生成确认函内容
const generateConfirmationContent = () => {
    return `MBTI人格类型测试 - 参与确认函

感谢您参与本次MBTI人格类型测试研究。

测试信息：
--------------------
参与者姓名：${props.userName}
测试ID：${props.testId}
提交时间：${props.submissionTime}
邮箱地址：${props.userEmail}

重要说明：
--------------------
1. 结果已提交至公司人才画像库
2. 该数据将仅用于面试结果分析
3. 所有个人信息将被匿名化处理
4. 请耐心等待Hr联系以推进流程

隐私承诺：
--------------------
我们承诺严格保护您的个人信息安全，遵守相关隐私法规。您的数据仅用于面试目的，不会用于商业用途或泄露给第三方。

如有任何疑问，请联系：
联系邮箱：hr@zzy66.com
官方网站：zzy88.com

感谢您的参与和支持！

卓智云投资有限公司
${new Date().toLocaleDateString('zh-CN')}
`
}

// 重新测试
const restartTest = () => {
    if (confirm('确定要重新开始测试吗？当前测试数据已经被保存，多次答题或测试结果不一致可能影响对您的评估。')) {
        emit('restart-test')
    }
}
</script>

<style scoped>
.thank-you-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
}

.thank-you-card {
    background-color: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
    animation: fadeIn 0.5s ease-out;
}

.thank-you-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--medium-gray);
}

.success-icon {
    font-size: 4rem;
    color: #2ecc71;
    margin-bottom: 20px;
}

.thank-you-header h2 {
    color: var(--dark-blue);
    font-size: 2rem;
}

.thank-you-message {
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 30px;
    color: var(--text-dark);
}

.user-name {
    font-weight: 700;
    color: var(--primary-blue);
}

.submission-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.info-item {
    display: flex;
    align-items: center;
    background-color: var(--light-gray);
    padding: 20px;
    border-radius: 10px;
    gap: 15px;
}

.info-item i {
    font-size: 1.5rem;
    color: var(--primary-blue);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border-radius: 50%;
}

.info-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 4px;
}

.info-value {
    font-weight: 600;
    color: var(--dark-blue);
    font-size: 1.1rem;
}

.result-notice,
.next-steps,
.contact-info {
    background-color: var(--light-gray);
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 30px;
}

.result-notice h3,
.next-steps h3,
.contact-info h3 {
    color: var(--dark-blue);
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.result-notice p,
.contact-info p {
    line-height: 1.6;
    margin-bottom: 15px;
}

.research-purpose {
    margin-top: 20px;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
}

.research-purpose h4 {
    color: var(--primary-blue);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.research-purpose ul {
    padding-left: 20px;
    margin-bottom: 0;
}

.research-purpose li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.steps {
    display: grid;
    gap: 20px;
    margin-top: 20px;
}

.step {
    display: flex;
    gap: 15px;
    align-items: flex-start;
}

.step-number {
    width: 40px;
    height: 40px;
    background-color: var(--primary-blue);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.step-content h4 {
    color: var(--dark-blue);
    margin-bottom: 5px;
}

.step-content p {
    color: #666;
    font-size: 0.95rem;
    margin-bottom: 0;
}

.contact-details {
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
}

.contact-details p {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.contact-details i {
    color: var(--primary-blue);
    width: 20px;
    text-align: center;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
}

.btn-primary,
.btn-secondary {
    padding: 15px 30px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-primary {
    background-color: var(--primary-blue);
    color: white;
}

.btn-primary:hover {
    background-color: #2a75ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(58, 134, 255, 0.3);
}

.btn-secondary {
    background-color: white;
    color: var(--primary-blue);
    border: 2px solid var(--primary-blue);
}

.btn-secondary:hover {
    background-color: rgba(58, 134, 255, 0.05);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .thank-you-container {
        padding: 10px;
    }

    .thank-you-card {
        padding: 20px;
    }

    .submission-info {
        grid-template-columns: 1fr;
    }

    .action-buttons {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}
</style>