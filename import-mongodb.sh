#!/bin/bash

# MongoDB 数据导入脚本
# 在目标服务器执行

# 配置
MONGO_CONTAINER="mongo"  # Docker 容器名称
MONGO_DB="mbti_test"

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: $0 <备份文件.tar.gz>"
    echo "示例: $0 mongodb-backup-20240101-120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# 检查文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 错误: 找不到文件 $BACKUP_FILE"
    exit 1
fi

echo "=========================================="
echo "开始导入 MongoDB 数据"
echo "备份文件: $BACKUP_FILE"
echo "目标数据库: $MONGO_DB"
echo "=========================================="

# 创建临时目录
TEMP_DIR="./mongodb-restore-temp"
mkdir -p "$TEMP_DIR"

# 解压备份文件
echo "正在解压备份文件..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ 解压失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ 解压成功"
echo ""

# 检查 MongoDB 容器是否运行
echo "检查 MongoDB 容器状态..."
if ! docker ps | grep -q "$MONGO_CONTAINER"; then
    echo "❌ 错误: MongoDB 容器 '$MONGO_CONTAINER' 未运行"
    echo "请先启动容器: docker compose up -d mongo"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ MongoDB 容器正在运行"
echo ""

# 检查数据库是否已存在
echo "检查目标数据库..."
DB_EXISTS=$(docker exec "$MONGO_CONTAINER" mongosh --quiet --eval "db.getMongo().getDBNames().indexOf('$MONGO_DB') >= 0 ? 'true' : 'false'")

if [ "$DB_EXISTS" = "true" ]; then
    echo "⚠️  警告: 数据库 '$MONGO_DB' 已存在"
    read -p "是否删除现有数据并导入？(y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "操作已取消"
        rm -rf "$TEMP_DIR"
        exit 0
    fi
    
    # 删除现有数据库
    echo "正在删除现有数据库..."
    docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --eval "db.dropDatabase()"
    
    if [ $? -eq 0 ]; then
        echo "✅ 已删除现有数据库"
    else
        echo "❌ 删除数据库失败"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
fi

echo ""

# 复制备份文件到容器
echo "正在复制数据到容器..."
docker cp "$TEMP_DIR/$MONGO_CONTAINER" "$MONGO_CONTAINER:/tmp/restore-data"

if [ $? -ne 0 ]; then
    # 尝试其他目录结构
    docker cp "$TEMP_DIR/$MONGO_DB" "$MONGO_CONTAINER:/tmp/restore-data"
fi

if [ $? -ne 0 ]; then
    echo "❌ 复制数据到容器失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ 数据已复制到容器"
echo ""

# 执行导入
echo "正在导入数据..."
docker exec "$MONGO_CONTAINER" mongorestore --db "$MONGO_DB" "/tmp/restore-data"

if [ $? -eq 0 ]; then
    echo "✅ 数据导入成功！"
    echo ""
    
    # 验证导入
    echo "验证导入结果..."
    docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --eval "
        print('数据库中的集合:');
        db.getCollectionNames().forEach(function(col) {
            print('  - ' + col + ': ' + db[col].countDocuments() + ' 条记录');
        });
    "
    
    echo ""
    echo "=========================================="
    echo "导入完成！"
    echo "=========================================="
else
    echo "❌ 数据导入失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 清理临时文件
echo ""
echo "清理临时文件..."
docker exec "$MONGO_CONTAINER" rm -rf /tmp/restore-data
rm -rf "$TEMP_DIR"
echo "✅ 清理完成"
