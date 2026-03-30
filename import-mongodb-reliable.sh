#!/bin/bash

# MongoDB 数据导入脚本（使用 Node.js，更可靠）
# 在目标服务器上运行

# 配置
MONGO_CONTAINER="mbti-mongo-1"
MONGO_DB="mbti_test"
MONGO_URI="mongodb://localhost:27017/mbti_test"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}MongoDB 数据导入工具${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# 检查数据文件
echo -e "${YELLOW}检查数据文件...${NC}"
if [ ! -f "mbti_test.results.json" ] && [ ! -f "mbti_test.users.json" ]; then
    echo -e "${RED}❌ 错误: 找不到数据文件${NC}"
    echo "需要文件: mbti_test.results.json 和 mbti_test.users.json"
    exit 1
fi

# 检查 MongoDB 容器
echo -e "${YELLOW}检查 MongoDB 容器...${NC}"
if ! sudo docker ps --format "{{.Names}}" | grep -q "^${MONGO_CONTAINER}$"; then
    echo -e "${RED}❌ MongoDB 容器未运行${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MongoDB 容器正在运行${NC}"
echo ""

# 创建临时 Node.js 导入脚本
cat > /tmp/import-data.js << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const readline = require('readline');

const MONGO_URI = 'mongodb://localhost:27017/mbti_test';
const DB_NAME = 'mbti_test';

async function importFile(filePath, collectionName) {
    console.log(`正在导入: ${collectionName}`);
    
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(collectionName);
        
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        
        let documents = [];
        
        // 尝试解析为 JSON 数组
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                documents = parsed;
            } else {
                documents = [parsed];
            }
        } catch (e) {
            // 不是 JSON 数组，尝试按行解析（NDJSON 格式）
            const lines = content.split('\n').filter(line => line.trim());
            for (const line of lines) {
                try {
                    const doc = JSON.parse(line);
                    documents.push(doc);
                } catch (e) {
                    // 忽略解析失败的行
                }
            }
        }
        
        if (documents.length === 0) {
            console.log(`  ⚠️  没有有效的文档: ${collectionName}`);
            return;
        }
        
        // 清空集合
        await collection.deleteMany({});
        
        // 插入数据
        const result = await collection.insertMany(documents);
        console.log(`  ✅ ${collectionName} 导入成功 (${result.insertedCount} 条记录)`);
        
    } catch (error) {
        console.error(`  ❌ ${collectionName} 导入失败:`, error.message);
    } finally {
        await client.close();
    }
}

async function main() {
    const files = [
        { file: 'mbti_test.results.json', collection: 'results' },
        { file: 'mbti_test.users.json', collection: 'users' }
    ];
    
    for (const { file, collection } of files) {
        if (fs.existsSync(file)) {
            await importFile(file, collection);
        } else {
            console.log(`  ⚠️  跳过: ${file} 不存在`);
        }
    }
    
    console.log('\n验证导入结果...');
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    const collections = await db.listCollections().toArray();
    console.log('数据库中的集合:');
    for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  📁 ${col.name}: ${count} 条记录`);
    }
    
    await client.close();
}

main().catch(console.error);
EOF

# 复制文件到后端目录并执行
echo -e "${YELLOW}复制导入脚本到容器...${NC}"
sudo docker cp /tmp/import-data.js "$MONGO_CONTAINER:/tmp/import-data.js"

# 检查 mongodb 包是否安装
echo -e "${YELLOW}检查 Node.js 环境...${NC}"
sudo docker exec "$MONGO_CONTAINER" sh -c "cd /tmp && npm list mongodb 2>/dev/null || npm install mongodb --silent"

# 复制数据文件到容器
echo -e "${YELLOW}复制数据文件到容器...${NC}"
if [ -f "mbti_test.results.json" ]; then
    sudo docker cp "mbti_test.results.json" "$MONGO_CONTAINER:/tmp/"
fi
if [ -f "mbti_test.users.json" ]; then
    sudo docker cp "mbti_test.users.json" "$MONGO_CONTAINER:/tmp/"
fi

# 执行导入
echo ""
echo -e "${GREEN}开始导入数据...${NC}"
echo ""
sudo docker exec -w /tmp "$MONGO_CONTAINER" node import-data.js

# 清理
echo ""
echo -e "${YELLOW}清理临时文件...${NC}"
sudo docker exec "$MONGO_CONTAINER" rm -f /tmp/import-data.js /tmp/mbti_test.*.json

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}导入完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
