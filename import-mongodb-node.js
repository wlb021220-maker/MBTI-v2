#!/usr/bin/env node

/**
 * MongoDB 数据导入脚本（纯 Node.js，用于 Docker 环境）
 * 在目标服务器执行
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// 配置
const MONGO_URI = 'mongodb://localhost:27017/mbti_test';
const DB_NAME = 'mbti_test';

async function checkMongoDBContainer() {
    try {
        const result = execSync('docker ps --filter "name=mongo" --format "{{.Names}}"', { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return null;
    }
}

async function importData(exportDir) {
    console.log('==========================================');
    console.log('MongoDB 数据导入');
    console.log('数据源:', exportDir);
    console.log('目标数据库:', DB_NAME);
    console.log('==========================================\n');

    // 检查 MongoDB 容器
    console.log('检查 MongoDB 容器...');
    const containerName = await checkMongoDBContainer();
    if (!containerName) {
        console.error('❌ MongoDB 容器未运行');
        console.log('请先执行: docker compose up -d mongo');
        process.exit(1);
    }
    console.log('✅ MongoDB 容器正在运行:', containerName, '\n');

    const client = new MongoClient(MONGO_URI);

    try {
        // 连接数据库
        await client.connect();
        console.log('✅ 已连接到 MongoDB\n');

        const db = client.db(DB_NAME);

        // 检查数据库是否已存在
        const adminDb = client.db('admin');
        const dbList = await adminDb.admin().listDatabases();
        const dbExists = dbList.databases.some(d => d.name === DB_NAME);

        if (dbExists) {
            console.log('⚠️  数据库已存在');
            // 读取用户输入
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                readline.question('是否删除现有数据并导入？(y/N): ', resolve);
            });
            readline.close();

            if (answer.toLowerCase() !== 'y') {
                console.log('操作已取消');
                return;
            }

            // 删除所有集合
            const collections = await db.listCollections().toArray();
            for (const col of collections) {
                await db.collection(col.name).drop();
                console.log(`  已删除集合: ${col.name}`);
            }
            console.log('✅ 已清空数据库\n');
        }

        // 读取导出目录中的 JSON 文件
        const files = await fs.readdir(exportDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`找到 ${jsonFiles.length} 个数据文件\n`);

        // 导入每个文件
        for (const file of jsonFiles) {
            const collectionName = path.basename(file, '.json');
            const filePath = path.join(exportDir, file);

            console.log(`正在导入: ${collectionName}`);

            // 读取 JSON 文件
            const content = await fs.readFile(filePath, 'utf8');
            const documents = JSON.parse(content);

            if (!Array.isArray(documents) || documents.length === 0) {
                console.log(`  ⚠️  跳过空集合: ${collectionName}`);
                continue;
            }

            // 插入数据
            const collection = db.collection(collectionName);
            const result = await collection.insertMany(documents);

            console.log(`  ✅ ${collectionName} (${result.insertedCount} 条记录)`);
        }

        // 验证导入结果
        console.log('\n验证导入结果...');
        const collections = await db.listCollections().toArray();
        console.log('数据库中的集合:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  - ${col.name}: ${count} 条记录`);
        }

        console.log('\n==========================================');
        console.log('导入完成！');
        console.log('==========================================');

    } catch (error) {
        console.error('\n❌ 导入失败:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n已断开连接');
    }
}

// 主程序
const exportDir = process.argv[2];

if (!exportDir) {
    console.log('用法: node import-mongodb-node.js <导出目录>');
    console.log('示例: node import-mongodb-node.js ./mongodb-export-2024-01-01T12-00-00');
    process.exit(1);
}

importData(exportDir);
