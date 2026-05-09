const mongoose = require('mongoose');

async function checkDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mbti_test');
        console.log('✅ 连接成功');

        // 获取所有集合
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 数据库集合:');
        collections.forEach(col => console.log(`  - ${col.name}`));

        // 检查 results 集合
        const resultsCount = await mongoose.connection.db.collection('results').countDocuments();
        console.log(`\n📊 results 集合中的文档数: ${resultsCount}`);

        // 检查 users 集合
        const usersCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`👤 users 集合中的文档数: ${usersCount}`);

        // 如果有数据，显示几条
        if (resultsCount > 0) {
            const results = await mongoose.connection.db.collection('results')
                .find({}, { projection: { 'user_info.name': 1, 'test_results.mbti_type': 1, submission_time: 1 } })
                .limit(3)
                .toArray();
            console.log('\n📝 最新数据示例:');
            results.forEach(r => console.log(`  - ${r.user_info?.name}: ${r.test_results?.mbti_type} (${r.submission_time})`));
        }

        await mongoose.disconnect();
        console.log('\n✅ 检查完成');
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

checkDatabase();
