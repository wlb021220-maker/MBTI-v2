const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 目标数据库
const TARGET_URI = 'mongodb://localhost:27017/mbti_test';

// JSON 文件路径
const TEST_FILE = 'e:\\MBTI-test\\data\\mbti_test.results.json';
const OLD_FILE = 'e:\\MBTI-test\\data\\mbti_old.results.json';

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

// 生成唯一标识键（用于去重）
function getUniqueKey(doc) {
    // 使用 test_id 或 name + submission_time 组合作为唯一键
    if (doc.test_results?.test_id) {
        return doc.test_results.test_id;
    }
    const name = doc.user_info?.name || '';
    const time = doc.submission_time?.$date || doc.submission_time || '';
    return `${name}_${time}`;
}

async function mergeAndImport() {
    console.log('📥 数据合并与导入工具');
    console.log('======================');
    console.log(`测试数据文件: ${TEST_FILE}`);
    console.log(`旧数据文件: ${OLD_FILE}`);
    console.log(`目标数据库: ${TARGET_URI}`);
    console.log('');

    // 检查文件是否存在
    if (!fs.existsSync(TEST_FILE)) {
        console.error('❌ 测试数据文件不存在:', TEST_FILE);
        process.exit(1);
    }
    if (!fs.existsSync(OLD_FILE)) {
        console.error('❌ 旧数据文件不存在:', OLD_FILE);
        process.exit(1);
    }

    // 读取测试数据文件
    console.log('🔄 正在读取测试数据文件...');
    const testContent = fs.readFileSync(TEST_FILE, 'utf8');
    console.log(`   文件大小: ${(testContent.length / 1024).toFixed(2)} KB`);

    // 读取旧数据文件
    console.log('🔄 正在读取旧数据文件...');
    const oldContent = fs.readFileSync(OLD_FILE, 'utf8');
    console.log(`   文件大小: ${(oldContent.length / 1024).toFixed(2)} KB`);

    // 解析 JSON
    console.log('\n🔄 正在解析 JSON...');
    let testData, oldData;
    try {
        testData = JSON.parse(testContent);
        oldData = JSON.parse(oldContent);
    } catch (error) {
        console.error('❌ JSON 解析失败:', error.message);
        process.exit(1);
    }

    if (!Array.isArray(testData) || !Array.isArray(oldData)) {
        console.error('❌ 数据格式错误: 期望是一个数组');
        process.exit(1);
    }

    console.log(`   测试数据: ${testData.length} 条记录`);
    console.log(`   旧数据: ${oldData.length} 条记录`);

    // 合并数据并去重
    console.log('\n🔄 正在合并数据并去重...');
    const mergedMap = new Map();

    // 先添加测试数据
    for (const doc of testData) {
        const key = getUniqueKey(doc);
        mergedMap.set(key, doc);
    }

    // 再添加旧数据（如果存在重复则跳过）
    let duplicateCount = 0;
    for (const doc of oldData) {
        const key = getUniqueKey(doc);
        if (mergedMap.has(key)) {
            duplicateCount++;
        } else {
            mergedMap.set(key, doc);
        }
    }

    const mergedData = Array.from(mergedMap.values());
    console.log(`   合并后数据: ${mergedData.length} 条记录`);
    console.log(`   去重数量: ${duplicateCount} 条重复记录`);

    // 连接数据库
    console.log('\n🔄 正在连接数据库...');
    const conn = await mongoose.createConnection(TARGET_URI);
    console.log('✅ 数据库连接成功');

    try {
        const collection = conn.collection('results');

        // 清空现有数据
        console.log('\n🗑️  正在清空现有数据...');
        const deleteResult = await collection.deleteMany({});
        console.log(`   已删除 ${deleteResult.deletedCount} 条旧数据`);

        // 转换数据类型
        console.log('\n🔄 正在转换数据类型...');
        const convertedData = mergedData.map(doc => convertMongoTypes(doc));

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
            .limit(5)
            .toArray();

        console.log('\n📝 最新数据示例:');
        sample.forEach(doc => {
            console.log(`   - ${doc.user_info?.name}: ${doc.test_results?.mbti_type} (${doc.submission_time})`);
        });

        console.log('\n✅ 数据合并与导入完成！');

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

mergeAndImport();
