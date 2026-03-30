<template>
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">
            完成进度: <span>{{ progress }}% ({{ answeredCount }}/{{ totalQuestions }})</span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    progress: {
        type: Number,
        required: true
    },
    answeredCount: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    }
})
</script>

<style scoped>
.progress-container {
    position: sticky;
    top: 20px;
    z-index: 10;
    background-color: var(--white);
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
    display: flex;
    align-items: center;
}

.progress-bar {
    flex-grow: 1;
    height: 10px;
    background-color: var(--medium-gray);
    border-radius: 5px;
    overflow: hidden;
    margin-right: 20px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--light-blue), var(--primary-blue));
    border-radius: 5px;
    transition: width 0.5s ease;
}

.progress-text {
    font-weight: 600;
    color: var(--dark-blue);
    white-space: nowrap;
}

@media (max-width: 768px) {
    .progress-container {
        flex-direction: column;
        align-items: flex-start;
    }

    .progress-bar {
        width: 100%;
        margin-right: 0;
        margin-bottom: 10px;
    }
}
</style>