<template>
    <div class="section" id="questionsSection">
        <div class="section-title">
            <i class="fas fa-question-circle"></i>
            <span>测试题目</span>
            <span class="progress-text">第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题</span>
        </div>

        <!-- 当前题目 -->
        <div v-if="currentQuestion" class="question-container" :key="currentQuestion.id">
            <div class="question-header">
                <span class="question-number">题目 {{ currentQuestion.id }}</span>
            </div>
            <div class="question-text">{{ currentQuestion.question }}</div>
            <div class="options-container">
                <div v-for="(option, index) in currentQuestion.options" :key="index"
                    :class="['option', { 'selected': userAnswers[currentQuestion.id] === option.score }]"
                    @click="selectOption(currentQuestion.id, option.score)">
                    <div class="custom-radio"></div>
                    <div class="option-text">{{ option.text }}</div>
                </div>
            </div>
        </div>

        <!-- 导航按钮 -->
        <div class="navigation-buttons">
            <button 
                v-if="currentIndex > 0" 
                @click.prevent="goToPrevious" 
                class="nav-btn prev-btn"
                type="button"
            >
                <i class="fas fa-arrow-left"></i> 上一题
            </button>
            <button 
                v-if="currentIndex < questions.length - 1" 
                @click.prevent="goToNext" 
                class="nav-btn next-btn"
                :disabled="!userAnswers[currentQuestion?.id]"
                type="button"
            >
                下一题 <i class="fas fa-arrow-right"></i>
            </button>
        </div>

        <!-- 题目进度条 -->
        <div class="question-progress">
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <div class="progress-info">
                <span>已答 {{ answeredCount }} 题</span>
                <span>剩余 {{ questions.length - answeredCount }} 题</span>
            </div>
            <div class="progress-dots">
                <span 
                    v-for="(q, index) in questions" 
                    :key="q.id"
                    :class="['dot', { 
                        'answered': userAnswers[q.id],
                        'current': index === currentIndex 
                    }]"
                    @click="goToQuestion(index)"
                    :title="`题目 ${q.id}${userAnswers[q.id] ? ' (已答)' : ''}`"
                ></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    questions: {
        type: Array,
        required: true
    },
    userAnswers: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['select-option'])

// 当前题目索引
const currentIndex = ref(0)

// 当前题目
const currentQuestion = computed(() => {
    return props.questions[currentIndex.value] || null
})

// 已答题数量
const answeredCount = computed(() => {
    return Object.keys(props.userAnswers).length
})

// 进度百分比（基于当前题号）
const progressPercentage = computed(() => {
    return ((currentIndex.value + 1) / props.questions.length) * 100
})

// 选择选项
const selectOption = (questionId, score) => {
    emit('select-option', questionId, score)
    // 延迟后自动进入下一题（如果还有下一题且当前题已回答）
    setTimeout(() => {
        if (currentIndex.value < props.questions.length - 1 && props.userAnswers[questionId]) {
            currentIndex.value++
        }
    }, 400)
}

// 上一题
const goToPrevious = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--
    }
}

// 下一题
const goToNext = () => {
    if (currentIndex.value < props.questions.length - 1) {
        currentIndex.value++
    }
}

// 跳转到指定题目（允许跳转到任意题目）
const goToQuestion = (index) => {
    if (index >= 0 && index < props.questions.length) {
        currentIndex.value = index
    }
}

// 监听题目变化，确保当前索引有效
watch(() => props.questions.length, (newLength) => {
    if (currentIndex.value >= newLength) {
        currentIndex.value = Math.max(0, newLength - 1)
    }
})

// 获取题目维度文本
const getDimensionText = (question) => {
    if (!question || !question.options) return ''
    const scores = question.options.map(o => o.score)
    const uniqueScores = [...new Set(scores)]
    
    const dimensionMap = {
        'E': '外向(E) - 内向(I)',
        'I': '外向(E) - 内向(I)',
        'S': '实感(S) - 直觉(N)',
        'N': '实感(S) - 直觉(N)',
        'T': '思考(T) - 情感(F)',
        'F': '思考(T) - 情感(F)',
        'J': '判断(J) - 知觉(P)',
        'P': '判断(J) - 知觉(P)'
    }
    
    for (const score of uniqueScores) {
        if (dimensionMap[score]) {
            return dimensionMap[score]
        }
    }
    return ''
}
</script>

<style scoped>
.section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
}

.section-title i {
    color: var(--primary-blue);
    font-size: 1.5rem;
}

.section-title span {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--dark-blue);
}

.progress-text {
    margin-left: auto;
    font-size: 1rem;
    color: #666;
    font-weight: 500;
}

.question-container {
    padding: 30px;
    border-radius: 16px;
    background-color: var(--light-gray);
    margin-bottom: 30px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.question-number {
    font-size: 0.95rem;
    color: var(--primary-blue);
    font-weight: 600;
    background-color: rgba(58, 134, 255, 0.1);
    padding: 6px 14px;
    border-radius: 20px;
}

.question-text {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 30px;
    color: var(--dark-blue);
    line-height: 1.6;
}

.options-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.option {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.option:hover {
    background-color: rgba(58, 134, 255, 0.05);
    border-color: var(--light-blue);
    transform: translateX(5px);
}

.option.selected {
    background-color: rgba(58, 134, 255, 0.1);
    border-color: var(--primary-blue);
}

.custom-radio {
    width: 28px;
    height: 28px;
    border: 2px solid var(--medium-gray);
    border-radius: 50%;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.option.selected .custom-radio {
    border-color: var(--primary-blue);
    background-color: var(--primary-blue);
}

.custom-radio::after {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: white;
    transform: scale(0);
    transition: transform 0.2s ease;
}

.option.selected .custom-radio::after {
    transform: scale(1);
}

.option-text {
    font-size: 1.1rem;
    color: var(--text-dark);
}

.navigation-buttons {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
}

.nav-btn {
    padding: 15px 30px;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.prev-btn {
    background-color: white;
    color: var(--dark-blue);
    border: 2px solid var(--medium-gray);
}

.prev-btn:hover {
    border-color: var(--primary-blue);
    color: var(--primary-blue);
}

.next-btn {
    background-color: var(--primary-blue);
    color: white;
    margin-left: auto;
}

.next-btn:hover:not(:disabled) {
    background-color: #2a75ff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(58, 134, 255, 0.3);
}

.question-progress {
    background-color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.progress-bar {
    height: 8px;
    background-color: var(--light-gray);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-blue), var(--light-blue));
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 15px;
}

.progress-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
    max-height: 60px;
    overflow-y: auto;
    padding: 5px;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--medium-gray);
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot.answered {
    background-color: var(--primary-blue);
}

.dot.current {
    background-color: var(--dark-blue);
    transform: scale(1.3);
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.2);
}

.dot:hover {
    transform: scale(1.2);
}

@media (max-width: 768px) {
    .question-container {
        padding: 20px;
    }

    .question-text {
        font-size: 1.1rem;
    }

    .option {
        padding: 15px;
    }

    .nav-btn {
        padding: 12px 20px;
        font-size: 0.9rem;
    }

    .progress-dots {
        gap: 5px;
        max-height: 50px;
    }

    .dot {
        width: 8px;
        height: 8px;
    }
}
</style>
