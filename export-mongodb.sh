#!/bin/bash

# MongoDB 数据导出脚本
# 在本地（数据源服务器）执行

# 配置
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="mbti_test"
BACKUP_DIR="./mongodb-backup-$(date +%Y%m%d-%H%M%S)"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "开始导出 MongoDB 数据"
echo "数据库: $MONGO_DB"
echo "备份目录: $BACKUP_DIR"
echo "=========================================="

# 导出整个数据库
echo "正在导出数据..."
mongodump --host "$MONGO_HOST" --port "$MONGO_PORT" --db "$MONGO_DB" --out "$BACKUP_DIR"

if [ $? -eq 0 ]; then
    echo "✅ 数据导出成功！"
    echo ""
    echo "导出内容:"
    ls -la "$BACKUP_DIR/$MONGO_DB/"
    echo ""
    
    # 压缩备份文件
    echo "正在压缩备份文件..."
    tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
    
    if [ $? -eq 0 ]; then
        echo "✅ 压缩成功: $BACKUP_DIR.tar.gz"
        
        # 删除原始备份目录，只保留压缩文件
        rm -rf "$BACKUP_DIR"
        
        echo ""
        echo "=========================================="
        echo "导出完成！"
        echo "备份文件: $BACKUP_DIR.tar.gz"
        echo "=========================================="
        echo ""
        echo "请将 $BACKUP_DIR.tar.gz 文件传输到目标服务器"
        echo "传输命令示例:"
        echo "  scp $BACKUP_DIR.tar.gz user@target-server:/path/to/backup/"
    else
        echo "❌ 压缩失败"
        exit 1
    fi
else
    echo "❌ 数据导出失败"
    exit 1
fi
