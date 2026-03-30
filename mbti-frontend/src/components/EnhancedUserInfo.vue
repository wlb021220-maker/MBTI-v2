<template>
    <div class="section" id="userInfoSection">
        <div class="section-title">
            <i class="fas fa-user-circle"></i>
            <span>面试者个人信息</span>
        </div>

        <div class="question-container">
            <div class="question-text">请填写以下个人信息，这些信息将帮助我们更好地对您进行职能匹配</div>

            <div class="form-grid">
                <!-- 第一行：基本个人信息 -->
                <div class="form-group">
                    <label for="userName">
                        <i class="fas fa-user"></i> 姓名 <span class="required">*</span>
                    </label>
                    <input type="text" id="userName" v-model="userInfo.name" placeholder="请输入您的真实姓名" required>
                </div>

                <div class="form-group">
                    <label for="userAge">
                        <i class="fas fa-birthday-cake"></i> 年龄
                    </label>
                    <input type="number" id="userAge" v-model="userInfo.age" min="10" max="100" placeholder="请输入您的年龄">
                </div>

                <div class="form-group">
                    <label for="userGender">
                        <i class="fas fa-venus-mars"></i> 性别
                    </label>
                    <select id="userGender" v-model="userInfo.gender">
                        <option value="male">男</option>
                        <option value="female">女</option>
                    </select>
                </div>

                <!-- 第二行：联系信息 -->
                <div class="form-group full-width">
                    <label for="userEmail">
                        <i class="fas fa-envelope"></i> 邮箱地址 <span class="required">*</span>
                    </label>
                    <input type="email" id="userEmail" v-model="userInfo.email" placeholder="请输入您的邮箱地址，用于Hr更高效的联系您"
                        required>
                </div>

                <!-- 第三行：求职类型和教育背景 -->
                <div class="form-group">
                    <label for="userOccupation">
                        <i class="fas fa-briefcase"></i> 求职类型
                    </label>
                    <select id="userEmployment" v-model="userInfo.employment">
                        <option value="intern">实习</option>
                        <option value="school">校招</option>
                        <option value="social">社招</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="userEducation">
                        <i class="fas fa-graduation-cap"></i> 最高学历
                    </label>
                    <select id="userEducation" v-model="userInfo.education">
                        <option value="high-school">高中及以下</option>
                        <option value="bachelor">本科</option>
                        <option value="master">硕士</option>
                        <option value="phd">博士及以上</option>
                        <option value="other">其他</option>
                    </select>
                </div>

                <!-- 第四行：投递部门 -->
                <div class="form-group full-width">
                    <label>
                        <i class="fas fa-bullseye"></i> 投递部门
                    </label>
                    <div class="radio-group">
                        <label class="radio-label" v-for="dept in departments" :key="dept.value">
                            <input 
                                type="radio" 
                                name="department" 
                                :value="dept.value" 
                                v-model="userInfo.purpose"
                            >
                            {{ dept.label }}
                        </label>
                    </div>
                </div>

                <!-- 第五行：目前所在地区 -->
                <div class="form-group">
                    <label for="userRegion">
                        <i class="fas fa-map-marker-alt"></i> 目前所在地区
                    </label>
                    <select id="userRegion" v-model="userInfo.region">
                        <option value="bj">北京</option>
                        <option value="tj">天津</option>
                        <option value="hb">河北</option>
                        <option value="sx">山西</option>
                        <option value="nmg">内蒙古</option>
                        <option value="sh">上海</option>
                        <option value="js">江苏</option>
                        <option value="zj">浙江</option>
                        <option value="ah">安徽</option>
                        <option value="fj">福建</option>
                        <option value="jx">江西</option>
                        <option value="sd">山东</option>
                        <option value="gd">广东</option>
                        <option value="gx">广西</option>
                        <option value="hn">海南</option>
                        <option value="hnn">河南</option>
                        <option value="hb">湖北</option>
                        <option value="hhn">湖南</option>
                        <option value="ln">辽宁</option>
                        <option value="jl">吉林</option>
                        <option value="hlj">黑龙江</option>
                        <option value="cq">重庆</option>
                        <option value="sc">四川</option>
                        <option value="gz">贵州</option>
                        <option value="yn">云南</option>
                        <option value="xz">西藏</option>
                        <option value="sxx">陕西</option>
                        <option value="gs">甘肃</option>
                        <option value="qh">青海</option>
                        <option value="nx">宁夏</option>
                        <option value="xj">新疆</option>
                        <option value="hongkong-macao-taiwan">港澳台地区</option>
                        <option value="overseas">海外</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="userOrganization">
                        <i class="fas fa-building"></i> 毕业院校
                    </label>
                    <input type="text" id="userOrganization" v-model="userInfo.organization" placeholder="毕业院校（可选）">
                </div>

                <!-- 第六行：其他备注 -->
                <div class="form-group full-width">
                    <label for="userComments">
                        <i class="fas fa-comment"></i> 其他备注
                    </label>
                    <textarea id="userComments" v-model="userInfo.comments" placeholder="如有其他需要说明的信息，请在此填写"
                        rows="3"></textarea>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, reactive, watch } from 'vue'

const props = defineProps({
    userInfo: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:userInfo', 'save-user-info'])

// 投递部门列表
const departments = [
    { value: 'II', label: '创新投资部' },
    { value: 'HR', label: '人力资源部' },
    { value: 'IR', label: '投研部' },
    { value: 'TB', label: '技术开发部' },
    { value: 'OP', label: '运营部' },
    { value: 'LE', label: '生活效率部' }
]

// 创建用户信息对象
const userInfo = reactive({
    name: '',
    age: '',
    gender: '',
    email: '',
    occupation: '',
    education: '',
    purpose: '', // 改为字符串，用于单选
    region: '',
    organization: '',
    comments: '',
    employment: '' // 添加求职类型字段，改为小写以匹配后端
})

// 监听用户信息变化并保存
watch(userInfo, (newValue) => {
    emit('update:userInfo', newValue)
    saveUserInfo()
}, { deep: true })

// 保存用户信息到sessionStorage
const saveUserInfo = () => {
    const userData = JSON.stringify(userInfo)
    sessionStorage.setItem('mbtiUserInfo', userData)
    emit('save-user-info')
}

</script>

<style scoped>
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--dark-blue);
    font-size: 1rem;
}

.form-group label i {
    margin-right: 8px;
    color: var(--primary-blue);
    width: 16px;
    text-align: center;
}

.form-group .required {
    color: #e74c3c;
    margin-left: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    background-color: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    border-color: var(--primary-blue);
    outline: none;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

.radio-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 12px;
}

.radio-label {
    display: flex;
    align-items: center;
    font-weight: normal;
    cursor: pointer;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.radio-label:hover {
    background-color: rgba(58, 134, 255, 0.1);
    border-color: rgba(58, 134, 255, 0.3);
}

.radio-label input[type="radio"] {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary-blue);
}

.radio-label input[type="radio"]:checked + * {
    color: var(--primary-blue);
    font-weight: 600;
    background-color: rgba(58, 134, 255, 0.1);
    border-color: rgba(58, 134, 255, 0.3);
}



textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>