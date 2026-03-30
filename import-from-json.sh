#!/bin/bash

# MongoDB 数据从 JSON 导入脚本
# 在目标服务器执行

MONGO_CONTAINER="mongo"
MONGO_DB="mbti_test"

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: $0 <备份文件.tar.gz>"
    echo "示例: $0 mongodb-json-export-20240101-120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 错误: 找不到文件 $BACKUP_FILE"
    exit 1
fi

echo "=========================================="
echo "MongoDB 数据导入"
echo "备份文件: $BACKUP_FILE"
echo "目标数据库: $MONGO_DB"
echo "=========================================="

# 解压文件
TEMP_DIR="./mongodb-import-temp"
mkdir -p "$TEMP_DIR"

echo "正在解压文件..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ 解压失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ 解压成功"
echo ""

# 检查 MongoDB 容器
echo "检查 MongoDB 容器..."
if ! docker ps | grep -q "$MONGO_CONTAINER"; then
    echo "❌ MongoDB 容器未运行"
    echo "请先执行: docker compose up -d mongo"
    rm -rf "$TEMP_DIR"
    exit 1
fi
echo "✅ MongoDB 容器正在运行"
echo ""

# 检查数据库是否已存在
echo "检查目标数据库..."
DB_EXISTS=$(docker exec "$MONGO_CONTAINER" mongosh --quiet --eval "db.getMongo().getDBNames().indexOf('$MONGO_DB') >= 0 ? 'true' : 'false'")

if [ "$DB_EXISTS" = "true" ]; then
    echo "⚠️  数据库 '$MONGO_DB' 已存在"
    read -p "是否删除现有数据并导入？(y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "操作已取消"
        rm -rf "$TEMP_DIR"
        exit 0
    fi
    
    echo "正在删除现有数据库..."
    docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --eval "db.dropDatabase()"
    echo "✅ 已删除现有数据库"
    echo ""
fi

# 导入 JSON 文件
echo "开始导入数据..."
for json_file in "$TEMP_DIR"/*.json; do
    if [ -f "$json_file" ]; then
        collection=$(basename "$json_file" .json)
        
        # 跳过 collections.txt 文件
        if [ "$collection" = "collections" ]; then
            continue
        fi
        
        echo "正在导入集合: $collection"
        
        # 复制文件到容器
        docker cp "$json_file" "$MONGO_CONTAINER:/tmp/import.json"
        
        # 导入数据
        docker exec "$MONGO_CONTAINER" mongoimport \
            --db "$MONGO_DB" \
            --collection "$collection" \
            --file /tmp/import.json \
            --jsonArray
        
        if [ $? -eq 0 ]; then
            echo "  ✅ $collection 导入成功"
        else
            echo "  ❌ $collection 导入失败"
        fi
        
        # 删除容器中的临时文件
        docker exec "$MONGO_CONTAINER" rm -f /tmp/import.json
    fi
done

echo ""
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

# 清理
rm -rf "$TEMP_DIR"
echo "已清理临时文件"
