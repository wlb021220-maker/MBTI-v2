const mongoose = require('mongoose');

const TARGET_URI = 'mongodb://localhost:27017/mbti_test';

async function testAPI() {
    const conn = await mongoose.createConnection(TARGET_URI);
    console.log('✅ 数据库连接成功\n');

    const collection = conn.collection('results');
    
    // 获取一条数据查看完整结构
    const doc = await collection.findOne({});
    
    console.log('📋 数据字段结构:');
    console.log('================');
    console.log('_id:', doc._id);
    console.log('user_info:', JSON.stringify(doc.user_info, null, 2));
    console.log('test_results:', JSON.stringify(doc.test_results, null, 2));
    console.log('status:', doc.status);
    console.log('submission_time:', doc.submission_time);
    console.log('candidate_type:', doc.candidate_type);
    
    // 检查关键字段是否存在
    console.log('\n🔍 字段检查:');
    console.log('================');
    const checks = [
        ['user_info.name', doc.user_info?.name],
        ['user_info.email', doc.user_info?.email],
        ['test_results.mbti_type', doc.test_results?.mbti_type],
        ['status', doc.status],
        ['submission_time', doc.submission_time],
    ];
    
    checks.forEach(([field, value]) => {
        const status = value !== undefined ? '✅' : '❌';
        console.log(`${status} ${field}: ${value || '缺失'}`);
    });

    await conn.close();
}

testAPI();
