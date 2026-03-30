# Docker挂载卷更新和数据导入指南

## 1. 挂载卷配置说明

### 1.1 后端服务挂载卷

```yaml
volumes:
  # 挂载卷：后端代码目录
  - ./mbti-backend:/app
  # 挂载卷：导入脚本和数据文件
  - ./docker-import.js:/app/docker-import.js
  - ./import-data-complete.json:/app/data/import-data-complete.json
  - ./simple-import.js:/app/simple-import.js
```

### 1.2 前端服务挂载卷

```yaml
volumes:
  # 挂载卷：前端代码目录
  - ./mbti-frontend:/app/mbti-frontend
```

### 1.3 导入服务挂载卷

```yaml
volumes:
  # 挂载卷：导入脚本和数据文件
  - ./docker-import.js:/app/docker-import.js
  - ./import-data-complete.json:/app/data/import-data-complete.json
```

## 2. 使用挂载卷更新代码文件

### 2.1 更新后端代码

1. 直接修改本地 `mbti-backend` 目录下的文件
2. 修改会自动同步到Docker容器内的 `/app` 目录
3. 重启后端服务使修改生效：
   ```bash
   docker-compose restart backend
   ```

### 2.2 更新前端代码

1. 直接修改本地 `mbti-frontend` 目录下的文件
2. 修改会自动同步到Docker容器内的 `/app/mbti-frontend` 目录
3. 重新构建并启动前端服务使修改生效：
   ```bash
   docker-compose up -d --build frontend
   ```

### 2.3 更新导入脚本和数据

1. 直接修改本地 `docker-import.js` 或 `simple-import.js` 文件
2. 直接修改本地 `import-data-complete.json` 数据文件
3. 修改会自动同步到Docker容器内的对应位置
4. 无需重启服务，下次运行导入命令时会使用更新后的文件

## 3. 运行数据导入

### 3.1 方式一：使用专门的导入服务

```bash
# 运行导入服务（一次性执行）
docker-compose run import-service
```

### 3.2 方式二：在后端容器内运行导入脚本

```bash
# 进入后端容器
docker-compose exec backend bash

# 在容器内运行导入脚本
node /app/docker-import.js
```

### 3.3 方式三：在本地运行导入脚本（开发环境）

```bash
# 确保已安装依赖
npm install mongodb

# 运行导入脚本
node simple-import.js
```

## 4. 数据导入注意事项

### 4.1 邮箱配置

- 导入脚本已移除模拟邮箱生成，邮箱字段默认为空字符串
- 如需添加真实邮箱，请修改 `import-data-complete.json` 文件，添加 `email` 字段

### 4.2 数据格式

确保 `import-data-complete.json` 文件格式正确，每条记录应包含以下字段：

```json
{
  "用户昵称": "张诗棋",
  "用户名称": "Mark",
  "性别": "男",
  "所属部门": "创新投资部",
  "性格类型": "ENTJ",
  "性格名称": "指挥官型人格",
  "I/E": "4/17",
  "S/N": "8/18",
  "T/F": "24/0",
  "J/P": "19/3",
  "完成时间": "2026-01-13",
  "是否完成": "是"
}
```

### 4.3 导入结果验证

导入完成后，可以通过以下方式验证：

1. 查看导入服务输出日志
2. 访问管理员面板：http://localhost:5173/
3. 使用MongoDB工具连接查看数据

## 5. 常见问题排查

### 5.1 挂载卷同步问题

- 确保本地文件修改后保存成功
- 检查Docker容器内文件是否已更新：
  ```bash
  docker-compose exec backend cat /app/docker-import.js
  ```

### 5.2 导入脚本运行失败

- 检查MongoDB连接配置
- 查看导入脚本日志获取详细错误信息
- 确保数据文件格式正确

### 5.3 服务重启失败

- 查看服务日志获取详细错误信息：
  ```bash
  docker-compose logs backend
  ```
- 检查代码语法错误
- 确保依赖已正确安装

## 6. 最佳实践

1. **开发环境**：使用挂载卷实时同步代码修改，提高开发效率
2. **生产环境**：建议使用构建镜像的方式部署，避免直接挂载代码目录
3. **数据管理**：定期备份MongoDB数据，确保数据安全
4. **版本控制**：使用Git管理代码，避免直接修改挂载卷文件导致版本混乱
5. **导入频率**：根据实际需求调整导入频率，避免频繁导入影响系统性能

## 7. 高级用法

### 7.1 自定义导入脚本

可以通过修改 `docker-import.js` 文件自定义导入逻辑，例如：

- 调整批量导入大小
- 修改数据转换规则
- 添加数据验证逻辑
- 调整导入日志格式

### 7.2 定时导入数据

可以使用 `cron` 或其他定时任务工具，定期运行导入命令：

```bash
# 每天凌晨2点运行导入
echo "0 2 * * * docker-compose -f /path/to/docker-compose.yml run import-service" >> /etc/crontab
```

### 7.3 多环境部署

可以创建多个 `docker-compose.yml` 文件，用于不同环境的部署：

- `docker-compose.dev.yml`：开发环境
- `docker-compose.prod.yml`：生产环境
- `docker-compose.test.yml`：测试环境

使用方式：

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 8. 联系方式

如果在使用过程中遇到问题，请联系开发团队或查看项目文档。
