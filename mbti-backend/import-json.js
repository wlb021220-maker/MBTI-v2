const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 目标数据库
const TARGET_URI = 'mongodb://localhost:27017/mbti_test';

// JSON 文件路径
const JSON_FILE = 'e:\\MBTI-test\\data\\mbti_test.results.json';

// 转换 MongoDB 扩展类型
function convertMongoTypes(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertMongoTypes(item));
    }

    // 处理 $oid
    if (obj.$oid) {
        return new mongoose.Types.ObjectId(obj.$oid);
    }

    // 处理 $date
    if (obj.$date) {
        return new Date(obj.$date);
    }

    // 处理 $numberInt
    if (obj.$numberInt) {
        return parseInt(obj.$numberInt);
    }

    // 处理 $numberLong
    if (obj.$numberLong) {
        return parseInt(obj.$numberLong);
    }

    // 处理 $numberDouble
    if (obj.$numberDouble) {
        return parseFloat(obj.$numberDouble);
    }

    // 递归处理对象
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = convertMongoTypes(obj[key]);
        }
    }
    return result;
}

async function importData() {
    console.log('📥 数据导入工具');
    console.log('================');
    console.log(`文件: ${JSON_FILE}`);
    console.log(`目标数据库: ${TARGET_URI}`);
    console.log('');

    // 检查文件是否存在
    if (!fs.existsSync(JSON_FILE)) {
        console.error('❌ 文件不存在:', JSON_FILE);
        process.exit(1);
    }

    // 读取文件
    console.log('🔄 正在读取 JSON 文件...');
    const fileContent = fs.readFileSync(JSON_FILE, 'utf8');
    console.log(`   文件大小: ${(fileContent.length / 1024).toFixed(2)} KB`);

    // 解析 JSON
    console.log('🔄 正在解析 JSON...');
    let data;
    try {
        data = JSON.parse(fileContent);
    } catch (error) {
        console.error('❌ JSON 解析失败:', error.message);
        process.exit(1);
    }

    if (!Array.isArray(data)) {
        console.error('❌ 数据格式错误: 期望是一个数组');
        process.exit(1);
    }

    console.log(`   包含 ${data.length} 条记录`);

    // 连接数据库
    console.log('\n🔄 正在连接数据库...');
    const conn = await mongoose.createConnection(TARGET_URI);
    console.log('✅ 数据库连接成功');

    try {
        const collection = conn.collection('results');

        // 清空现有数据（可选）
        console.log('\n🗑️  正在清空现有数据...');
        const deleteResult = await collection.deleteMany({});
        console.log(`   已删除 ${deleteResult.deletedCount} 条旧数据`);

        // 转换数据类型
        console.log('\n🔄 正在转换数据类型...');
        const convertedData = data.map(doc => convertMongoTypes(doc));

        // 插入数据
        console.log('\n📦 正在插入数据...');
        const result = await collection.insertMany(convertedData, { ordered: false });
        console.log(`   ✅ 成功插入 ${result.insertedCount} 条数据`);

        // 验证导入
        const count = await collection.countDocuments();
        console.log(`\n📊 数据库中现有 ${count} 条记录`);

        // 显示最新几条数据
        const sample = await collection.find({})
            .sort({ submission_time: -1 })
            .limit(3)
            .toArray();
        
        console.log('\n📝 最新数据示例:');
        sample.forEach(doc => {
            console.log(`   - ${doc.user_info?.name}: ${doc.test_results?.mbti_type} (${doc.submission_time})`);
        });

        console.log('\n✅ 数据导入完成！');

    } catch (error) {
        console.error('❌ 导入失败:', error.message);
        if (error.writeErrors) {
            console.error(`   写入错误数: ${error.writeErrors.length}`);
        }
    } finally {
        await conn.close();
        console.log('\n🔌 数据库连接已关闭');
    }
}

importData();
