#!/usr/bin/env node

/**
 * MongoDB 数据导出脚本（纯 Node.js，无需命令行工具）
 * 在本地执行
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// 配置
const MONGO_URI = 'mongodb://localhost:27017/mbti_test';
const DB_NAME = 'mbti_test';
const OUTPUT_DIR = `./mongodb-export-${new Date().toISOString().replace(/[:.]/g, '-')}`;

async function exportData() {
    console.log('==========================================');
    console.log('MongoDB 数据导出');
    console.log('数据库:', DB_NAME);
    console.log('输出目录:', OUTPUT_DIR);
    console.log('==========================================\n');

    const client = new MongoClient(MONGO_URI);

    try {
        // 连接数据库
        await client.connect();
        console.log('✅ 已连接到 MongoDB');

        const db = client.db(DB_NAME);

        // 获取所有集合
        const collections = await db.listCollections().toArray();
        console.log(`找到 ${collections.length} 个集合\n`);

        // 创建输出目录
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        // 导出每个集合
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`正在导出: ${collectionName}`);

            const collection = db.collection(collectionName);
            const documents = await collection.find({}).toArray();

            // 保存为 JSON 文件
            const outputPath = path.join(OUTPUT_DIR, `${collectionName}.json`);
            await fs.writeFile(
                outputPath,
                JSON.stringify(documents, null, 2),
                'utf8'
            );

            const stats = await fs.stat(outputPath);
            const sizeInKB = (stats.size / 1024).toFixed(2);

            console.log(`  ✅ ${collectionName}.json (${documents.length} 条记录, ${sizeInKB} KB)`);
        }

        // 保存集合列表
        const collectionList = collections.map(c => c.name).join('\n');
        await fs.writeFile(
            path.join(OUTPUT_DIR, 'collections.txt'),
            collectionList,
            'utf8'
        );

        console.log('\n==========================================');
        console.log('导出完成！');
        console.log('文件位置:', path.resolve(OUTPUT_DIR));
        console.log('==========================================');
        console.log('\n请将此目录压缩并上传到目标服务器');
        console.log('压缩命令: tar -czf export.tar.gz', OUTPUT_DIR);

    } catch (error) {
        console.error('\n❌ 导出失败:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n已断开连接');
    }
}

// 运行导出
exportData();
