<template>
    <!-- 登录界面 -->
    <div v-if="!isAuthenticated" class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="login-logo">
                    <i class="fas fa-lock fa-2x"></i>
                    <h2>MBTI测试管理系统</h2>
                </div>
                <p class="login-subtitle">管理员登录</p>
            </div>

            <form @submit.prevent="login" class="login-form">
                <div class="form-group">
                    <div class="input-group">
                        <i class="fas fa-user input-icon"></i>
                        <input type="text" id="username" v-model="loginForm.username" placeholder="请输入用户名" required
                            class="form-input">
                    </div>
                </div>

                <div class="form-group">
                    <div class="input-group">
                        <i class="fas fa-key input-icon"></i>
                        <input :type="showPassword ? 'text' : 'password'" id="password" v-model="loginForm.password" placeholder="请输入密码" required
                            class="form-input">
                        <button type="button" class="password-toggle-btn" @click="showPassword = !showPassword">
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <div v-if="loginError" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>{{ loginError }}</span>
                </div>

                <button type="submit" class="login-btn" :disabled="isLoggingIn" :class="{ 'loading': isLoggingIn }">
                    <span v-if="!isLoggingIn">
                        <i class="fas fa-sign-in-alt"></i> 登录
                    </span>
                    <span v-else>
                        <i class="fas fa-spinner fa-spin"></i> 登录中...
                    </span>
                </button>
            </form>

            <div class="login-footer">
                <p><i class="fas fa-shield-alt"></i> 安全访问 | 所有操作将被记录</p>
            </div>
        </div>
    </div>

    <!-- 管理面板主界面 -->
    <div v-else class="admin-container">
        <!-- 顶部导航栏 -->
        <div class="admin-header">
            <div class="header-left">
                <h1><i class="fas fa-lock"></i> MBTI测试结果管理系统</h1>
            </div>
            <div class="header-right">
                <div class="admin-info">
                    <span v-if="adminUser && adminUser.username" class="admin-name">
                        <i class="fas fa-user-circle"></i> {{ adminUser.username }}
                    </span>
                    <div class="admin-actions">
                        <button @click="showCreateAdminModal = true" class="admin-btn">
                            <i class="fas fa-user-plus"></i> 新建管理员
                        </button>
                        <button @click="showChangePasswordModal = true" class="admin-btn">
                            <i class="fas fa-key"></i> 修改密码
                        </button>
                        <button @click="showUploadJsonModal = true" class="admin-btn">
                            <i class="fas fa-file-upload"></i> 上传JSON
                        </button>
                        <button @click="logout" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> 退出
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 主内容区域 -->
        <div class="admin-content">
            <!-- 统计数据卡片 -->
            <div class="stats-cards">
                <div class="stat-card">
                    <div class="stat-value">{{ stats.totalTests }}</div>
                    <div class="stat-label">总测试数</div>
                    <i class="stat-icon fas fa-file-alt"></i>
                </div>

                <div class="stat-card">
                    <div class="stat-value">{{ stats.todayTests }}</div>
                    <div class="stat-label">今日测试</div>
                    <i class="stat-icon fas fa-calendar-day"></i>
                </div>

                <div class="stat-card">
                    <div class="stat-value">{{ stats.pendingReview }}</div>
                    <div class="stat-label">待审核</div>
                    <i class="stat-icon fas fa-clock"></i>
                </div>

                <div class="stat-card">
                    <div class="stat-value">{{ stats.uniqueUsers }}</div>
                    <div class="stat-label">独立用户</div>
                    <i class="stat-icon fas fa-users"></i>
                </div>
            </div>

            <!-- 操作工具栏 -->
            <div class="action-toolbar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" v-model="searchQuery" placeholder="搜索姓名、邮箱或测试ID..." @input="debouncedSearch">
                </div>

                <div class="action-buttons">
            <div class="filter-group">
                <label>候选人类型:</label>
                <select v-model="candidateTypeFilter" @change="loadTestResults">
                    <option value="">全部类型</option>
                    <option value="interview">面试人员</option>
                    <option value="employee">在职人员</option>
                    <option value="former">离职人员</option>
                </select>
            </div>

            <div class="filter-group">
                <label>状态筛选:</label>
                <select v-model="statusFilter" @change="loadTestResults">
                    <option value="">全部状态</option>
                    <option value="pending">待审核</option>
                    <option value="processed">已处理</option>
                    <option value="rejected">已拒绝</option>
                    <option value="archived">已归档</option>
                </select>
            </div>

            <div class="filter-group">
                <label>MBTI类型:</label>
                <select v-model="selectedType" @change="loadTestResults">
                    <option value="">全部类型</option>
                    <option v-for="type in mbtiTypes" :key="type" :value="type">
                        {{ type }}
                    </option>
                </select>
            </div>

                    <button @click="exportData" class="export-btn" :disabled="isExporting">
                        <i class="fas" :class="isExporting ? 'fa-spinner fa-spin' : 'fa-download'"></i>
                        {{ isExporting ? '导出中...' : '导出CSV' }}
                    </button>

                    <button @click="refreshData" class="refresh-btn">
                        <i class="fas fa-sync-alt"></i> 刷新
                    </button>
                </div>
            </div>

            <!-- 批量操作栏 -->
            <div class="batch-actions" v-if="selectedResults.length > 0">
                <span class="selected-count">已选择 {{ selectedResults.length }} 项</span>
                <select v-model="batchStatus" class="batch-select">
                    <option value="">批量设置状态</option>
                    <option value="processed">标记为已处理</option>
                    <option value="rejected">标记为已拒绝</option>
                    <option value="archived">标记为已归档</option>
                </select>
                <button @click="applyBatchStatus" class="batch-btn" :disabled="!batchStatus">
                    <i class="fas fa-check"></i> 应用
                </button>
                <button @click="showBatchDeleteConfirm" class="btn-danger batch-btn">
                    <i class="fas fa-trash"></i> 批量删除
                </button>
                <button @click="clearSelection" class="clear-btn">
                    <i class="fas fa-times"></i> 清除选择
                </button>
            </div>

            <!-- 测试结果表格 -->
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th width="40">
                                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                            </th>
                            <th width="80">姓名</th>
                            <th width="120">邮箱</th>
                            <th width="90">候选人类型</th>
                            <th width="200">MBTI结果</th>
                            <th width="100">提交时间</th>
                            <th width="70">状态</th>
                            <th width="100">审核意见</th>
                            <th width="80">操作</th>
                        </tr>
                    </thead>

                    <tbody v-if="loading">
                        <tr>
                            <td colspan="9" class="loading-cell">
                                <div class="loading-spinner"></div>
                                <span>加载中...</span>
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else-if="testResults.length === 0">
                        <tr>
                            <td colspan="9" class="empty-cell">
                                <i class="fas fa-inbox"></i>
                                <p>暂无测试结果数据</p>
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr v-for="result in testResults" :key="result.id"
                            :class="{ 'selected-row': selectedResults.includes(result.id) }">
                            <td>
                                <input type="checkbox" :value="result.id" v-model="selectedResults">
                            </td>
                            <td class="text-center">
                                <div class="name-container">
                                    <strong>{{ result.user_name || result.user_info?.name || '未提供' }}</strong>
                                    <span v-if="result.english_name || result.user_info?.english_name" class="english-name-tag">
                                        {{ result.english_name || result.user_info?.english_name }}
                                    </span>
                                </div>
                            </td>
                            <td class="text-center">
                                <strong>{{ result.email || result.user_info?.email || '未提供' }}</strong>
                            </td>
                            <td class="text-center">
                                <select 
                                    v-model="result.candidate_type"
                                    @change="updateCandidateType(result.id, $event.target.value)"
                                    class="candidate-type-select"
                                >
                                    <option value="interview">面试人员</option>
                                    <option value="employee">在职人员</option>
                                    <option value="former">离职人员</option>
                                </select>
                            </td>
                            <td class="text-center">
                                <div class="mbti-result-container">
                                    <span class="mbti-badge"
                                        :class="getMbtiClass(result.mbti_type || result.test_results?.mbti_type)">
                                        {{ result.mbti_type || result.test_results?.mbti_type || '未分类' }}
                                    </span>
                                    <span v-if="result.test_results?.dimension_scores" class="mbti-detail">
                                        {{ (result.mbti_type || result.test_results?.mbti_type || '未分类') + ' | ' + formatDimensionScores(result.test_results.dimension_scores) }}
                                    </span>
                                </div>
                            </td>
                            <td class="text-center">
                                {{ formatDateTime(result.submission_time) }}
                            </td>
                            <td class="text-center">
                                <span class="status-badge" :class="`status-${result.status}`">
                                    {{ getStatusText(result.status) }}
                                </span>
                            </td>
                            <td class="text-center">
                                <span class="review-notes" :title="result.review_notes || '暂无审核意见'">
                                    {{ result.review_notes ?
                                        (result.review_notes.length > 20 ?
                                            result.review_notes.substring(0, 20) + '...' :
                                            result.review_notes) :
                                        '暂无'
                                    }}
                                </span>
                            </td>
                            <td class="text-center">
                                <div class="action-dropdown">
                                    <button @click.stop="toggleActionMenu(result.id)" class="btn-action-menu">
                                        操作
                                        <i class="fas fa-chevron-down" :class="{ 'rotate': openActionMenu === result.id }"></i>
                                    </button>
                                    <div v-if="openActionMenu === result.id" class="action-menu">
                                        <button @click="viewDetails(result); closeActionMenu()" class="action-menu-item">
                                            查看详情
                                        </button>
                                        <button @click="showReviewModal(result); closeActionMenu()" class="action-menu-item">
                                            审核
                                        </button>
                                        <button @click="showEnglishNameModalFunc(result); closeActionMenu()" class="action-menu-item">
                                            备注
                                        </button>
                                        <button @click="confirmDelete(result); closeActionMenu()" class="action-menu-item delete">
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- 分页 -->
                <div class="pagination" v-if="totalPages > 1">
                    <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-btn first">
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>

                    <span class="page-numbers">
                        <template v-for="page in getPageRange()" :key="page">
                            <button @click="goToPage(page)" :class="['page-number', { active: page === currentPage }]">
                                {{ page }}
                            </button>
                        </template>
                    </span>

                    <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-btn last">
                        <i class="fas fa-angle-double-right"></i>
                    </button>

                    <span class="page-info">
                        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页 (共 {{ totalItems }} 条记录)
                    </span>
                </div>
            </div>
        </div>

        <!-- 详情模态框 -->
        <div v-if="showDetailModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content detail-modal">
                <div class="modal-header">
                    <h3>测试结果详情</h3>
                    <div class="modal-subtitle">
                        <span class="user-name">{{ selectedDetail?.user_info?.name || selectedDetail?.user_name
                            }}</span>
                        <span class="mbti-type">{{ selectedDetail?.test_results?.mbti_type || selectedDetail?.mbti_type
                            }}</span>
                        <span class="test-id">{{ selectedDetail?.test_id }}</span>
                    </div>
                    <button @click="closeModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- 标签页导航 -->
                    <div class="tab-navigation">
                        <button :class="['tab-btn', { active: activeTab === 'basic' }]" @click="activeTab = 'basic'">
                            <i class="fas fa-user"></i> 基本信息
                        </button>
                        <button :class="['tab-btn', { active: activeTab === 'dimensions' }]"
                            @click="activeTab = 'dimensions'">
                            <i class="fas fa-chart-bar"></i> 维度得分
                        </button>
                        <button :class="['tab-btn', { active: activeTab === 'answers' }]"
                            @click="activeTab = 'answers'">
                            <i class="fas fa-list-ol"></i> 答题详情
                            ({{ selectedDetail?.test_results?.answers?.length || 0 }}题)
                        </button>
                        <button :class="['tab-btn', { active: activeTab === 'metadata' }]"
                            @click="activeTab = 'metadata'">
                            <i class="fas fa-info-circle"></i> 测试信息
                        </button>
                    </div>

                    <!-- 基本信息标签页 -->
                    <div v-if="activeTab === 'basic' && selectedDetail" class="tab-content">
                        <div class="user-info-grid">
                            <div class="info-section">
                                <h4><i class="fas fa-id-card"></i> 身份信息</h4>
                                <div class="info-row">
                                    <span class="info-label">姓名:</span>
                                    <span class="info-value">{{ selectedDetail.user_info?.name ||
                                        selectedDetail.user_name ||
                                        '未提供' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">年龄:</span>
                                    <span class="info-value">{{ selectedDetail.user_info?.age || '未提供' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">性别:</span>
                                    <span class="info-value">{{ getGenderText(selectedDetail.user_info?.gender)
                                        }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">邮箱:</span>
                                    <span class="info-value">{{ selectedDetail.user_info?.email ||
                                        selectedDetail.user_email ||
                                        '未提供' }}</span>
                                </div>
                            </div>

                            <div class="info-section">
                                <h4><i class="fas fa-graduation-cap"></i> 教育背景</h4>
                                <div class="info-row">
                                    <span class="info-label">最高学历:</span>
                                    <span class="info-value">{{ getEducationText(selectedDetail.user_info?.education)
                                        }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">毕业院校:</span>
                                    <span class="info-value">{{ selectedDetail.user_info?.organization || '未提供'
                                        }}</span>
                                </div>
                            </div>

                            <div class="info-section">
                                <h4><i class="fas fa-briefcase"></i> 求职信息</h4>
                                <div class="info-row">
                                    <span class="info-label">求职类型:</span>
                                    <span class="info-value">{{ getEmploymentLabel(selectedDetail.user_info?.employment) }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">投递部门:</span>
                                    <span class="info-value">
                                        {{ getDepartmentLabels(selectedDetail.user_info?.purpose) }}
                                    </span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">所在地区:</span>
                                    <span class="info-value">{{ getRegionLabel(selectedDetail.user_info?.region) }}</span>
                                </div>
                            </div>

                            <div class="info-section full-width" v-if="selectedDetail.user_info?.comments">
                                <h4><i class="fas fa-comment"></i> 用户备注</h4>
                                <div class="comments-box">
                                    {{ selectedDetail.user_info.comments }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 维度得分标签页 -->
                    <div v-if="activeTab === 'dimensions' && selectedDetail" class="tab-content">
                        <div class="dimension-content">
                            <div class="mbti-result-header">
                                <div class="mbti-display-large">
                                    <span class="mbti-badge-xl"
                                        :class="getMbtiClass(selectedDetail.test_results?.mbti_type || selectedDetail.mbti_type)">
                                        {{ selectedDetail.test_results?.mbti_type || selectedDetail.mbti_type }}
                                    </span>
                                    <div class="type-description">
                                        {{ personalityDescriptions[selectedDetail.test_results?.mbti_type ||
                                        selectedDetail.mbti_type] || '暂无描述' }}
                                    </div>
                                </div>
                            </div>

                            <div class="dimension-scores-grid">
                                <div v-for="dim in (selectedDetail.test_results?.dimension_scores || [])"
                                    :key="dim.dimension" class="dimension-score-item">
                                    <div class="dimension-header">
                                        <span class="dimension-name">{{ dim.dimension }}</span>
                                        <span class="dimension-value">{{ dim.score }} ({{ dim.percentage }}%)</span>
                                    </div>
                                    <div class="dimension-bar">
                                        <div class="bar-background"></div>
                                        <div class="bar-progress" :style="{ width: dim.percentage + '%' }"></div>
                                    </div>
                                    <div class="dimension-explanation">
                                        {{ getDimensionExplanation(dim.dimension, dim.score) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 答题详情标签页 -->
                    <div v-if="activeTab === 'answers' && selectedDetail" class="tab-content answers-tab">
                        <div class="answers-header">
                            <div class="answers-summary">
                                <span>共 {{ selectedDetail.test_results?.answers?.length || 0 }} 道题</span>
                                <span>测试耗时: {{ selectedDetail.test_results?.test_duration || 0 }} 秒</span>
                                <button @click="toggleAnswerView" class="view-toggle-btn">
                                    <i class="fas" :class="showAllAnswers ? 'fa-th-list' : 'fa-th-large'"></i>
                                    {{ showAllAnswers ? '列表视图' : '网格视图' }}
                                </button>
                            </div>

                            <div class="answers-filter">
                                <input type="text" v-model="answerSearch" placeholder="搜索题目内容..."
                                    class="search-answers">
                                <select v-model="dimensionFilter" @change="filterAnswers">
                                    <option value="">所有维度</option>
                                    <option value="E">外向(E)</option>
                                    <option value="I">内向(I)</option>
                                    <option value="S">实感(S)</option>
                                    <option value="N">直觉(N)</option>
                                    <option value="T">思维(T)</option>
                                    <option value="F">情感(F)</option>
                                    <option value="J">判断(J)</option>
                                    <option value="P">感知(P)</option>
                                </select>
                            </div>
                        </div>

                        <!-- 网格视图 -->
                        <div v-if="showAllAnswers" class="answers-grid-view">
                            <div v-for="(answer, index) in filteredAnswers" :key="index" class="answer-card">
                                <div class="question-header">
                                    <span class="question-number">#{{ answer.question_id || index + 1 }}</span>
                                    <span class="question-dimension" :class="'dim-' + answer.score">
                                        {{ answer.score }}
                                    </span>
                                </div>
                                <div class="question-text">
                                    {{ answer.question || `问题 ${index + 1}` }}
                                </div>
                                <div class="selected-answer">
                                    <i class="fas fa-check-circle"></i>
                                    <strong>选择:</strong> {{ answer.selected_option || answer.answer || '未回答' }}
                                </div>
                            </div>
                        </div>

                        <!-- 列表视图 -->
                        <div v-else class="answers-list-view">
                            <div v-for="(answer, index) in filteredAnswers" :key="index" class="answer-item">
                                <div class="answer-header">
                                    <div class="answer-meta">
                                        <span class="answer-number">第 {{ answer.question_id || index + 1 }} 题</span>
                                        <span class="answer-dimension" :class="'dim-' + answer.score">
                                            {{ getDimensionFullName(answer.score) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="question-content">
                                    <div class="question-text">{{ answer.question || `问题 ${index + 1}` }}</div>
                                    <div class="user-choice">
                                        <div class="choice-header">
                                            <i class="fas fa-user-check"></i>
                                            <span>用户选择</span>
                                        </div>
                                        <div class="choice-content">{{ answer.selected_option || answer.answer || '未回答'
                                            }}</div>
                                    </div>
                                    <div class="dimension-impact">
                                        <span class="impact-label">影响维度:</span>
                                        <span class="impact-value" :class="'dim-' + answer.score">
                                            {{ answer.score }} ({{ getDimensionImpact(answer.score) }})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 答题分页 - 已移除，现在显示所有答案 -->
                        <!-- <div v-if="filteredAnswers.length > 20" class="answers-pagination">
                            <button @click="prevAnswerPage" :disabled="answerPage === 1" class="page-btn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="page-info">
                                第 {{ answerPage }} 页 / 共 {{ Math.ceil(filteredAnswers.length / answersPerPage) }} 页
                            </span>
                            <button @click="nextAnswerPage"
                                :disabled="answerPage === Math.ceil(filteredAnswers.length / answersPerPage)"
                                class="page-btn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div> -->
                    </div>

                    <!-- 测试信息标签页 -->
                    <div v-if="activeTab === 'metadata' && selectedDetail" class="tab-content">
                        <div class="metadata-grid">
                            <div class="metadata-item">
                                <span class="metadata-label">测试ID:</span>
                                <span class="metadata-value">{{ selectedDetail.test_id }}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">提交时间:</span>
                                <span class="metadata-value">{{ formatDateTime(selectedDetail.submission_time) }}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">测试耗时:</span>
                                <span class="metadata-value">{{ selectedDetail.test_results?.test_duration || 0 }}
                                    秒</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">测试版本:</span>
                                <span class="metadata-value">{{ selectedDetail.metadata?.test_version || '未知' }}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">IP地址:</span>
                                <span class="metadata-value">{{ selectedDetail.metadata?.ip_address || '未知' }}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">设备信息:</span>
                                <span class="metadata-value">{{ selectedDetail.metadata?.user_agent || '未知' }}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">屏幕分辨率:</span>
                                <span class="metadata-value">{{ selectedDetail.metadata?.screen_resolution || '未知'
                                    }}</span>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">测试平台:</span>
                                <span class="metadata-value">{{ selectedDetail.metadata?.platform || 'web' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="footer-left">
                        <span class="status-display">
                            当前状态:
                            <span :class="`status-badge status-${selectedDetail?.status}`">
                                {{ getStatusText(selectedDetail?.status) }}
                            </span>
                        </span>
                    </div>
                    <div class="footer-right">
                        <button @click="exportSingleResult(selectedDetail)" class="btn-secondary">
                            <i class="fas fa-download"></i> 导出JSON
                        </button>
                        <button @click="showReviewModal(selectedDetail)" class="btn-primary">
                            <i class="fas fa-check-circle"></i> 审核此结果
                        </button>
                        <button @click="closeModal" class="btn-secondary">
                            <i class="fas fa-times"></i> 关闭
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 审核模态框 -->
        <div v-if="showReviewModalFlag" class="modal-overlay review-modal-overlay" @click.self="closeReviewModal">
            <div class="modal-content review-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle"></i> 审核测试结果</h3>
                    <button @click="closeReviewModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="review-target-info">
                        <div class="user-info-summary">
                            <div class="user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="user-details">
                                <h4>{{ reviewTarget?.user_info?.name || reviewTarget?.user_name || '未命名用户' }}</h4>
                                <p>
                                    <i class="fas fa-envelope"></i>
                                    {{ reviewTarget?.user_info?.email || reviewTarget?.user_email || '未提供' }}
                                </p>
                                <div class="mbti-status">
                    <span class="mbti-badge" :class="getMbtiClass(reviewTarget?.test_results?.mbti_type || reviewTarget?.mbti_type)">
                        {{ reviewTarget?.test_results?.mbti_type || reviewTarget?.mbti_type || '未分类' }}
                    </span>
                    <span class="status-badge" :class="`status-${reviewTarget?.status}`">
                        {{ getStatusText(reviewTarget?.status) }}
                    </span>
                </div>
                            </div>
                        </div>
                    </div>

                    <div class="review-form">
                        <div class="form-group">
                            <label for="reviewStatus" class="form-label">
                                <i class="fas fa-flag"></i> 设置审核状态
                            </label>
                            <select id="reviewStatus" v-model="reviewData.status" class="form-select">
                                <option value="pending">待审核 ⏳</option>
                                <option value="processed">已处理 ✓</option>
                                <option value="rejected">已拒绝 ✗</option>
                                <option value="archived">已归档 📁</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="reviewNotes" class="form-label">
                                <i class="fas fa-edit"></i> 审核意见
                            </label>
                            <textarea id="reviewNotes" v-model="reviewData.notes" placeholder="请输入审核意见或备注..." rows="5"
                                class="form-textarea"></textarea>
                            <small class="form-hint">请输入详细的审核意见，此内容将作为审核记录保存</small>
                        </div>

                        <div class="form-checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="reviewData.notifyUser" class="checkbox-input">
                                <span class="checkbox-custom"></span>
                                <span class="checkbox-text">
                                    <i class="fas fa-bell"></i> 通过邮件通知用户审核结果
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="footer-actions">
                        <button @click="closeReviewModal" class="btn-secondary">
                            <i class="fas fa-times"></i> 取消
                        </button>
                        <button @click="submitReview" class="btn-primary"
                            :disabled="reviewLoading || !reviewData.status">
                            <i class="fas" :class="reviewLoading ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                            {{ reviewLoading ? '提交中...' : '确认审核' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 删除确认模态框 -->
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
            <div class="modal-content delete-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> 确认删除</h3>
                </div>

                <div class="modal-body">
                    <p v-if="isBatchDelete">确定要删除选中的 {{ selectedResults.length }} 个测试结果吗？此操作不可撤销。</p>
                    <p v-else>确定要删除以下测试结果吗？此操作不可撤销。</p>
                    
                    <!-- 批量删除时显示选中数量 -->
                    <div class="delete-info" v-if="isBatchDelete">
                        <div class="batch-delete-count">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>您即将删除 <strong>{{ selectedResults.length }}</strong> 条记录，此操作无法恢复。</span>
                        </div>
                    </div>
                    
                    <!-- 单个删除时显示详细信息 -->
                    <div class="delete-info" v-else>
                        <p><strong>姓名:</strong> {{ deleteTarget?.user_info?.name || deleteTarget?.user_name }}</p>
                        <p><strong>测试ID:</strong> {{ deleteTarget?.test_id }}</p>
                        <p><strong>MBTI类型:</strong> {{ deleteTarget?.test_results?.mbti_type || deleteTarget?.mbti_type
                            }}</p>
                        <p><strong>提交时间:</strong> {{ formatDateTime(deleteTarget?.submission_time) }}</p>
                    </div>

                    <div class="form-group">
                        <label class="confirm-label">
                            <input type="checkbox" v-model="confirmDeletePermanently">
                            <span>{{ isBatchDelete ? '我确认永久删除选中的测试结果' : '我确认永久删除此测试结果' }}</span>
                        </label>
                    </div>
                </div>

                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn-secondary">
                        取消
                    </button>
                    <button @click="performDelete" class="btn-danger" :disabled="!confirmDeletePermanently">
                        <i class="fas fa-trash"></i> {{ isBatchDelete ? '批量删除' : '永久删除' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 英文名字备注模态框 -->
        <div v-if="showEnglishNameModal" class="modal-overlay" @click.self="closeEnglishNameModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> 备注英文名字</h3>
                </div>
                <div class="modal-body">
                    <div class="edit-info">
                        <p><strong>姓名:</strong> {{ editTarget?.user_info?.name || editTarget?.user_name }}</p>
                        <p><strong>测试ID:</strong> {{ editTarget?.test_id }}</p>
                    </div>
                    <div class="form-group">
                        <label for="englishName">英文名字:</label>
                        <input type="text" id="englishName" v-model="englishNameInput" placeholder="请输入被测者的英文名字" class="form-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeEnglishNameModal" class="btn-secondary">取消</button>
                    <button @click="saveEnglishName" class="btn-primary">保存</button>
                </div>
            </div>
        </div>

        <!-- 通知组件 -->
        <div v-if="notification.show" :class="['notification', notification.type]">
            <i class="fas" :class="notification.icon"></i>
            <span>{{ notification.message }}</span>
        </div>

        <!-- 新建管理员模态框 -->
        <div v-if="showCreateAdminModal" class="modal-overlay" @click.self="closeAdminModals">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> 新建管理员账户</h3>
                    <button @click="showCreateAdminModal = false" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="newAdminUsername" class="form-label">
                            <i class="fas fa-user"></i> 用户名
                        </label>
                        <input type="text" id="newAdminUsername" v-model="newAdminForm.username" placeholder="请输入用户名" required
                            class="form-input">
                    </div>

                    <div class="form-group">
                        <label for="newAdminPassword" class="form-label">
                            <i class="fas fa-key"></i> 密码
                        </label>
                        <input type="password" id="newAdminPassword" v-model="newAdminForm.password" placeholder="请输入密码" required
                            class="form-input">
                    </div>

                    <div class="form-group">
                        <label for="newAdminDisplayName" class="form-label">
                            <i class="fas fa-id-card"></i> 显示名称
                        </label>
                        <input type="text" id="newAdminDisplayName" v-model="newAdminForm.displayName" placeholder="请输入显示名称（可选）"
                            class="form-input">
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="footer-actions">
                        <button @click="showCreateAdminModal = false" class="btn-secondary">
                            <i class="fas fa-times"></i> 取消
                        </button>
                        <button @click="createAdmin" class="btn-primary" :disabled="createAdminLoading || !newAdminForm.username || !newAdminForm.password">
                            <i class="fas" :class="createAdminLoading ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                            {{ createAdminLoading ? '创建中...' : '创建管理员' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 修改密码模态框 -->
        <div v-if="showChangePasswordModal" class="modal-overlay" @click.self="closeAdminModals">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> 修改密码</h3>
                    <button @click="showChangePasswordModal = false" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="currentPassword" class="form-label">
                            <i class="fas fa-lock"></i> 当前密码
                        </label>
                        <input type="password" id="currentPassword" v-model="changePasswordForm.currentPassword" placeholder="请输入当前密码" required
                            class="form-input">
                    </div>

                    <div class="form-group">
                        <label for="newPassword" class="form-label">
                            <i class="fas fa-key"></i> 新密码
                        </label>
                        <input type="password" id="newPassword" v-model="changePasswordForm.newPassword" placeholder="请输入新密码" required
                            class="form-input">
                    </div>

                    <div class="form-group">
                        <label for="confirmNewPassword" class="form-label">
                            <i class="fas fa-check-circle"></i> 确认新密码
                        </label>
                        <input type="password" id="confirmNewPassword" v-model="changePasswordForm.confirmNewPassword" placeholder="请再次输入新密码" required
                            class="form-input">
                        <div v-if="changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword && changePasswordForm.confirmNewPassword" class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>两次输入的密码不一致</span>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="footer-actions">
                        <button @click="showChangePasswordModal = false" class="btn-secondary">
                            <i class="fas fa-times"></i> 取消
                        </button>
                        <button @click="changePassword" class="btn-primary" 
                            :disabled="changePasswordLoading || !changePasswordForm.currentPassword || !changePasswordForm.newPassword || changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword">
                            <i class="fas" :class="changePasswordLoading ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                            {{ changePasswordLoading ? '修改中...' : '确认修改' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 上传JSON模态框 -->
        <div v-if="showUploadJsonModal" class="modal-overlay" @click.self="closeAdminModals">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-upload"></i> 上传JSON文件</h3>
                    <button @click="showUploadJsonModal = false" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-file-alt"></i> 选择JSON文件
                        </label>
                        <input type="file" accept=".json" @change="handleFileSelect" class="form-input file-input">
                        <small class="form-hint">请选择从系统导出的JSON格式测试结果文件</small>
                    </div>

                    <div v-if="selectedFile" class="file-preview">
                        <div class="file-info">
                            <i class="fas fa-file-json"></i>
                            <span>{{ selectedFile.name }}</span>
                            <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
                        </div>
                        <button @click="selectedFile = null; jsonPreview = null" class="btn-secondary small-btn">
                            <i class="fas fa-times"></i> 移除文件
                        </button>
                    </div>

                    <div v-if="jsonPreview" class="json-preview">
                        <h4><i class="fas fa-eye"></i> JSON预览</h4>
                        <div class="json-content">
                            <pre>{{ JSON.stringify(jsonPreview, null, 2) }}</pre>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="footer-actions">
                        <button @click="showUploadJsonModal = false; selectedFile = null; jsonPreview = null" class="btn-secondary">
                            <i class="fas fa-times"></i> 取消
                        </button>
                        <button @click="uploadJsonFile" class="btn-primary" 
                            :disabled="uploadJsonLoading || !selectedFile || !jsonPreview">
                            <i class="fas" :class="uploadJsonLoading ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
                            {{ uploadJsonLoading ? '上传中...' : '上传并导入' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import apiService from '../services/apiService'
import { personalityDescriptions } from '../data/mbtiData.js'
import { dimensionExplanations, getDimensionScoreText } from '../data/dimensionData.js'

///后台数据监控
// 添加定时刷新
const refreshInterval = ref(null)

const loadTestResults = async () => {
    try {
        loading.value = true

        const filters = {
            page: currentPage.value,
            limit: itemsPerPage,
            search: searchQuery.value,
            mbti_type: selectedType.value,
            status: statusFilter.value,
            candidate_type: candidateTypeFilter.value
        }

        const response = await apiService.getTestResults(filters)

        if (response.success) {
            testResults.value = (response.data.results || []).map(processResultData)
            totalItems.value = response.data.total || 0
            totalPages.value = Math.ceil(totalItems.value / itemsPerPage)

            // 更新统计数据
            await updateStats()
        }
    } catch (error) {
        console.error('加载测试结果失败:', error)
        showNotification('加载数据失败: ' + error.message, 'error')
    } finally {
        loading.value = false
    }
}

// 修改updateStats函数，确保正确解析API响应
const updateStats = async () => {
    try {
        const response = await apiService.getStatistics()
        console.log('统计数据响应:', response) // 添加日志

        if (response.success && response.data) {
            // 确保数据类型正确
            stats.totalTests = Number(response.data.totalTests) || 0
            stats.todayTests = Number(response.data.todayTests) || 0
            stats.pendingReview = Number(response.data.pendingReview) || 0
            stats.uniqueUsers = Number(response.data.uniqueUsers) || 0
        } else {
            // 如果API返回格式不同，尝试直接使用响应数据
            console.log('使用备用统计数据格式')
            stats.totalTests = Number(response.totalTests) || 0
            stats.todayTests = Number(response.todayTests) || 0
            stats.pendingReview = Number(response.pendingReview) || 0
            stats.uniqueUsers = Number(response.uniqueUsers) || 0
        }
    } catch (error) {
        console.error('获取统计数据失败:', error)
        // 从当前数据中计算统计（备用方案）
        calculateStatsFromResults()
    }
}

// 备用方案：从当前数据计算统计
const calculateStatsFromResults = () => {
    const today = new Date().toISOString().split('T')[0]

    stats.totalTests = testResults.value.length
    stats.todayTests = testResults.value.filter(result => {
        const resultDate = new Date(result.submission_time).toISOString().split('T')[0]
        return resultDate === today
    }).length
    stats.pendingReview = testResults.value.filter(result =>
        result.status === 'pending'
    ).length
    stats.uniqueUsers = new Set(testResults.value.map(result =>
        result.user_info?.email || result.user_email || 'unknown'
    )).size
}


// 组件卸载时清除定时器
onUnmounted(() => {
    if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
    }
})


// 缺少以下变量声明
const loginForm = reactive({
    username: '',
    password: ''
})
const isLoggingIn = ref(false)
const loginError = ref('')
const showPassword = ref(false)

// 新建管理员相关变量
const showCreateAdminModal = ref(false)
const newAdminForm = reactive({
    username: '',
    password: '',
    displayName: ''
})
const createAdminLoading = ref(false)

// 修改密码相关变量
const showChangePasswordModal = ref(false)
const changePasswordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
})
const changePasswordLoading = ref(false)

// 缺少以下函数声明
const logout = () => {
    // 清除本地存储
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    // 重置状态
    isAuthenticated.value = false
    adminUser.value = null
    // 显示通知
    showNotification('已成功退出', 'success')
}

// 新建管理员
const createAdmin = async () => {
    try {
        createAdminLoading.value = true
        
        const response = await apiService.createAdmin(newAdminForm)
        
        showNotification('新管理员账户创建成功', 'success')
        showCreateAdminModal.value = false
        
        // 重置表单
        newAdminForm.username = ''
        newAdminForm.password = ''
        newAdminForm.displayName = ''
        
    } catch (error) {
        console.error('创建管理员失败:', error)
        showNotification('创建管理员账户失败: ' + error.message, 'error')
    } finally {
        createAdminLoading.value = false
    }
}

// 修改密码
const changePassword = async () => {
    try {
        changePasswordLoading.value = true
        
        const response = await apiService.changePassword({
            currentPassword: changePasswordForm.currentPassword,
            newPassword: changePasswordForm.newPassword
        })
        
        showNotification('密码修改成功', 'success')
        showChangePasswordModal.value = false
        
        // 重置表单
        changePasswordForm.currentPassword = ''
        changePasswordForm.newPassword = ''
        changePasswordForm.confirmNewPassword = ''
        
    } catch (error) {
        console.error('修改密码失败:', error)
        showNotification('修改密码失败: ' + error.message, 'error')
    } finally {
        changePasswordLoading.value = false
    }
}

// 关闭管理员相关模态框
const closeAdminModals = () => {
    showCreateAdminModal.value = false
    showChangePasswordModal.value = false
    showUploadJsonModal.value = false
    selectedFile.value = null
    jsonPreview.value = null
}

// 上传JSON相关变量
const showUploadJsonModal = ref(false)
const selectedFile = ref(null)
const jsonPreview = ref(null)
const uploadJsonLoading = ref(false)

// 处理文件选择
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
        
        // 读取文件内容并预览
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)
                jsonPreview.value = data
            } catch (error) {
                showNotification('无效的JSON文件', 'error')
                selectedFile.value = null
                jsonPreview.value = null
            }
        }
        reader.readAsText(file)
    }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 上传JSON文件
const uploadJsonFile = async () => {
    try {
        uploadJsonLoading.value = true
        
        const response = await apiService.uploadJsonFile(jsonPreview.value)
        
        showNotification('JSON文件上传成功', 'success')
        showUploadJsonModal.value = false
        selectedFile.value = null
        jsonPreview.value = null
        
        // 刷新测试结果列表
        await loadTestResults()
        
    } catch (error) {
        console.error('上传JSON文件失败:', error)
        showNotification('上传JSON文件失败: ' + error.message, 'error')
    } finally {
        uploadJsonLoading.value = false
    }
}

// 新增样式
const style = document.createElement('style')
style.textContent = `
    /* 管理员操作按钮样式 */
    .admin-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
    }
    
    .admin-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background-color 0.3s;
    }
    
    .admin-btn:hover {
        background-color: #45a049;
    }
    
    .logout-btn {
        background-color: #f44336;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background-color 0.3s;
    }
    
    .logout-btn:hover {
        background-color: #da190b;
    }
    
    /* 模态框样式增强 */
    .modal-content {
        max-width: 500px;
        width: 90%;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        animation: modalFadeIn 0.3s ease-out;
    }
    
    @keyframes modalFadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background-color: #f5f5f5;
        border-radius: 8px 8px 0 0;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .close-btn:hover {
        background-color: #e0e0e0;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        background-color: #f5f5f5;
        border-radius: 0 0 8px 8px;
    }
    
    .footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
    
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .form-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s;
    }
    
    .form-input:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
    
    .btn-primary {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.3s;
    }
    
    .btn-primary:hover:not(:disabled) {
        background-color: #45a049;
    }
    
    .btn-primary:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
    
    .btn-secondary {
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s;
    }
    
    .btn-secondary:hover {
        background-color: #e0e0e0;
        border-color: #ccc;
    }
    
    .error-message {
        color: #f44336;
        font-size: 12px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    /* 文件上传样式 */
    .file-input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #f9f9f9;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .file-input:hover {
        background-color: #f0f0f0;
        border-color: #4CAF50;
    }
    
    .form-hint {
        display: block;
        margin-top: 4px;
        color: #666;
        font-size: 12px;
    }
    
    .file-preview {
        margin-top: 16px;
        padding: 12px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .file-size {
        color: #666;
        font-size: 12px;
    }
    
    .small-btn {
        padding: 4px 8px;
        font-size: 12px;
    }
    
    .json-preview {
        margin-top: 16px;
        padding: 12px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .json-preview h4 {
        margin-top: 0;
        margin-bottom: 12px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .json-content {
        max-height: 300px;
        overflow-y: auto;
        background-color: #f0f0f0;
        padding: 12px;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
    }
    
    .json-content pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
        .admin-actions {
            flex-direction: column;
            margin-left: 0;
            margin-top: 8px;
        }
        
        .admin-btn,
        .logout-btn {
            width: 100%;
            justify-content: center;
        }
        
        .modal-content {
            width: 95%;
            margin: 20px;
        }
        
        .file-preview {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .json-content {
            max-height: 200px;
        }
    }
`
document.head.appendChild(style)

// 修改processResultData函数，统一邮箱字段处理
const processResultData = (result) => {
    // 调试日志
    console.log('原始数据:', result)

    // 统一提取邮箱，按优先级尝试不同字段
    const email =
        result.email ||
        result.user_email ||
        result.user_info?.email ||
        (result.user_info && typeof result.user_info === 'object' ?
            result.user_info.email : null) ||
        null

    // 统一提取用户名
    const name =
        result.name ||
        result.user_name ||
        result.user_info?.name ||
        (result.user_info && typeof result.user_info === 'object' ?
            result.user_info.name : null) ||
        '未提供'

    // 构建统一的数据结构
    const processedResult = {
        id: result.id || result._id,
        test_id: result.test_id,
        email: email,
        name: name,
        mbti_type: result.mbti_type || result.test_results?.mbti_type,
        completion: result.completion || calculateCompletion(result),
        submission_time: result.submission_time,
        status: result.status,
        review_notes: result.review_notes,
        candidate_type: ['interview', 'employee', 'former'].includes(result.candidate_type) ? result.candidate_type : 'interview', // 添加候选人类型，确保有效值，默认面试人员
        english_name: result.english_name || result.user_info?.english_name || '', // 添加英文名字
        user_info: {
            email: email,
            name: name,
            ...(typeof result.user_info === 'object' ? result.user_info : {}),
            age: result.user_info?.age || result.age,
            gender: result.user_info?.gender || result.gender,
            education: result.user_info?.education || result.education,
            organization: result.user_info?.organization || result.organization,
            employment: result.user_info?.employment || result.employment,
            purpose: result.user_info?.purpose || result.purpose,
            region: result.user_info?.region || result.region,
            comments: result.user_info?.comments || result.comments,
            english_name: result.user_info?.english_name || '' // 添加英文名字到user_info
        },
        test_results: result.test_results || {},
        metadata: result.metadata || {}
    }

    console.log('处理后的数据:', processedResult)
    return processedResult
}

const debouncedSearch = () => {
    // 防抖搜索逻辑
    if (searchQuery.value.trim() === '') {
        loadTestResults()
    } else {
        // 可以添加防抖逻辑
        loadTestResults()
    }
}

// 求职类型转换为中文
const getEmploymentLabel = (Employment) => {
    const employmentMap = {
        'intern': '实习',
        'school': '校招',
        'social': '社招'
    }
    return employmentMap[Employment] || Employment || '未提供'
}

// 投递部门转换为中文
const getDepartmentLabels = (departments) => {
    const deptMap = {
        'II': '创新投资部',
        'HR': '人力资源部',
        'IR': '投研部',
        'TB': '技术开发部',
        'OP': '运营部',
        'LE': '生活效率部'
    }
    
    if (!departments) return '未指定'
    
    const deptArray = Array.isArray(departments) ? departments : [departments]
    const chineseDepts = deptArray.map(dept => deptMap[dept] || dept)
    
    return chineseDepts.join('、')
}

// 地区转换为中文
const getRegionLabel = (region) => {
    const regionMap = {
        'bj': '北京',
        'tj': '天津',
        'hb': '河北',
        'sx': '山西',
        'nmg': '内蒙古',
        'sh': '上海',
        'js': '江苏',
        'zj': '浙江',
        'ah': '安徽',
        'fj': '福建',
        'jx': '江西',
        'sd': '山东',
        'gd': '广东',
        'gx': '广西',
        'hn': '海南',
        'hnn': '河南',
        'hb': '湖北',
        'hhn': '湖南',
        'ln': '辽宁',
        'jl': '吉林',
        'hlj': '黑龙江',
        'cq': '重庆',
        'sc': '四川',
        'gz': '贵州',
        'yn': '云南',
        'xz': '西藏',
        'sxx': '陕西',
        'gs': '甘肃',
        'qh': '青海',
        'nx': '宁夏',
        'xj': '新疆',
        'hongkong-macao-taiwan': '港澳台地区',
        'overseas': '海外'
    }
    return regionMap[region] || region || '未提供'
}

const exportData = async () => {
    try {
        isExporting.value = true
        showNotification('正在导出数据...', 'info')

        const token = localStorage.getItem('admin_token')
        if (!token) {
            showNotification('未登录，请先登录', 'error')
            isExporting.value = false
            return
        }

        const params = new URLSearchParams()
        params.append('page', '1')
        params.append('limit', '1000')
        if (searchQuery.value) params.append('search', searchQuery.value)
        if (selectedType.value) params.append('mbti_type', selectedType.value)
        if (statusFilter.value) params.append('status', statusFilter.value)

        const url = `${apiService.baseURL}/admin/results?${params.toString()}`
        console.log('导出API URL:', url)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const result = await response.json()
        console.log('导出API响应:', result)

        if (!response.ok) {
            throw new Error(result.message || '获取数据失败，HTTP状态: ' + response.status)
        }

        if (!result.success) {
            throw new Error(result.message || '获取数据失败')
        }

        const results = result.data?.results || []
        console.log('获取到数据条数:', results.length)

        if (results.length === 0) {
            showNotification('没有可导出的数据', 'warning')
            isExporting.value = false
            return
        }

        const headers = [
            '测试ID', '姓名', '年龄', '性别', '邮箱', '求职类型', '投递部门',
            '学历', '毕业院校', '所在地区', 'MBTI类型',
            'E维度得分', 'I维度得分', 'S维度得分', 'N维度得分',
            'T维度得分', 'F维度得分', 'J维度得分', 'P维度得分',
            '测试耗时(秒)', '提交时间', '审核状态', '审核意见', '审核人', '审核时间', '用户备注'
        ]

        const regionMap = {
            'bj': '北京', 'tj': '天津', 'hb': '河北', 'sx': '山西', 'nmg': '内蒙古',
            'sh': '上海', 'js': '江苏', 'zj': '浙江', 'ah': '安徽', 'fj': '福建',
            'jx': '江西', 'sd': '山东', 'gd': '广东', 'gx': '广西', 'hn': '海南',
            'hnn': '河南', 'hhn': '湖北', 'hhn': '湖南', 'ln': '辽宁', 'jl': '吉林',
            'hlj': '黑龙江', 'cq': '重庆', 'sc': '四川', 'gz': '贵州', 'yn': '云南',
            'xz': '西藏', 'sxx': '陕西', 'gs': '甘肃', 'qh': '青海', 'nx': '宁夏',
            'xj': '新疆', 'hongkong-macao-taiwan': '港澳台地区', 'overseas': '海外'
        }

        const deptMap = {
            'II': '创新投资部', 'HR': '人力资源部', 'IR': '投研部',
            'TB': '技术开发部', 'OP': '运营部', 'LE': '生活效率部'
        }

        const statusMap = {
            'pending': '待审核', 'processed': '已处理', 'rejected': '已拒绝', 'archived': '已归档'
        }

        const empMap = {
            'intern': '实习', 'school': '校招', 'social': '社招'
        }

        const rows = results.map(r => {
            const dimScores = r.test_results?.dimension_scores || []
            const getDimScore = (dim) => {
                const found = dimScores.find(d => d.dimension === dim)
                return found ? `${found.score} (${found.percentage}%)` : '0%'
            }

            return [
                r.test_id || r.id || '',
                r.user_info?.name || r.user_name || '',
                r.user_info?.age || '',
                r.user_info?.gender || '',
                r.user_info?.email || r.email || '',
                empMap[r.user_info?.employment] || r.user_info?.employment || '',
                deptMap[r.user_info?.purpose] || r.user_info?.purpose || '',
                r.user_info?.education || '',
                r.user_info?.organization || '',
                regionMap[r.user_info?.region] || r.user_info?.region || '',
                r.test_results?.mbti_type || r.mbti_type || '',
                getDimScore('E'), getDimScore('I'), getDimScore('S'), getDimScore('N'),
                getDimScore('T'), getDimScore('F'), getDimScore('J'), getDimScore('P'),
                r.test_results?.test_duration || 0,
                r.submission_time ? new Date(r.submission_time).toLocaleString('zh-CN') : '',
                statusMap[r.status] || r.status || '',
                r.review_notes || '',
                r.reviewed_by || '',
                r.reviewed_at ? new Date(r.reviewed_at).toLocaleString('zh-CN') : '',
                r.user_info?.comments || ''
            ]
        })

        let csvContent = headers.map(h => `"${h}"`).join(',') + '\n'
        rows.forEach(row => {
            csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n'
        })

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `MBTI测试结果_${new Date().toISOString().slice(0, 10)}.csv`
        link.click()
        window.URL.revokeObjectURL(downloadUrl)

        showNotification(`成功导出 ${results.length} 条数据到CSV文件`, 'success')
    } catch (error) {
        console.error('导出数据错误:', error)
        showNotification('导出失败: ' + error.message, 'error')
    } finally {
        isExporting.value = false
    }
}

const refreshData = () => {
    loadTestResults()
}

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedResults.value = testResults.value.map(result => result.id)
    } else {
        selectedResults.value = []
    }
}

const applyBatchStatus = async () => {
    try {
        if (!batchStatus.value) {
            showNotification('请先选择要设置的状态', 'warning')
            return
        }
        
        if (selectedResults.value.length === 0) {
            showNotification('请先选择要处理的测试结果', 'warning')
            return
        }
        
        // 显示加载状态
        loading.value = true
        
        // 调用API批量更新状态
        const response = await apiService.batchUpdateStatus(selectedResults.value, batchStatus.value)
        
        if (response.success) {
            showNotification(`成功更新 ${selectedResults.value.length} 个测试结果的状态`, 'success')
            // 刷新数据
            await loadTestResults()
            // 清除选择
            clearSelection()
            // 重置批量状态
            batchStatus.value = ''
        } else {
            showNotification('批量更新状态失败: ' + response.message, 'error')
        }
    } catch (error) {
        console.error('批量更新状态错误:', error)
        showNotification('批量更新状态失败: ' + error.message, 'error')
    } finally {
        loading.value = false
    }
}

const clearSelection = () => {
    selectedResults.value = []
    selectAll.value = false
}
const getPageRange = () => {
  const range = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadTestResults()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadTestResults()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadTestResults()
  }
}

const getMbtiClass = (mbtiType) => {
  if (!mbtiType) return ''
  const firstChar = mbtiType.charAt(0).toUpperCase()
  return `dim-${firstChar}`
}

// 格式化维度得分显示为 E9I12-N12S14-T22F2-J19P3 格式
const formatDimensionScores = (dimensionScores) => {
  if (!dimensionScores || !Array.isArray(dimensionScores) || dimensionScores.length === 0) {
    return ''
  }
  
  // 定义维度对
  const dimensionPairs = [
    ['E', 'I'],
    ['N', 'S'],
    ['T', 'F'],
    ['J', 'P']
  ]
  
  const parts = []
  
  dimensionPairs.forEach(pair => {
    const dim1 = dimensionScores.find(d => d.dimension === pair[0])
    const dim2 = dimensionScores.find(d => d.dimension === pair[1])
    
    if (dim1 && dim2) {
      parts.push(`${pair[0]}${dim1.score}${pair[1]}${dim2.score}`)
    }
  })
  
  return parts.join('-')
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'processed': '已处理',
    'rejected': '已拒绝',
    'archived': '已归档'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getGenderText = (gender) => {
  const genderMap = {
    'male': '男',
    'female': '女',
    'other': '其他'
  }
  return genderMap[gender] || gender || '未提供'
}

const getEducationText = (education) => {
  const educationMap = {
    'highschool': '高中',
    'bachelor': '本科',
    'master': '硕士',
    'phd': '博士',
    'other': '其他'
  }
  return educationMap[education] || education || '未提供'
}


const closeModal = () => {
  showDetailModal.value = false
  selectedDetail.value = null
  activeTab.value = 'basic'
  answerSearch.value = ''
  dimensionFilter.value = ''
}

const toggleAnswerView = () => {
  showAllAnswers.value = !showAllAnswers.value
  answerPage.value = 1
}

const prevAnswerPage = () => {
  if (answerPage.value > 1) {
    answerPage.value--
  }
}

const nextAnswerPage = () => {
  const totalPages = Math.ceil(filteredAnswers.value.length / answersPerPage.value)
  if (answerPage.value < totalPages) {
    answerPage.value++
  }
}

const exportSingleResult = (result) => {
    if (!result) {
        showNotification('未选择要导出的结果', 'warning')
        return
    }

    try {
        const exportData = {
            导出时间: new Date().toLocaleString('zh-CN'),
            测试信息: {
                测试ID: result.test_id || result.id || '',
                提交时间: result.submission_time ? new Date(result.submission_time).toLocaleString('zh-CN') : '',
                测试耗时: result.test_results?.test_duration ? `${result.test_results.test_duration}秒` : '未知',
                MBTI类型: result.test_results?.mbti_type || result.mbti_type || '未分类'
            },
            用户信息: {
                姓名: result.user_info?.name || result.user_name || '未提供',
                年龄: result.user_info?.age || '未提供',
                性别: result.user_info?.gender || '未提供',
                邮箱: result.user_info?.email || result.email || '未提供',
                求职类型: result.user_info?.employment || '未提供',
                投递部门: result.user_info?.purpose || '未提供',
                学历: result.user_info?.education || '未提供',
                毕业院校: result.user_info?.organization || '未提供',
                所在地区: result.user_info?.region || '未提供',
                用户备注: result.user_info?.comments || '无'
            },
            维度得分: (result.test_results?.dimension_scores || []).map(dim => ({
                维度: dim.dimension,
                得分: dim.score,
                百分比: `${dim.percentage}%`,
                说明: dim.explanation || ''
            })),
            答题详情: (result.test_results?.answers || []).map((answer, index) => ({
                题号: answer.question_id || index + 1,
                问题: answer.question || `问题 ${index + 1}`,
                用户选择: answer.selected_option || answer.answer || '未回答',
                影响维度: answer.score || '未知'
            })),
            审核信息: {
                当前状态: result.status || 'pending',
                审核意见: result.review_notes || '暂无',
                审核人: result.reviewed_by || '未审核',
                审核时间: result.reviewed_at ? new Date(result.reviewed_at).toLocaleString('zh-CN') : '未审核'
            },
            元数据: {
                测试版本: result.metadata?.test_version || '未知',
                测试平台: result.metadata?.platform || 'web',
                IP地址: result.metadata?.ip_address || '未知',
                设备信息: result.metadata?.user_agent || '未知'
            }
        }

        const jsonStr = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        const fileName = `MBTI_${(result.user_info?.name || result.user_name || '未知用户')}_${(result.test_results?.mbti_type || result.mbti_type || '未知')}_${new Date().toISOString().slice(0, 10)}.json`
        link.href = url
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(url)

        showNotification('已成功导出JSON文件', 'success')
    } catch (error) {
        console.error('导出JSON错误:', error)
        showNotification('导出失败: ' + error.message, 'error')
    }
}

const closeReviewModal = () => {
  showReviewModalFlag.value = false
  reviewTarget.value = null
  reviewData.status = 'processed'
  reviewData.notes = ''
  reviewData.notifyUser = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteTarget.value = null
  confirmDeletePermanently.value = false
}

const stats = reactive({
  totalTests: 0,
  todayTests: 0,
  pendingReview: 0,
  uniqueUsers: 0
})

const mbtiTypes = ref([
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
])

// 数据状态
const isAuthenticated = ref(false)
const adminUser = ref(null)
const testResults = ref([])
const loading = ref(false)
const isExporting = ref(false)
const totalItems = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const itemsPerPage = 20

// 筛选和搜索
const searchQuery = ref('')
const statusFilter = ref('')
const selectedType = ref('')
const candidateTypeFilter = ref('')
const selectedResults = ref([])
const selectAll = ref(false)
const batchStatus = ref('')

// 详情模态框相关
const showDetailModal = ref(false)
const selectedDetail = ref(null)
const activeTab = ref('basic')
const showAllAnswers = ref(true)
const answerSearch = ref('')
const dimensionFilter = ref('')
const answerPage = ref(1)
const answersPerPage = ref(20)

// 英文名字备注相关
const showEnglishNameModal = ref(false)
const editTarget = ref(null)
const englishNameInput = ref('')

// 审核模态框相关
const showReviewModalFlag = ref(false)
const reviewTarget = ref(null)
const reviewData = reactive({
    status: 'processed',
    notes: '',
    notifyUser: false
})
const reviewLoading = ref(false)

// 删除模态框相关
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const confirmDeletePermanently = ref(false)
const isBatchDelete = ref(false)

// 操作菜单相关
const openActionMenu = ref(null)

const toggleActionMenu = (resultId) => {
    if (openActionMenu.value === resultId) {
        openActionMenu.value = null
    } else {
        openActionMenu.value = resultId
    }
}

const closeActionMenu = () => {
    openActionMenu.value = null
}

// 点击外部关闭操作菜单
const handleClickOutside = (event) => {
    if (!event.target.closest('.action-dropdown')) {
        openActionMenu.value = null
    }
}

// 通知系统
const notification = reactive({
    show: false,
    type: 'info',
    icon: 'fa-info-circle',
    message: '',
    timeout: null
})

// 方法
const login = async () => {
    isLoggingIn.value = true
    loginError.value = ''

    try {
        console.log('开始登录，用户名:', loginForm.username)

        const response = await apiService.adminLogin(
            loginForm.username,
            loginForm.password
        )

        console.log('登录API响应:', response)

        if (response.success) {
            isAuthenticated.value = true
            adminUser.value = response.user

            console.log('登录成功，设置用户:', response.user)
            console.log('localStorage token:', localStorage.getItem('admin_token'))
            console.log('localStorage user:', localStorage.getItem('admin_user'))

            // 重新从 localStorage 加载以确保数据正确
            const storedUser = localStorage.getItem('admin_user')
            if (storedUser) {
                try {
                    adminUser.value = JSON.parse(storedUser)
                    console.log('从 localStorage 重新加载的用户:', adminUser.value)
                } catch (e) {
                    console.error('解析存储的用户数据失败:', e)
                }
            }

            // 加载测试结果
            await loadTestResults()
        } else {
            loginError.value = response.message || '登录失败，请检查凭据'
            console.error('登录失败:', loginError.value)
        }

    } catch (error) {
        console.error('登录错误详情:', error)
        console.error('错误堆栈:', error.stack)
        loginError.value = error.message || '登录失败，请稍后重试'
    } finally {
        isLoggingIn.value = false
    }
}

const showNotification = (message, type = 'info') => {
    if (notification.timeout) {
        clearTimeout(notification.timeout)
    }

    notification.message = message
    notification.type = type
    notification.icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
    notification.show = true

    notification.timeout = setTimeout(() => {
        notification.show = false
    }, 3000)
}


// 确保答题数据正确处理
const viewDetails = async (result) => {
    try {
        // 获取完整结果详情
        const token = localStorage.getItem('admin_token')
        const response = await fetch(`${apiService.baseURL}/admin/results/${result.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            const data = await response.json()
            console.log('API返回的详情数据:', data.data)
            selectedDetail.value = data.data

            // 确保test_id存在
            if (!selectedDetail.value.test_id) {
                selectedDetail.value.test_id = selectedDetail.value._id || '未知测试ID'
            }

            // 确保answers数组存在
            if (!selectedDetail.value.test_results?.answers) {
                selectedDetail.value.test_results = {
                    ...selectedDetail.value.test_results,
                    answers: []
                }
            }

            showDetailModal.value = true
            activeTab.value = 'basic'
            answerPage.value = 1
        } else {
            throw new Error('获取详情失败')
        }
    } catch (error) {
        console.error('查看详情失败:', error)
        showNotification('获取详情失败', 'error')
    }
}

// 添加默认值处理
const filteredAnswers = computed(() => {
    if (!selectedDetail.value?.test_results?.answers) {
        return []
    }

    let answers = [...selectedDetail.value.test_results.answers]

    // 确保每个答案都有必要的字段
    answers = answers.map((answer, index) => ({
        question_id: answer.question_id || index + 1,
        question: answer.question || `问题 ${index + 1}`,
        selected_option: answer.selected_option || answer.answer || '未回答',
        score: answer.score || answer.dimension || '未分类'
    }))

    // 按维度筛选
    if (dimensionFilter.value) {
        answers = answers.filter(answer => answer.score === dimensionFilter.value)
    }

    // 搜索筛选
    if (answerSearch.value) {
        const query = answerSearch.value.toLowerCase()
        answers = answers.filter(answer =>
            (answer.question || '').toLowerCase().includes(query) ||
            (answer.selected_option || '').toLowerCase().includes(query)
        )
    }

    // 移除分页，返回所有答案
    return answers
})

const showReviewModal = (result) => {
    reviewTarget.value = result
    reviewData.status = result.status || 'pending'
    reviewData.notes = result.review_notes || ''
    showReviewModalFlag.value = true
}

// 完善审核功能
const submitReview = async () => {
    try {
        reviewLoading.value = true

        // 构建审核数据
        const reviewDataToSend = {
            result_id: reviewTarget.value.id,
            status: reviewData.status,
            review_notes: reviewData.notes,
            reviewer_id: adminUser.value?.id,
            reviewer_name: adminUser.value?.username,
            review_time: new Date().toISOString(),
            notify_user: reviewData.notifyUser
        }

        console.log('提交审核数据:', reviewDataToSend)

        // 调用API
        const response = await apiService.updateResultStatus(
            reviewTarget.value.id,
            reviewData.status,
            reviewData.notes,
            reviewData.notifyUser
        )

        console.log('审核API响应:', response)

        if (response.success) {
            showNotification('审核状态已更新', 'success')

            // 更新本地数据
            const index = testResults.value.findIndex(item => item.id === reviewTarget.value.id)
            if (index !== -1) {
                testResults.value[index].status = reviewData.status
                testResults.value[index].review_notes = reviewData.notes
                testResults.value[index].reviewer_name = adminUser.value?.username
                testResults.value[index].review_time = new Date().toISOString()
            }

            // 如果当前查看的详情是同一个，也更新
            if (selectedDetail.value?.id === reviewTarget.value.id) {
                selectedDetail.value.status = reviewData.status
                selectedDetail.value.review_notes = reviewData.notes
                selectedDetail.value.reviewer_name = adminUser.value?.username
                selectedDetail.value.review_time = new Date().toISOString()
            }

            // 更新统计数据
            await updateStats()

            closeReviewModal()
        } else {
            throw new Error(response.message || '审核失败')
        }
    } catch (error) {
        console.error('更新状态失败:', error)
        // 更友好的错误提示
        const errorMessage = error.message.includes('Network')
            ? '网络错误，请检查连接'
            : error.message.includes('权限')
                ? '权限不足，请重新登录'
                : error.message
        showNotification(`审核失败: ${errorMessage}`, 'error')
    } finally {
        reviewLoading.value = false
    }
}

const confirmDelete = (result) => {
    deleteTarget.value = result
    confirmDeletePermanently.value = false
    isBatchDelete.value = false
    showDeleteModal.value = true
}

// 显示批量删除确认
const showBatchDeleteConfirm = () => {
    confirmDeletePermanently.value = false
    isBatchDelete.value = true
    showDeleteModal.value = true
}

// 显示英文名字编辑模态框
const showEnglishNameModalFunc = (result) => {
    editTarget.value = result
    englishNameInput.value = result.english_name || result.user_info?.english_name || ''
    showEnglishNameModal.value = true
}

// 关闭英文名字编辑模态框
const closeEnglishNameModal = () => {
    showEnglishNameModal.value = false
    editTarget.value = null
    englishNameInput.value = ''
}

// 保存英文名字
const saveEnglishName = async () => {
    if (!englishNameInput.value.trim()) {
        showNotification('英文名字不能为空', 'warning')
        return
    }

    try {
        const response = await apiService.updateEnglishName(editTarget.value.id, englishNameInput.value)
        if (response.success) {
            showNotification('英文名字已成功更新', 'success')
            // 更新本地数据
            editTarget.value.english_name = englishNameInput.value
            if (editTarget.value.user_info) {
                editTarget.value.user_info.english_name = englishNameInput.value
            }
            // 刷新测试结果列表
            await loadTestResults()
            closeEnglishNameModal()
        } else {
            showNotification('更新失败: ' + response.message, 'error')
        }
    } catch (error) {
        showNotification('更新失败: ' + error.message, 'error')
    }
}

// 更新候选人类型
const updateCandidateType = async (id, newType) => {
    try {
        // 添加客户端验证
        const validTypes = ['interview', 'employee', 'former'];
        if (!validTypes.includes(newType)) {
            throw new Error(`候选人类型无效，有效值: ${validTypes.join(', ')}`);
        }
        
        const token = localStorage.getItem('admin_token')
        
        if (!token) {
            throw new Error('未登录，请先登录')
        }
        
        // 乐观更新：先更新本地状态，让用户立即看到变化
        const index = testResults.value.findIndex(item => item.id === id)
        let oldType = null
        if (index !== -1) {
            // 保存旧值，用于更新失败时回滚
            oldType = testResults.value[index].candidate_type
            testResults.value[index].candidate_type = newType
            console.log('乐观更新后的testResults:', testResults.value[index]);
        }
        
        console.log('更新候选人类型请求:', { id, newType });
        const url = `${apiService.baseURL}/admin/results/${id}/candidate-type`;
        console.log('请求URL:', url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ candidate_type: newType })
        })
        
        console.log('响应状态:', response.status);
        const result = await response.json()
        console.log('响应数据:', result);
        
        if (response.ok) {
            showNotification('候选人类型已成功更新', 'success')
            // 移除不必要的loadTestResults调用，提高性能
            // 已经在前面进行了乐观更新，不需要重新加载所有数据
        } else {
            // 更新失败，回滚本地状态
            const index = testResults.value.findIndex(item => item.id === id)
            if (index !== -1) {
                testResults.value[index].candidate_type = oldType
            }
            showNotification('更新失败: ' + result.message, 'error')
        }
    } catch (error) {
        // 更新失败，回滚本地状态
        const index = testResults.value.findIndex(item => item.id === id)
        if (index !== -1) {
            testResults.value[index].candidate_type = oldType
        }
        console.error('更新候选人类型失败:', error);
        showNotification('更新失败: ' + error.message, 'error')
    }
}

const performDelete = async () => {
    try {
        if (isBatchDelete.value) {
            // 批量删除逻辑
            if (selectedResults.value.length === 0) {
                showNotification('请先选择要删除的测试结果', 'warning')
                closeDeleteModal()
                return
            }
            
            const response = await apiService.deleteResults(selectedResults.value)
            
            if (response.success) {
                if (response.deletedCount > 0) {
                    showNotification(`成功删除 ${response.deletedCount} 个测试结果`, 'success')
                } else {
                    showNotification('没有找到匹配的测试结果', 'warning')
                }
                closeDeleteModal()
                loadTestResults() // 刷新列表
                clearSelection() // 清除选择
            } else {
                showNotification('删除失败: ' + response.message, 'error')
                closeDeleteModal()
            }
        } else {
            // 单个删除逻辑
            const response = await apiService.deleteResult(deleteTarget.value.id)

            if (response.success) {
                showNotification('测试结果已删除', 'success')
                closeDeleteModal()
                loadTestResults() // 刷新列表
            } else {
                showNotification('删除失败: ' + response.message, 'error')
                closeDeleteModal()
            }
        }
    } catch (error) {
        console.error('删除失败:', error)
        showNotification('删除失败: ' + error.message, 'error')
        closeDeleteModal()
    }
}

// 工具函数
const calculateCompletion = (result) => {
    // 处理多种可能的数据结构
    let answered = 0
    
    // 检查test_results.answers数组（后端直接返回的结构）
    if (result.test_results?.answers && Array.isArray(result.test_results.answers)) {
        answered = result.test_results.answers.length
    }
    // 检查answers数组（直接在result下）
    else if (result.answers && Array.isArray(result.answers)) {
        answered = result.answers.length
    }
    // 检查已回答的题目数量（如果后端直接提供）
    else if (result.answered_count) {
        answered = result.answered_count
    }
    // 特殊处理：如果test_results存在但没有answers，可能是完整测试
    else if (result.test_results?.mbti_type) {
        // 如果已经生成了MBTI类型，说明测试已完成
        answered = 93
    }
    
    // 总题数应该从后端获取，但如果没有提供，使用合理默认值
    const total = result.total_questions || 93
    
    // 确保计算结果在0-100之间
    const completion = Math.min(100, Math.round((answered / total) * 100))
    return completion
}


const getDimensionFullName = (dimension) => {
    const names = {
        'E': '外向 (Extraversion)',
        'I': '内向 (Introversion)',
        'S': '实感 (Sensing)',
        'N': '直觉 (Intuition)',
        'T': '思维 (Thinking)',
        'F': '情感 (Feeling)',
        'J': '判断 (Judging)',
        'P': '感知 (Perceiving)'
    }
    return names[dimension] || dimension
}

const getDimensionImpact = (dimension) => {
    const impacts = {
        'E': '社交互动倾向',
        'I': '内省思考倾向',
        'S': '细节感知倾向',
        'N': '抽象思考倾向',
        'T': '逻辑决策倾向',
        'F': '情感决策倾向',
        'J': '计划组织倾向',
        'P': '灵活适应倾向'
    }
    return impacts[dimension] || '未定义'
}

const getDimensionExplanation = (dimension, score) => {
    const explanations = {
        'E-I': score >= 50 ? '倾向于外向，喜欢社交互动' : '倾向于内向，偏好独立思考',
        'S-N': score >= 50 ? '倾向于实感，关注具体事实' : '倾向于直觉，关注抽象概念',
        'T-F': score >= 50 ? '倾向于思维，注重逻辑分析' : '倾向于情感，注重人际关系',
        'J-P': score >= 50 ? '倾向于判断，喜欢计划有序' : '倾向于感知，喜欢灵活开放'
    }
    return explanations[dimension] || '暂无解释'
}


// 初始化
onMounted(async () => {
    const token = localStorage.getItem('admin_token')
    const userStr = localStorage.getItem('admin_user')

    console.log('检查登录状态:', { token, userStr })

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr)
            console.log('解析的用户数据:', user)

            if (user && user.username) {
                adminUser.value = user
                isAuthenticated.value = true
                console.log('登录状态恢复成功:', user.username)

                // 加载测试结果
                await loadTestResults()

                // 设置每30秒自动刷新
                refreshInterval.value = setInterval(() => {
                    if (isAuthenticated.value) {
                        // 重新加载完整数据，确保统计和列表一致
                        loadTestResults()
                    }
                }, 30000)
            } else {
                console.warn('用户数据不完整，强制登出')
                logout()
            }
        } catch (error) {
            console.error('解析用户数据失败:', error)
            logout()
        }
    } else {
        console.log('未找到登录信息，显示登录页面')
        // 确保状态正确
        isAuthenticated.value = false
        adminUser.value = null
    }

    // 添加点击外部关闭操作菜单的事件监听
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    // 移除点击外部关闭操作菜单的事件监听
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
:root {
    --primary-blue: #3a86ff;
    --light-blue: #4cc9f0;
    --dark-blue: #1a2980;
    --medium-gray: #e9ecef;
    --success-green: #28a745;
    --warning-orange: #ffc107;
    --danger-red: #dc3545;
    --info-cyan: #17a2b8;
}

/* 基础重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* ========== 登录页面样式 ========== */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
    padding: 20px;
}

.login-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 420px;
    overflow: hidden;
}

.login-header {
    padding: 40px 30px 20px;
    text-align: center;
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--light-blue) 100%);
    color: white;
}

.login-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

.login-logo i {
    font-size: 3rem;
    opacity: 0.9;
}

.login-logo h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
}

.login-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
}

.login-form {
    padding: 30px;
}

.input-group {
    position: relative;
    margin-bottom: 25px;
}

.input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary-blue);
    font-size: 1.1rem;
    z-index: 2;
}

.form-input {
    width: 100%;
    padding: 14px 15px 14px 45px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
    background: #f8f9fa;
    color: #333;
}

.form-input:focus {
    border-color: var(--primary-blue);
    background: white;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
    outline: none;
}

.password-toggle-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 5px;
    font-size: 1rem;
    transition: color 0.3s;
}

.password-toggle-btn:hover {
    color: var(--primary-blue);
}

.error-message {
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    color: #721c24;
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-left: 4px solid #dc3545;
}

.login-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--primary-blue) 0%, #2a75ff 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #2a75ff 0%, #1a65ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(58, 134, 255, 0.4);
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.login-footer {
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    border-top: 1px solid #eee;
}

.login-footer i {
    color: var(--primary-blue);
    margin-right: 5px;
}

/* ========== 管理面板主样式 ========== */
.admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f8ff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* 头部样式 */
.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
    color: white;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0;
}

.header-left h1 i {
    margin-right: 12px;
    color: var(--light-blue);
}

.header-right {
    display: flex;
    align-items: center;
}

.admin-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.admin-name {
    font-weight: 500;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 8px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.admin-name i {
    font-size: 1.1rem;
}

/* 统计卡片 */
.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(58, 134, 255, 0.1);
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-value {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--primary-blue);
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
    color: #495057;
    font-size: 1rem;
    font-weight: 500;
}

.stat-icon {
    position: absolute;
    bottom: 15px;
    right: 15px;
    font-size: 3rem;
    color: rgba(58, 134, 255, 0.15);
    opacity: 0.8;
}

/* 操作工具栏 */
.action-toolbar {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0.06);
}

.search-box {
    flex: 1;
    min-width: 300px;
    position: relative;
}

.search-box i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    z-index: 1;
}

.search-box input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
    background: #f8f9fa;
}

.search-box input:focus {
    border-color: var(--primary-blue);
    background: white;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
    outline: none;
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-group label {
    font-weight: 600;
    color: var(--dark-blue);
    font-size: 0.9rem;
}

.filter-group select {
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    min-width: 140px;
    background: white;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-group select:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
    outline: none;
}

/* 批量操作栏 */
.batch-actions {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border-radius: 10px;
    padding: 15px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    border: 1px solid #90caf9;
}

.selected-count {
    font-weight: 600;
    color: var(--dark-blue);
}

.batch-select {
    padding: 8px 12px;
    border: 2px solid #64b5f6;
    border-radius: 6px;
    background: white;
    color: var(--dark-blue);
    font-weight: 500;
    cursor: pointer;
    min-width: 160px;
}

/* 表格样式 */
.results-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    margin-bottom: 30px;
}

.results-table thead {
    background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
}

.results-table th {
    color: white;
    font-weight: 600;
    padding: 16px 12px;
    text-align: center;
    font-size: 0.95rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.results-table tbody tr {
    transition: all 0.2s ease;
}

.results-table tbody tr:hover {
    background-color: rgba(58, 134, 255, 0.05);
}

.results-table tbody tr.selected-row {
    background-color: rgba(58, 134, 255, 0.1);
}

.results-table td {
    padding: 14px 12px;
    text-align: center;
    vertical-align: middle;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    color: #495057;
    font-size: 0.95rem;
}

.text-center {
    text-align: center !important;
}

/* MBTI结果容器 */
.mbti-result-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 180px;
}

/* MBTI徽章样式 */
.mbti-badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-width: 60px;
}

/* MBTI详细得分样式 */
.mbti-detail {
    display: inline-block;
    font-size: 0.9rem;
    font-weight: 700;
    color: #495057;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 5px 12px;
    border-radius: 12px;
    border: 1px solid #dee2e6;
    white-space: nowrap;
    letter-spacing: 0.5px;
}

/* 大尺寸MBTI徽章 */
.mbti-badge-xl {
    display: inline-block;
    padding: 15px 30px;
    border-radius: 25px;
    font-weight: 700;
    font-size: 1.8rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    min-width: 100px;
    margin-bottom: 15px;
}

.mbti-e {
    background: linear-gradient(135deg, #3498db, #2980b9);
}

.mbti-i {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.mbti-s {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.mbti-n {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.mbti-t {
    background: linear-gradient(135deg, #f39c12, #d68910);
}

.mbti-f {
    background: linear-gradient(135deg, #1abc9c, #16a085);
}

.mbti-j {
    background: linear-gradient(135deg, #34495e, #2c3e50);
}

.mbti-p {
    background: linear-gradient(135deg, #7f8c8d, #717d7e);
}

/* 状态徽章样式 */
.status-badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    min-width: 60px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}

.status-processed {
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-pending {
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-rejected {
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.status-archived {
    background: linear-gradient(135deg, #e2e3e5, #d6d8db);
    color: #383d41;
    border: 1px solid #d6d8db;
}

/* 审核意见样式 */
.review-notes {
    display: inline;
    padding: 0;
    background: none;
    border-radius: 0;
    font-size: 0.85rem;
    color: #495057;
    line-height: 1.4;
    cursor: default;
    border-left: none;
    white-space: normal;
    word-break: break-word;
    text-align: center;
}

.review-notes:hover {
    background: rgba(248, 249, 250, 1);
}

/* 完成度进度条 */
.completion-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
}

.bar-bg {
    width: 80px;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-blue), #64b5f6);
    border-radius: 4px;
    transition: width 0.5s ease;
}

/* 按钮系统 - 修复后的版本 */
.btn-view,
.btn-review,
.btn-delete,
.btn-primary,
.btn-secondary,
.logout-btn,
.export-btn,
.refresh-btn,
.batch-btn,
.clear-btn,
.page-btn,
.page-number {
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    min-height: 36px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 小按钮样式 */
.btn-small {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-height: 30px;
    gap: 6px;
}

/* 候选人类型选择框样式 */
.candidate-type-select {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: white;
    font-size: 0.9rem;
    font-family: inherit;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.candidate-type-select:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.candidate-type-select:hover {
    border-color: #ccc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.candidate-type-select option {
    font-family: inherit;
    font-size: 0.9rem;
    color: #333;
    background-color: white;
    padding: 8px;
}

/* 修复模态框背景 */
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(2px);
}

/* 优化表格样式 */
.results-table-container {
    overflow-x: auto;
}

.results-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
}

.results-table th {
    white-space: nowrap;
    padding: 12px 6px;
    font-size: 0.9rem;
}

.results-table td {
    white-space: normal;
    padding: 10px 6px;
    font-size: 0.9rem;
    word-break: break-word;
}

.action-buttons-cell {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: nowrap;
    align-items: center;
}

.action-buttons-cell button {
    margin: 0;
    padding: 6px 10px;
    font-size: 0.8rem;
    white-space: nowrap;
}

/* 优化筛选栏 */
.action-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    align-items: center;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

/* 优化模态框样式 */
.modal-content {
    background-color: white !important;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 姓名容器样式 */
.name-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    justify-content: center;
}

/* 英文名字标签样式 */
.english-name-tag {
    font-size: 0.8rem;
    color: #666;
    font-weight: normal;
    background-color: #f5f5f5;
    padding: 2px 8px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
}

/* 操作下拉菜单容器 */
.action-dropdown {
    position: relative;
    display: inline-block;
}

/* 操作菜单按钮 */
.btn-action-menu {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-action-menu:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-action-menu .fa-chevron-down {
    transition: transform 0.2s ease;
    font-size: 0.75rem;
}

.btn-action-menu .fa-chevron-down.rotate {
    transform: rotate(180deg);
}

/* 操作菜单下拉列表 */
.action-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 140px;
    z-index: 100;
    overflow: hidden;
    border: 1px solid #e5e7eb;
}

/* 操作菜单项 */
.action-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    border: none;
    background: white;
    color: #374151;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    white-space: nowrap;
}

.action-menu-item:hover {
    background: #f3f4f6;
    color: #111827;
}

.action-menu-item.delete {
    color: #dc2626;
}

.action-menu-item.delete:hover {
    background: #fef2f2;
}

/* 优化操作按钮容器 */
.action-buttons-cell {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: nowrap;
    align-items: center;
}

/* 优化按钮样式 */
.action-buttons-cell button {
    margin: 0;
    padding: 6px 10px;
    font-size: 0.8rem;
    white-space: nowrap;
    flex-shrink: 0;
}

/* 修复筛选栏中的候选人类型筛选 */
.filter-group select {
    max-width: 150px;
}

/* 优化模态框表单样式 */
.modal-body .form-group {
    margin-bottom: 15px;
}

.modal-body .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
}

.modal-body .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

/* 查看按钮 */
.btn-view {
    background: linear-gradient(135deg, var(--primary-blue) 0%, #2a75ff 100%);
    color: white;
}

.btn-view:hover {
    background: linear-gradient(135deg, #2a75ff 0%, #1a65ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 审核按钮 */
.btn-review {
    background: linear-gradient(135deg, var(--success-green) 0%, #20c997 100%);
    color: white;
}

.btn-review:hover {
    background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 删除按钮 */
.btn-delete {
    background: linear-gradient(135deg, var(--danger-red) 0%, #c82333 100%);
    color: white;
}

.btn-delete:hover {
    background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 主要按钮 */
.btn-primary {
    background: linear-gradient(135deg, var(--primary-blue) 0%, #2a75ff 100%);
    color: white;
    min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #2a75ff 0%, #1a65ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 次要按钮 */
.btn-secondary, .btn-close {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: var(--dark-blue);
    border: 1px solid var(--medium-gray);
}

.btn-secondary:hover, .btn-close:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 特定功能按钮 */
.logout-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn:hover {
    background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
    transform: translateY(-2px);
}

.export-btn {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
}

.export-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.refresh-btn {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
}

.refresh-btn:hover {
    background: linear-gradient(135deg, #5a6268 0%, #545b62 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.batch-btn {
    background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
    color: #212529;
}

.batch-btn:hover {
    background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.clear-btn {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
}

.clear-btn:hover {
    background: linear-gradient(135deg, #5a6268 0%, #545b62 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 分页按钮 */
.page-btn,
.page-number {
    width: 40px;
    height: 40px;
    background: white;
    color: var(--primary-blue);
    border: 1px solid var(--medium-gray);
}

.page-btn:hover:not(:disabled),
.page-number:hover:not(:active) {
    background: var(--primary-blue);
    color: white;
    border-color: var(--primary-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.page-number.active {
    background: var(--primary-blue);
    color: white;
    border-color: var(--primary-blue);
}

/* 禁用状态 */
.btn-view:disabled,
.btn-review:disabled,
.btn-delete:disabled,
.btn-primary:disabled,
.btn-secondary:disabled,
.logout-btn:disabled,
.export-btn:disabled,
.refresh-btn:disabled,
.batch-btn:disabled,
.clear-btn:disabled,
.page-btn:disabled,
.page-number:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}



/* 分页样式 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
    flex-wrap: wrap;
}

.page-numbers {
    display: flex;
    gap: 5px;
}

.page-info {
    color: var(--dark-blue);
    font-weight: 600;
    font-size: 0.95rem;
    margin-left: 10px;
}

/* 加载状态 */
.loading-cell {
    padding: 50px !important;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.empty-cell {
    padding: 50px !important;
    text-align: center;
    color: #6c757d;
}

.empty-cell i {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #dee2e6;
}

/* ========== 模态框样式 ========== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* 详情模态框 */
.detail-modal {
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
    padding: 25px 30px;
    background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    font-size: 1.4rem;
    font-weight: 700;
}

.close-btn {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid var(--medium-gray);
    color: var(--dark-blue);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
}

.close-btn:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    color: var(--danger-red);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 30px;
}

/* 详情模态框标签页 */
.tab-navigation {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    border-bottom: 2px solid var(--medium-gray);
    padding-bottom: 10px;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 12px 24px;
    background: #f8f9fa;
    border: none;
    border-radius: 8px;
    color: #666;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
}

.tab-btn.active {
    background: var(--primary-blue);
    color: white;
    box-shadow: 0 4px 12px rgba(58, 134, 255, 0.3);
}

.tab-btn:hover:not(.active) {
    background: #e9ecef;
    transform: translateY(-2px);
}

.tab-content {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
}

/* 用户信息网格 */
.user-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
    margin-top: 20px;
}

.info-section {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-section h4 {
    color: var(--primary-blue);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(58, 134, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    color: #666;
    font-weight: 500;
    min-width: 100px;
}

.info-value {
    color: #333;
    font-weight: 600;
    text-align: right;
    flex: 1;
}

.comments-box {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid var(--primary-blue);
    margin-top: 15px;
    line-height: 1.6;
    color: #555;
}

/* 模态框页脚 */
.modal-footer {
    padding: 25px 30px;
    border-top: 2px solid var(--medium-gray);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    border-radius: 0 0 16px 16px;
}

.footer-left,
.footer-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.status-display {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
}

/* 删除模态框 */
.delete-modal {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    animation: slideUp 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    border-top: 4px solid var(--danger-red);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.delete-modal .modal-header {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    padding: 25px 30px;
    border-radius: 12px 12px 0 0;
}

.delete-modal .modal-body {
    padding: 30px;
}

.delete-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid var(--danger-red);
}

.delete-info p {
    margin: 8px 0;
    display: flex;
}

.delete-info strong {
    min-width: 80px;
    color: #666;
}

.btn-danger {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-danger:hover:not(:disabled) {
    background: linear-gradient(135deg, #c82333, #bd2130);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
}

.confirm-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: 500;
}

.confirm-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

/* 通知组件 */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    max-width: 400px;
}

.notification.success {
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    color: #155724;
    border-left: 4px solid #28a745;
}

.notification.error {
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    color: #721c24;
    border-left: 4px solid #dc3545;
}

.notification.warning {
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    color: #856404;
    border-left: 4px solid #ffc107;
}

.notification.info {
    background: linear-gradient(135deg, #d1ecf1, #bee5eb);
    color: #0c5460;
    border-left: 4px solid #17a2b8;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .admin-container {
        padding: 15px;
    }

    .stats-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .admin-container {
        padding: 10px;
    }

    .stats-cards {
        grid-template-columns: 1fr;
    }

    .action-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        min-width: 100%;
    }

    .action-buttons {
        flex-direction: column;
        width: 100%;
    }

    .filter-group select {
        width: 100%;
    }

    .results-table {
        display: block;
        overflow-x: auto;
    }

    .admin-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .admin-info {
        flex-direction: column;
        gap: 10px;
    }

    .modal-footer {
        flex-direction: column;
        gap: 15px;
    }

    .footer-left,
    .footer-right {
        width: 100%;
        justify-content: center;
    }

    .tab-navigation {
        overflow-x: auto;
        flex-wrap: nowrap;
    }

    .tab-btn {
        padding: 10px 15px;
        font-size: 0.9rem;
    }
}

/* 滚动条美化 */
.answers-grid-view::-webkit-scrollbar,
.answers-list-view::-webkit-scrollbar,
.results-table-container::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.answers-grid-view::-webkit-scrollbar-track,
.answers-list-view::-webkit-scrollbar-track,
.results-table-container::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.answers-grid-view::-webkit-scrollbar-thumb,
.answers-list-view::-webkit-scrollbar-thumb,
.results-table-container::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.answers-grid-view::-webkit-scrollbar-thumb:hover,
.answers-list-view::-webkit-scrollbar-thumb:hover,
.results-table-container::-webkit-scrollbar-thumb:hover,
.modal-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 强制修复按钮颜色 - 添加到CSS文件末尾 */
.btn-view {
    background-color: #3a86ff !important;
    background-image: linear-gradient(135deg, #3a86ff, #2a75ff) !important;
    color: white !important;
}

.btn-review {
    background-color: #28a745 !important;
    background-image: linear-gradient(135deg, #28a745, #20c997) !important;
    color: white !important;
}

.btn-delete {
    background-color: #dc3545 !important;
    background-image: linear-gradient(135deg, #dc3545, #c82333) !important;
    color: white !important;
}

/* 确保按钮内的文字可见 */
.btn-view,
.btn-review,
.btn-delete {
    opacity: 1 !important;
    filter: none !important;
}

/* 确保按钮内的图标也可见 */
.btn-view i,
.btn-review i,
.btn-delete i {
    color: white !important;
}

/* 审核模态框样式修复 */
.review-modal-overlay {
    background: rgba(0, 0, 0, 0.7) !important;
    backdrop-filter: blur(5px);
}

.review-modal {
    background: white !important;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    animation: slideUp 0.3s ease;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.review-modal .modal-header {
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--light-blue) 100%);
    color: white;
    padding: 25px 30px;
    border-radius: 12px 12px 0 0;
}

.review-modal .modal-body {
    padding: 30px;
    color: #333 !important;
    background: white !important;
}

.review-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
    border-left: 4px solid var(--primary-blue);
}

.review-info p {
    margin: 8px 0;
    color: #333 !important;
    font-size: 1rem;
}

.form-group {
    margin-bottom: 25px;
}

.form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333 !important;
    font-size: 1rem;
}

.form-select,
.form-textarea {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: #333 !important;
    background: white !important;
    transition: all 0.3s;
}

.form-select:focus,
.form-textarea:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
    outline: none;
}

.form-textarea {
    min-height: 120px;
    resize: vertical;
}

.form-hint {
    display: block;
    margin-top: 8px;
    font-size: 0.9rem;
    color: #666;
}

/* 复选框样式 */
.form-checkbox-group {
    margin: 25px 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    color: #333 !important;
    font-weight: 500;
}

.checkbox-input {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-blue);
}

.checkbox-text {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 确保审核目标信息清晰可见 */
.user-info-summary {
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
}

.user-avatar {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary-blue), var(--light-blue));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.user-details h4 {
    margin: 0 0 8px 0;
    color: #333 !important;
    font-size: 1.2rem;
}

.user-details p {
    margin: 4px 0;
    color: #666 !important;
}

.mbti-status {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

/* 答题详情样式优化 */
.answers-tab {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
}

.answers-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    flex-wrap: wrap;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--medium-gray);
}

.answers-summary {
    display: flex;
    align-items: center;
    gap: 25px;
    flex-wrap: wrap;
    font-weight: 500;
    color: var(--dark-blue);
    font-size: 1rem;
}

.view-toggle-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--primary-blue) 0%, #2a75ff 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
}

.view-toggle-btn:hover {
    background: linear-gradient(135deg, #2a75ff 0%, #1a65ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.answers-filter {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
}

.search-answers {
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    min-width: 280px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.search-answers:focus {
    border-color: var(--primary-blue);
    background: white;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
    outline: none;
}

.answers-filter select {
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 180px;
}

.answers-filter select:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
    outline: none;
}

/* 答题列表样式 */
.answers-list-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.answer-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 25px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.answer-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.answer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.answer-meta {
    display: flex;
    gap: 15px;
    align-items: center;
}

.answer-number {
    font-weight: 700;
    color: var(--primary-blue);
    font-size: 1.1rem;
}

.answer-dimension {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.question-content {
    margin-bottom: 15px;
}

.question-text {
    font-size: 1.05rem;
    margin-bottom: 15px;
    line-height: 1.6;
    color: var(--dark-blue);
    font-weight: 500;
}

.user-choice {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid var(--primary-blue);
}

.choice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--dark-blue);
    margin-bottom: 8px;
}

.choice-content {
    color: #555;
    line-height: 1.5;
    font-weight: 500;
}

.dimension-impact {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
}

.impact-label {
    font-weight: 600;
    color: #666;
}

.impact-value {
    padding: 6px 12px;
    border-radius: 15px;
    font-weight: 600;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 答题分页 */
.answers-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid var(--medium-gray);
    flex-wrap: wrap;
}

/* 维度样式 - 与主系统保持一致 */
.dim-E { background: linear-gradient(135deg, var(--primary-blue), #2980b9); }
.dim-I { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
.dim-S { background: linear-gradient(135deg, #2ecc71, #27ae60); }
.dim-N { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.dim-T { background: linear-gradient(135deg, #f39c12, #d68910); }
.dim-F { background: linear-gradient(135deg, #1abc9c, #16a085); }
.dim-J { background: linear-gradient(135deg, #34495e, #2c3e50); }
.dim-P { background: linear-gradient(135deg, #7f8c8d, #95a5a6); }

/* 网格视图样式优化 */
.answers-grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.answer-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.answer-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.question-number {
    font-weight: 700;
    color: var(--primary-blue);
    font-size: 0.95rem;
}

.question-dimension {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.selected-answer {
    margin-top: 12px;
    padding: 12px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    border-left: 4px solid var(--primary-blue);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 500;
}

.selected-answer i {
    color: var(--success-green);
    font-size: 1.1rem;
}

/* 确保与EnhancedUserInfo.vue的表单样式保持一致 */
.answers-filter input,
.answers-filter select {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 确保与主系统的按钮样式保持一致 */
.view-toggle-btn {
    min-height: 40px;
    font-weight: 600;
}

/* 候选人类型选择框样式 */
.candidate-type-select {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
    display: inline-block;
}

.candidate-type-select:hover {
    border-color: var(--primary-blue);
}

.candidate-type-select:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.25);
}

</style>