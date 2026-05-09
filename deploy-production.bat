@echo off
chcp 65001 >nul
echo ==========================================
echo MBTI 测试系统 - 生产环境部署脚本
echo ==========================================
echo.

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 错误: 请以管理员身份运行此脚本
    pause
    exit /b 1
)

echo [1/5] 停止现有服务...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo      完成

echo.
echo [2/5] 切换到生产环境配置...
copy /Y mbti-backend\.env.production mbti-backend\.env >nul
echo      已切换到生产环境配置
echo      MongoDB: 139.180.215.236:27017

echo.
echo [3/5] 安装依赖...
cd mbti-backend
call npm install --production
cd ..
echo      完成

echo.
echo [4/5] 构建前端...
cd mbti-frontend
call npm install
call npm run build
cd ..
echo      完成

echo.
echo [5/5] 启动生产环境服务...
cd mbti-backend
start "MBTI Backend" cmd /c "npm start"
cd ..
echo      后端服务已启动

echo.
echo ==========================================
echo 部署完成!
echo 后端地址: http://localhost:3003
echo 前端构建目录: mbti-frontend/dist
echo ==========================================
echo.
pause
