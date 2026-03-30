<template>
    <div class="results-container" id="resultsContainer">
        <div class="results-header">
            <h2>你的MBTI测试结果</h2>
            <p id="userGreeting">{{ greeting }} 以下是你的MBTI人格类型分析</p>
            <div class="personality-type" id="personalityType">{{ mbtiType }}</div>
            <p id="personalityDescription">{{ personalityDescription }}</p>
        </div>

        <div class="dimension-results" id="dimensionResults">
            <div v-for="(dimension, index) in dimensionResults" :key="index" class="dimension">
                <div class="dimension-title">{{ dimension.title }}</div>
                <div class="dimension-value">{{ dimension.selected }}</div>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    {{ dimension.explanation }}
                </div>
            </div>
        </div>

        <div class="answers-details">
            <h3><i class="fas fa-list"></i> 答题详情</h3>
            <div id="answersList">
                <div v-for="answer in answersDetails" :key="answer.id" class="answer-item">
                    <div><strong>{{ answer.id }}. {{ answer.question }}</strong></div>
                    <div style="margin-top: 8px; color: var(--primary-blue);">
                        <i class="fas fa-check-circle"></i> 你的选择: {{ answer.selectedOption }}
                        <span
                            style="margin-left: 10px; background-color: #e6f2ff; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                            {{ answer.score }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mbti-explanation">
            <h3><i class="fas fa-info-circle"></i> MBTI简介</h3>
            <p>MBTI（迈尔斯-布里格斯类型指标）是一种人格类型理论模型，将人格分为四个维度：</p>
            <p><strong>精力支配：</strong> 外向(E) vs 内向(I) - 你如何与外界互动</p>
            <p><strong>认识世界：</strong> 实感(S) vs 直觉(N) - 你获取信息的方式</p>
            <p><strong>判断事物：</strong> 思维(T) vs 情感(F) - 你做决策的方式</p>
            <p><strong>生活态度：</strong> 判断(J) vs 感知(P) - 你应对外部世界的方式</p>
        </div>

        <div class="export-buttons">
            <button class="export-btn" @click="$emit('export-json')">
                <i class="fas fa-file-code"></i> 导出为JSON
            </button>
            <button class="export-btn" @click="$emit('export-text')">
                <i class="fas fa-file-alt"></i> 导出为文本
            </button>
            <button class="export-btn" @click="$emit('restart-test')">
                <i class="fas fa-redo"></i> 重新测试
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { personalityDescriptions, dimensionExplanations } from '../data/mbtiData.js'

defineProps({
    userName: {
        type: String,
        default: ''
    },
    userAge: {
        type: [String, Number],
        default: ''
    },
    mbtiType: {
        type: String,
        default: ''
    },
    dimensionResults: {
        type: Array,
        default: () => []
    },
    answersDetails: {
        type: Array,
        default: () => []
    }
})

defineEmits(['export-json', 'export-text', 'restart-test'])

// 计算属性
const greeting = computed(() => {
    if (props.userName) {
        return props.userAge ? `${props.userName}，${props.userAge}岁` : props.userName
    }
    return "尊敬的测试者"
})

const personalityDescription = computed(() => {
    return personalityDescriptions[props.mbtiType] || "守卫者型人格 - 负责任、务实、可靠，专注于维护秩序和安全"
})
</script>

<style scoped>
.results-container {
    background-color: white;
    border-radius: 16px;
    padding: 40px;
    margin-top: 30px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.results-header {
    text-align: center;
    margin-bottom: 40px;
}

.results-header h2 {
    color: var(--dark-blue);
    font-size: 2.2rem;
    margin-bottom: 10px;
}

.personality-type {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--primary-blue);
    margin: 20px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.dimension-results {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 40px;
}

.dimension {
    background-color: var(--light-gray);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
}

.dimension-title {
    font-weight: 600;
    color: var(--dark-blue);
    margin-bottom: 10px;
}

.dimension-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-blue);
}

.answers-details {
    margin-top: 40px;
}

.answers-details h3 {
    color: var(--dark-blue);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--medium-gray);
}

.answer-item {
    padding: 15px;
    border-radius: 10px;
    background-color: var(--light-gray);
    margin-bottom: 15px;
}

.export-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 30px;
    background-color: var(--white);
    color: var(--primary-blue);
    border: 2px solid var(--primary-blue);
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.export-btn:hover {
    background-color: var(--primary-blue);
    color: white;
}

.mbti-explanation {
    margin-top: 40px;
    padding: 25px;
    background: linear-gradient(135deg, #f0f8ff, #e6f2ff);
    border-radius: 12px;
    border-left: 5px solid var(--primary-blue);
}

.mbti-explanation h3 {
    color: var(--dark-blue);
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .dimension-results {
        grid-template-columns: 1fr;
    }

    .export-buttons {
        flex-direction: column;
    }
}
</style>