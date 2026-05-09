@echo off
chcp 65001 >nul
echo ==========================================
echo SSH 隧道启动脚本
echo ==========================================
echo.

REM 配置
set SSH_HOST=139.180.215.236
set SSH_PORT=22
set LOCAL_PORT=27017
set REMOTE_PORT=27017

echo [配置信息]
echo 远程服务器: %SSH_HOST%:%SSH_PORT%
echo 端口映射: 本地 %LOCAL_PORT% -> 远程 %REMOTE_PORT%
echo.

REM 检查 SSH 是否可用
where ssh > nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 SSH 客户端
    echo 请安装 OpenSSH 或 Git for Windows
    pause
    exit /b 1
)

echo [1/3] 正在检查现有隧道...
netstat -ano | findstr ":%LOCAL_PORT%" | findstr "LISTENING" > nul
if not errorlevel 1 (
    echo      检测到已有隧道在运行
    echo      跳过创建步骤
    goto :tunnel_ready
)

echo.
echo [2/3] 正在建立 SSH 隧道...
echo      命令: ssh -N -L %LOCAL_PORT%:127.0.0.1:%REMOTE_PORT% %SSH_HOST% -p %SSH_PORT%
echo.
echo      提示: 首次连接需要输入密码或确认密钥指纹
echo      连接成功后窗口会保持运行，请勿关闭
echo.

REM 在新窗口启动 SSH 隧道
start "SSH Tunnel - MongoDB" cmd /c "ssh -N -L %LOCAL_PORT%:127.0.0.1:%REMOTE_PORT% %SSH_HOST% -p %SSH_PORT% && echo 隧道已关闭 && pause"

echo      已在新窗口启动 SSH 隧道
:e.

:tunnel_ready
echo.
echo [3/3] 验证连接...
timeout /t 3 /nobreak > nul

netstat -ano | findstr ":%LOCAL_PORT%" | findstr "LISTENING" > nul
if not errorlevel 1 (
    echo      隧道状态: 运行中
    echo.
    echo ==========================================
    echo SSH 隧道已建立！
    echo ==========================================
    echo.
    echo 现在可以安全地连接 MongoDB：
    echo   连接地址: 127.0.0.1:%LOCAL_PORT%
    echo   数据库: mbti_test
    echo.
    echo 提示: 保持 SSH 隧道窗口运行，不要关闭
    echo.
    echo 下一步: 运行 start-production.bat 启动应用
    echo ==========================================
) else (
    echo      隧道状态: 未运行
    echo.
    echo [警告] SSH 隧道可能未成功建立
    echo        请检查 SSH 窗口中的错误信息
    echo        确保可以连接到 %SSH_HOST%
)

echo.
pause
