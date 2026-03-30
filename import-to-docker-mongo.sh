#!/bin/bash

# MongoDB 数据导入到 Docker 容器脚本
# 在目标服务器上运行，自动导入 results.json 和 users.json

# 配置
MONGO_CONTAINER="mbti-mongo-1"
MONGO_DB="mbti_test"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}MongoDB Docker 数据导入工具${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# 检查数据文件
echo -e "${YELLOW}检查数据文件...${NC}"

if [ ! -f "mbti_test.results.json" ] && [ ! -f "mbti_test.users.json" ]; then
    echo -e "${RED}❌ 错误: 找不到 mbti_test.results.json 或 mbti_test.users.json 文件${NC}"
    echo ""
    echo "请确保已将数据文件上传到当前目录:"
    echo "  - mbti_test.results.json"
    echo "  - mbti_test.users.json"
    echo ""
    echo "上传命令示例:"
    echo "  scp mbti_test.results.json mbti_test.users.json root@服务器IP:/root/mbti/"
    exit 1
fi

# 检查 MongoDB 容器
echo -e "${YELLOW}检查 MongoDB 容器...${NC}"
if ! sudo docker ps --format "{{.Names}}" | grep -q "^${MONGO_CONTAINER}$"; then
    echo -e "${RED}❌ MongoDB 容器未运行${NC}"
    echo ""
    echo "请先启动容器:"
    echo "  sudo docker compose up -d mongo"
    echo ""
    echo "或者检查容器名称是否正确"
    exit 1
fi
echo -e "${GREEN}✅ MongoDB 容器正在运行${NC}"
echo ""

# 检查数据库是否存在
echo -e "${YELLOW}检查目标数据库...${NC}"
DB_EXISTS=$(sudo docker exec "$MONGO_CONTAINER" mongosh --quiet --eval "db.getMongo().getDBNames().includes('$MONGO_DB')")

if [ "$DB_EXISTS" = "true" ]; then
    echo -e "${YELLOW}⚠️  数据库 '$MONGO_DB' 已存在${NC}"
    echo ""
    read -p "是否清空现有数据并导入？(y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
    fi
    
    # 清空集合而不是删除数据库
    echo -e "${YELLOW}正在清空现有集合...${NC}"
    sudo docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --quiet --eval "
        db.getCollectionNames().forEach(function(col) {
            db[col].deleteMany({});
            print('已清空: ' + col);
        });
    "
    echo -e "${GREEN}✅ 已清空现有数据${NC}"
fi
echo ""

# 导入数据函数
import_collection() {
    local file=$1
    local collection=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  跳过: $file 不存在${NC}"
        return
    fi
    
    echo -e "${YELLOW}正在导入: $collection${NC}"
    
    # 复制文件到容器
    sudo docker cp "$file" "$MONGO_CONTAINER:/tmp/$collection.json"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 复制 $file 到容器失败${NC}"
        return
    fi
    
    # 检查文件格式（判断是 JSON 数组还是 NDJSON）
    local first_char=$(head -c 1 "/tmp/$collection.json" 2>/dev/null || echo "")
    
    # 导入数据（不使用 --jsonArray，让 mongoimport 自动检测格式）
    sudo docker exec "$MONGO_CONTAINER" mongoimport \
        --db "$MONGO_DB" \
        --collection "$collection" \
        --file "/tmp/$collection.json" \
        2>&1
    
    if [ $? -eq 0 ]; then
        # 获取导入的记录数
        local count=$(sudo docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --quiet --eval "db.$collection.countDocuments()")
        echo -e "${GREEN}✅ $collection 导入成功 ($count 条记录)${NC}"
    else
        echo -e "${RED}❌ $collection 导入失败，尝试其他格式...${NC}"
        
        # 尝试使用 JSON 数组格式
        echo -e "${YELLOW}尝试使用 JSON 数组格式导入...${NC}"
        sudo docker exec "$MONGO_CONTAINER" mongoimport \
            --db "$MONGO_DB" \
            --collection "$collection" \
            --file "/tmp/$collection.json" \
            --jsonArray \
            2>&1
        
        if [ $? -eq 0 ]; then
            local count=$(sudo docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --quiet --eval "db.$collection.countDocuments()")
            echo -e "${GREEN}✅ $collection 导入成功 ($count 条记录)${NC}"
        else
            echo -e "${RED}❌ $collection 导入失败${NC}"
        fi
    fi
    
    # 清理容器中的临时文件
    sudo docker exec "$MONGO_CONTAINER" rm -f "/tmp/$collection.json"
}

# 开始导入
echo -e "${GREEN}开始导入数据...${NC}"
echo ""

import_collection "mbti_test.results.json" "results"
import_collection "mbti_test.users.json" "users"

echo ""

# 验证导入结果
echo -e "${GREEN}验证导入结果...${NC}"
echo ""
sudo docker exec "$MONGO_CONTAINER" mongosh "$MONGO_DB" --quiet --eval "
    print('数据库中的集合:');
    db.getCollectionNames().forEach(function(col) {
        var count = db[col].countDocuments();
        print('  📁 ' + col + ': ' + count + ' 条记录');
    });
"

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}导入完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "数据已成功导入到 Docker MongoDB 容器中"
echo ""
