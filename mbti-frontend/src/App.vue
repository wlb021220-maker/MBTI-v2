<template>
    <div id="app">
        <!-- 路由切换示例 -->
        <div class="app-container" v-if="!isAdminMode">
            <header class="app-header">
                <div class="container">
                    <h1>MBTI职业性格测试</h1>
                    <p class="subtitle">人才画像分析</p>
                </div>
            </header>

            <main class="app-main">
                <div class="container">
                    <MbtiTest />
                </div>
            </main>

            <footer class="app-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>卓智云投资有限公司</h4>
                            <p>官网：<a href="https://zzy88.com" target="_blank">zzy88.com</a></p>
                        </div>

                        <div class="footer-section">
                            <h4>人力资源部门</h4>
                            <p>邮箱: hr@zzy66.com</p>
                        </div>

                    </div>

                    <div class="footer-bottom">
                        <p>© 2026 MBTI职业性格测试 | 卓智云资本</p>
                        <p>测试仅供本公司面试分析使用，不作为任何专业心理评估依据</p>
                    </div>
                </div>
            </footer>
        </div>

        <!-- 管理员模式 -->
        <AdminPanel v-else />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MbtiTest from './components/MbtiTest.vue'
import AdminPanel from './components/AdminPanel.vue'

// 是否显示管理员面板
const isAdminMode = ref(false)

// 检查当前路径是否为 /admin
const checkAdminPath = () => {
    isAdminMode.value = window.location.pathname === '/admin'
}

// 全局事件监听器，用于防止开发者工具和快捷键
const preventDevTools = (e) => {
    // 阻止右键菜单
    if (e.type === 'contextmenu') {
        e.preventDefault()
        e.stopPropagation()
        return false
    }
    
    // 阻止选择文本
    if (e.type === 'selectstart') {
        e.preventDefault()
        e.stopPropagation()
        return false
    }
    
    // 阻止复制、剪切、粘贴
    if (['copy', 'cut', 'paste'].includes(e.type)) {
        e.preventDefault()
        e.stopPropagation()
        return false
    }
    
    // 阻止键盘快捷键
    if (e.type === 'keydown') {
        // F12键
        if (e.key === 'F12') {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
        
        // Ctrl+Shift+I/J/C/K
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key)) {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
        
        // Ctrl+U (查看源代码)
        if (e.ctrlKey && e.key.toLowerCase() === 'u') {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
        
        // Ctrl+Shift+M (移动端模拟器)
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
        
        // Mac 快捷键
        if (e.metaKey && e.altKey && ['I', 'J', 'U'].includes(e.key.toUpperCase())) {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
        
        // Mac Cmd+Option+M (移动端模拟器)
        if (e.metaKey && e.altKey && e.key.toUpperCase() === 'M') {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
    }
    
    return true
}

// 检测开发者工具是否打开
let devToolsCheckInterval = null

const checkDevTools = () => {
    const threshold = 160
    const div = document.createElement('div')
    div.style.cssText = 'width: 100px; height: 100px; position: absolute; top: -1000px; left: -1000px; overflow: scroll; opacity: 0;'
    document.body.appendChild(div)
    
    const { offsetWidth, offsetHeight } = div
    
    devToolsCheckInterval = setInterval(() => {
        if (div.offsetWidth > offsetWidth + threshold || div.offsetHeight > offsetHeight + threshold) {
            alert('请勿使用开发者工具查看或修改页面内容！')
            location.reload()
        }
    }, 1000)
    
    document.body.removeChild(div)
}

// 添加防护措施
const addProtection = () => {
    // 添加事件监听器，使用capture阶段捕获，确保优先处理
    document.addEventListener('contextmenu', preventDevTools, true)
    document.addEventListener('selectstart', preventDevTools, true)
    document.addEventListener('copy', preventDevTools, true)
    document.addEventListener('cut', preventDevTools, true)
    document.addEventListener('paste', preventDevTools, true)
    document.addEventListener('keydown', preventDevTools, true)
    
    // 添加额外的keydown监听器，专门处理Ctrl+U等关键快捷键
    document.addEventListener('keydown', (e) => {
        // 专门处理Ctrl+U，确保被阻止
        if (e.ctrlKey && e.key.toLowerCase() === 'u') {
            e.preventDefault()
            e.stopPropagation()
            // 阻止默认行为
            return false
        }
        
        // 阻止Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
        
        // 阻止Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') {
            e.preventDefault()
            e.stopPropagation()
            return false
        }
    }, true)
    
    // 启动开发者工具检测
    checkDevTools()
}

// 移除防护措施
const removeProtection = () => {
    // 移除事件监听器，注意要使用相同的参数（包括capture）
    document.removeEventListener('contextmenu', preventDevTools, true)
    document.removeEventListener('selectstart', preventDevTools, true)
    document.removeEventListener('copy', preventDevTools, true)
    document.removeEventListener('cut', preventDevTools, true)
    document.removeEventListener('paste', preventDevTools, true)
    document.removeEventListener('keydown', preventDevTools, true)
    
    // 清除定时器
    if (devToolsCheckInterval) {
        clearInterval(devToolsCheckInterval)
        devToolsCheckInterval = null
    }
}

// 在组件挂载后添加防护功能
onMounted(() => {
    // 检查当前路径
    checkAdminPath()
    
    // 监听路径变化
    window.addEventListener('popstate', checkAdminPath)
    
    // 非管理员模式下才启用防护
    if (!isAdminMode.value) {
        addProtection()
    }
})

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
    removeProtection()
    window.removeEventListener('popstate', checkAdminPath)
})
</script>

<style scoped>
#app {
    min-height: 100vh;
    background-color: #f0f8ff;
}

.app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.app-header {
    background: linear-gradient(135deg, var(--dark-blue), var(--primary-blue));
    color: white;
    padding: 30px 0;
    text-align: center;
}

.app-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 700;
}

.app-header .subtitle {
    font-size: 1.8rem;
    opacity: 0.9;
    max-width: 800px;
    margin: 0 auto;
    font-weight: 500;
}

.app-main {
    flex: 1;
    padding: 30px 0;
}

.app-footer {
    background-color: var(--dark-blue);
    color: white;
    padding: 40px 0 20px;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
}

.footer-section h4 {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: var(--light-blue);
}

.footer-section p {
    margin-bottom: 8px;
    opacity: 0.8;
}

.footer-section a {
    color: var(--light-blue);
    text-decoration: none;
}

.footer-section a:hover {
    text-decoration: underline;
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.7;
}

@media (max-width: 768px) {
    .app-header h1 {
        font-size: 2rem;
    }

    .app-header .subtitle {
        font-size: 1rem;
    }

    .footer-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }
}
</style>
