# MBTI测试系统 Docker 更新部署指南

## 前提条件

1. 确保已安装 Docker 和 Docker Compose
2. 确保当前工作目录为项目根目录 (`E:\MBTI-test`)
3. 确保没有其他进程占用 3003、5173 和 27017 端口

## 更新部署步骤

### 1. 停止当前运行的 Docker 容器

```bash
# 在项目根目录执行
docker-compose down
```

### 2. 清理旧镜像（可选）

```bash
# 删除所有未使用的镜像
docker image prune -a -f
```

### 3. 重新构建 Docker 镜像

```bash
# 在项目根目录执行，构建所有服务
docker-compose build

# 或者构建特定服务
docker-compose build backend  # 仅构建后端
docker-compose build frontend  # 仅构建前端
docker-compose build mongo     # 仅构建MongoDB
```

### 4. 启动更新后的 Docker 容器

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看容器启动日志
docker-compose logs -f
```

### 5. 验证部署是否成功

#### 检查容器状态
```bash
docker-compose ps
```

#### 访问应用
1. **前端应用**: http://localhost:5173/
2. **后端 API**: http://localhost:3003/
3. **MongoDB**: 可通过 MongoDB Compass 或其他工具连接到 localhost:27017

#### 检查日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo
```

## 常见问题排查

### 端口被占用

如果遇到端口被占用的错误，可以修改 `docker-compose.yml` 文件中的端口映射：

```yaml
# 例如修改前端端口
frontend:
  ports:
    - "5174:80"  # 将 5174 替换为可用端口
```

### 构建失败

1. 检查依赖是否正确安装
2. 清理 npm 缓存
3. 检查 Dockerfile 中的命令是否正确

### 容器无法启动

1. 查看容器日志获取详细错误信息
2. 检查环境变量配置
3. 确保依赖服务已正确启动

## 部署架构

### 服务组成

| 服务名称 | 容器名称 | 端口映射 | 依赖关系 |
|---------|---------|---------|---------|
| frontend | mbti-test-frontend | 5173:80 | backend |
| backend | mbti-test-backend | 3003:3003 | mongo |
| mongo | mbti-test-mongo | 27017:27017 | 无 |

### 数据持久化

MongoDB 数据存储在 Docker 卷 `mongo-data` 中，确保数据不会丢失。

### 网络配置

所有服务通过 `mbti-network` 桥接网络通信，确保服务间可以相互访问。

## 更新频率建议

1. **常规更新**: 每 2-4 周更新一次依赖和安全补丁
2. **功能更新**: 当有新功能或 bug 修复时立即更新
3. **紧急更新**: 当发现严重安全漏洞时立即更新

## 备份策略

### MongoDB 数据备份

```bash
# 备份 MongoDB 数据
docker-compose exec -T mongo mongodump --archive > backup_$(date +%Y%m%d_%H%M%S).gz

# 恢复 MongoDB 数据
docker-compose exec -T mongo mongorestore --archive < backup_file.gz
```

### 代码备份

建议使用 Git 进行代码版本控制，定期提交和推送代码到远程仓库。

## 监控建议

1. 使用 Docker 内置的监控命令查看容器状态和资源使用情况
2. 考虑使用 Prometheus + Grafana 进行更详细的监控
3. 设置日志收集系统，如 ELK Stack 或 Loki

## 扩展建议

1. 当用户量增加时，可以考虑添加负载均衡器
2. 可以将 MongoDB 部署为副本集以提高可用性
3. 考虑使用 Docker Swarm 或 Kubernetes 进行更复杂的部署

## 注意事项

1. 不要在生产环境中使用默认的 JWT 密钥，请修改 `mbti-backend/.env` 文件中的 `JWT_SECRET`
2. 定期更新 MongoDB 和 Node.js 版本以获取最新的安全补丁
3. 在生产环境中，建议使用 HTTPS 协议
4. 配置适当的防火墙规则，限制对敏感端口的访问

## 联系方式

如果在部署过程中遇到问题，请联系开发团队或查看项目文档。
