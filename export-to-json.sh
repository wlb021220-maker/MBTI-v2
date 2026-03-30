#!/bin/bash

# MongoDB 数据导出为 JSON 脚本
# 在本地（数据源服务器）执行

# 配置
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="mbti_test"
OUTPUT_DIR="./mongodb-json-export-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "MongoDB 数据导出为 JSON"
echo "数据库: $MONGO_DB"
echo "输出目录: $OUTPUT_DIR"
echo "=========================================="

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 获取所有集合
echo "正在获取集合列表..."
collections=$(mongo --host "$MONGO_HOST" --port "$MONGO_PORT" "$MONGO_DB" --quiet --eval "db.getCollectionNames().join(' ')")

if [ -z "$collections" ]; then
    echo "❌ 没有找到任何集合"
    exit 1
fi

echo "找到集合: $collections"
echo ""

# 导出每个集合为 JSON
for collection in $collections; do
    echo "正在导出集合: $collection"
    mongoexport \
        --host "$MONGO_HOST" \
        --port "$MONGO_PORT" \
        --db "$MONGO_DB" \
        --collection "$collection" \
        --out "$OUTPUT_DIR/$collection.json" \
        --jsonArray
    
    if [ $? -eq 0 ]; then
        echo "  ✅ $collection.json 导出成功"
        # 显示文件大小
        ls -lh "$OUTPUT_DIR/$collection.json" | awk '{print "     大小:", $5}'
    else
        echo "  ❌ $collection.json 导出失败"
    fi
    echo ""
done

# 创建集合列表文件
echo "$collections" > "$OUTPUT_DIR/collections.txt"

# 压缩所有文件
echo "正在压缩文件..."
cd "$OUTPUT_DIR"
tar -czf "../$OUTPUT_DIR.tar.gz" .
cd ..

if [ $? -eq 0 ]; then
    # 删除原始目录，只保留压缩文件
    rm -rf "$OUTPUT_DIR"
    
    echo ""
    echo "=========================================="
    echo "导出完成！"
    echo "文件: $OUTPUT_DIR.tar.gz"
    echo "=========================================="
    echo ""
    echo "请将此文件上传到目标服务器，然后执行导入脚本"
else
    echo "❌ 压缩失败"
    exit 1
fi
