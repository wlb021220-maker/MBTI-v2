@echo off
chcp 65001 >nul
echo ==========================================
echo MBTI 生产环境启动脚本
echo ==========================================
echo.

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [提示] 建议以管理员身份运行
    echo.
)

echo [1/4] 检查 SSH 隧道状态...
netstat -ano | findstr ":27017" | findstr "LISTENING" > nul
if errorlevel 1 (
    echo      [警告] SSH 隧道未运行
    echo.
    echo      请先运行 start-ssh-tunnel.bat 建立隧道
    echo      或者确认 MongoDB 已在本地运行
    echo.
    choice /C YN /M "是否继续启动"
    if errorlevel 2 exit /b 1
) else (
    echo      隧道状态: 运行中
)

echo.
echo [2/4] 切换到生产环境配置...
copy /Y mbti-backend\.env.production mbti-backend\.env >nul
echo      已使用生产环境配置
echo      MongoDB: 127.0.0.1:27017 (本地回环)

echo.
echo [3/4] 安装依赖（如需要）...
if not exist "mbti-backend\node_modules" (
    echo      正在安装后端依赖...
    cd mbti-backend
    call npm install --production
    cd ..
) else (
    echo      依赖已安装
)

if not exist "mbti-frontend\node_modules" (
    echo      正在安装前端依赖...
    cd mbti-frontend
    call npm install
    cd ..
)

echo.
echo [4/4] 构建前端...
cd mbti-frontend
call npm run build 2>nul
cd ..
echo      构建完成

echo.
echo ==========================================
echo 正在启动生产环境服务...
echo ==========================================
echo.

REM 启动后端服务
cd mbti-backend
start "MBTI Backend (Production)" cmd /c "npm start"
cd ..

echo      后端服务已启动
:e.

echo.
echo ==========================================
echo 生产环境启动完成！
echo ==========================================
echo.
echo 访问地址:
echo   后端 API: http://localhost:3003
echo   前端页面: http://localhost:3003 (如配置了静态文件服务)
echo.
echo 安全特性:
echo   MongoDB 通过本地回环连接 (127.0.0.1)
echo   公网无法直接访问数据库端口
echo   数据传输通过 SSH 加密隧道
echo.
echo 提示:
echo   - 保持 SSH 隧道窗口运行
:e   - 按 Ctrl+C 停止后端服务
:e.
echo ==========================================
pause
