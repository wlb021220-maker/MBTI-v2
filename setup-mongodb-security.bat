@echo off
chcp 65001 >nul
echo ==========================================
echo MongoDB 安全配置脚本
echo ==========================================
echo.
echo ⚠️  请在远程服务器 (139.180.215.236) 上运行以下命令：
echo.
echo ========== 步骤 1: 创建管理员账户 ==========
echo mongo
echo use admin
echo db.createUser({
echo   user: "admin",
echo   pwd: "YourStrongAdminPass123!",
echo   roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
echo })
echo.
echo ========== 步骤 2: 创建应用账户 ==========
echo use mbti_test
echo db.createUser({
echo   user: "mbti_app",
echo   pwd: "MbtiSecureAppPass456!",
echo   roles: [ { role: "readWrite", db: "mbti_test" } ]
echo })
echo.
echo ========== 步骤 3: 启用认证 ==========
echo # 编辑 /etc/mongod.conf，添加：
echo security:
echo   authorization: enabled
echo.
echo # 重启 MongoDB
echo systemctl restart mongod
echo.
echo ========== 步骤 4: 配置防火墙 ==========
echo # 只允许特定 IP 访问
echo iptables -A INPUT -p tcp --dport 27017 -s YOUR_APP_SERVER_IP -j ACCEPT
echo iptables -A INPUT -p tcp --dport 27017 -j DROP
echo.
echo ========== 步骤 5: 更新应用配置 ==========
echo # 修改 .env.production：
echo MONGODB_URI=mongodb://mbti_app:MbtiSecureAppPass456!@139.180.215.236:27017/mbti_test
echo.
pause
