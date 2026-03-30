# MBTI 人格类型测试系统

一个基于 Vue 3 + Node.js + MongoDB 的全栈 MBTI 人格类型测试应用，支持 Docker 容器化部署。

## 📋 项目概述

MBTI（Myers-Briggs Type Indicator）是一种人格类型评估工具，通过四个维度的偏好组合，将人格分为 16 种类型。本系统提供完整的测试流程、结果分析和数据管理功能。

### 功能特性

- 🧠 **完整的 MBTI 测试流程** - 涵盖 4 个维度、8 个倾向的测试题目
- 📊 **详细的结果分析** - 包含人格类型解读、维度分析、职业建议
- 🔐 **管理员后台** - 支持查看统计数据、导出测试结果
- 📱 **响应式设计** - 适配桌面和移动设备
- 🐳 **Docker 容器化** - 一键部署，易于维护

---

## 🏗️ 技术架构

### 系统架构图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   前端 (Vue 3)   │────▶│  后端 (Node.js)  │────▶│  MongoDB 数据库  │
│   端口: 5173    │     │   端口: 3003    │     │  端口: 27017    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🖥️ 前端技术栈

### 核心框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具

### 项目结构
```
mbti-frontend/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── AdminPanel.vue      # 管理员面板
│   │   ├── EnhancedUserInfo.vue # 用户信息收集
│   │   ├── MbtiTest.vue        # 主测试组件
│   │   ├── ProgressBar.vue     # 进度条
│   │   ├── QuestionSection.vue # 题目展示
│   │   ├── ResultsDisplay.vue  # 结果展示
│   │   └── ThankYouPage.vue    # 感谢页面
│   ├── composables/         # 组合式函数
│   │   └── useMbtiCalculator.js # MBTI 计算逻辑
│   ├── data/                # 静态数据
│   │   ├── dimensionData.js    # 维度数据
│   │   └── mbtiData.js         # MBTI 类型数据
│   ├── services/            # API 服务
│   │   └── apiService.js       # 后端接口调用
│   ├── utils/               # 工具函数
│   │   └── helpers.js          # 辅助函数
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局样式
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
├── nginx.conf               # Nginx 配置
└── package.json             # 依赖管理
```

### 主要依赖
| 依赖 | 版本 | 说明 |
|------|------|------|
| vue | ^3.4.0 | 核心框架 |
| @vitejs/plugin-vue | ^4.5.0 | Vite Vue 插件 |
| vite | ^5.0.0 | 构建工具 |

---

## ⚙️ 后端技术栈

### 核心框架
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM

### 项目结构
```
mbti-backend/
├── controllers/             # 控制器
│   ├── authController.js       # 认证相关
│   └── resultController.js     # 测试结果相关
├── middleware/              # 中间件
│   └── auth.js                 # JWT 认证
├── models/                  # 数据模型
│   ├── Result.js               # 结果模型
│   └── User.js                 # 用户模型
├── routes/                  # 路由
│   ├── auth.js                 # 认证路由
│   └── results.js              # 结果路由
├── .env.example             # 环境变量示例
├── Dockerfile               # Docker 配置
├── package.json             # 依赖管理
└── server.js                # 入口文件
```

### 主要依赖
| 依赖 | 版本 | 说明 |
|------|------|------|
| express | ^4.18.2 | Web 框架 |
| mongoose | ^7.8.8 | MongoDB ODM |
| bcryptjs | ^2.4.3 | 密码加密 |
| jsonwebtoken | ^9.0.3 | JWT 认证 |
| cors | ^2.8.5 | 跨域支持 |
| helmet | ^7.0.0 | 安全头设置 |
| morgan | ^1.10.0 | HTTP 请求日志 |
| compression | ^1.7.4 | 响应压缩 |
| dotenv | ^16.3.1 | 环境变量 |

### API 接口

#### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/login | 管理员登录 |
| POST | /api/admin/create | 创建管理员（需认证） |
| POST | /api/admin/change-password | 修改密码（需认证） |

#### 结果接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/submit-test | 提交测试结果 |
| GET | /api/admin/results | 获取所有结果（需认证） |
| GET | /api/admin/statistics | 获取统计数据（需认证） |
| GET | /api/admin/export/csv | 导出 CSV（需认证） |
| PUT | /api/admin/results/:id/status | 更新结果状态（需认证） |
| DELETE | /api/admin/results/:id | 删除结果（需认证） |

#### 健康检查
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /health | 服务健康状态 |

---

## 🗄️ 数据库设计

### MongoDB 集合

#### 1. Results（测试结果）
```javascript
{
  _id: ObjectId,
  user_info: {
    name: String,
    gender: String,
    age: Number,
    education: String,
    contact: String,
    english_name: String
  },
  test_results: {
    mbti_type: String,       // 如: "INTJ"
    dimension_scores: {
      E: Number, I: Number,
      S: Number, N: Number,
      T: Number, F: Number,
      J: Number, P: Number
    },
    answers: Array,          // 用户答案
    test_duration: Number,   // 测试时长（秒）
    test_id: String,         // 测试唯一ID
    submission_time: Date
  },
  metadata: {
    test_version: String,
    platform: String,
    user_agent: String,
    screen_resolution: String,
    ip_address: String
  },
  status: String,            // pending/approved/rejected
  review_notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Users（管理员用户）
```javascript
{
  _id: ObjectId,
  username: String,
  password: String,        // bcrypt 加密
  display_name: String,    // 显示名称
  role: String,            // "admin"
  createdAt: Date
}
```

---

## 🐳 Docker 部署

### 服务组成

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| frontend | 自定义构建 | 5173 | Vue 前端 + Nginx |
| backend | 自定义构建 | 3003 | Node.js API |
| mongo | mongo:7.0 | 27017 | MongoDB 数据库 |

### 快速启动

```bash
# 1. 克隆项目
git clone https://gitlab.zzy88.com/Mario123/mbti.git
cd mbti

# 2. 启动服务
docker compose up -d

# 3. 查看状态
docker compose ps

# 4. 查看日志
docker compose logs -f
```

### 环境变量配置

创建 `mbti-backend/.env` 文件：

```env
NODE_ENV=production
PORT=3003
MONGODB_URI=mongodb://mongo:27017/mbti_test
JWT_SECRET=your-secret-key
```

### 数据持久化

MongoDB 数据通过 Docker 命名卷持久化：
- **mongo_data**: 数据库文件
- **mongo_config**: 配置文件

---

## 📊 运维与监控

### 健康检查

- 后端健康: `http://localhost:3003/health`
- 前端服务: `http://localhost:5173`

### 常用命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f [service_name]

# 重启服务
docker compose restart [service_name]

# 停止服务
docker compose down

# 重新构建并启动
docker compose up -d --build
```

---

## 🚀 开发指南

### 本地开发

#### 前端开发
```bash
cd mbti-frontend
npm install
npm run dev
```
访问: http://localhost:5173

#### 后端开发
```bash
cd mbti-backend
npm install
npm start
```
服务运行在: http://localhost:3003

### 构建生产版本

```bash
# 前端构建
cd mbti-frontend
npm run build

# Docker 构建
docker compose build
```

---

## 📁 项目目录

```
MBTI-test/
├── mbti-frontend/          # 前端项目
├── mbti-backend/           # 后端项目
├── docker-compose.yml      # Docker 编排
├── Dockerfile              # 前端镜像构建
├── .gitignore             # Git 忽略规则
├── DOCKER_DEPLOYMENT_GUIDE.md  # Docker 部署指南
└── README.md              # 本文件
```

---

## 🔒 安全说明

- 所有密码使用 bcrypt 加密存储
- JWT Token 用于管理员认证
- Helmet 中间件设置安全 HTTP 头
- CORS 限制跨域访问
- MongoDB 默认无认证（生产环境建议启用）

---

## 📝 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

- 项目地址: https://gitlab.zzy88.com/Mario123/mbti
- 问题反馈: 请在 GitLab 提交 Issue
