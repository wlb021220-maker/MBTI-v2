const mongoose = require('mongoose');

// 源数据库（远程，通过 SSH 隧道转发到本地端口）
const SOURCE_URI = 'mongodb://localhost:27017/mbti_test'; // 假设 SSH 隧道已将远程 27017 转发到本地某个端口
// 如果 SSH 隧道转发到了其他端口，请修改上面的端口号

// 目标数据库（本地）
const TARGET_URI = 'mongodb://localhost:27017/mbti_test';

async function migrateData() {
    let sourceConn, targetConn;
    
    try {
        console.log('🔄 正在连接源数据库...');
        sourceConn = await mongoose.createConnection(SOURCE_URI);
        console.log('✅ 源数据库连接成功');

        console.log('🔄 正在连接目标数据库...');
        targetConn = await mongoose.createConnection(TARGET_URI);
        console.log('✅ 目标数据库连接成功');

        // 获取源数据库的集合
        const sourceDb = sourceConn.db;
        const targetDb = targetConn.db;

        // 要迁移的集合列表
        const collections = ['results', 'users'];

        for (const collectionName of collections) {
            console.log(`\n📦 正在迁移集合: ${collectionName}`);
            
            // 获取源集合数据
            const sourceCollection = sourceDb.collection(collectionName);
            const data = await sourceCollection.find({}).toArray();
            
            console.log(`   源集合中有 ${data.length} 条数据`);
            
            if (data.length === 0) {
                console.log(`   ⏭️  跳过空集合`);
                continue;
            }

            // 获取目标集合
            const targetCollection = targetDb.collection(collectionName);
            
            // 清空目标集合（可选，如果需要合并数据请注释掉）
            await targetCollection.deleteMany({});
            console.log(`   🗑️  已清空目标集合`);

            // 插入数据
            if (data.length > 0) {
                const result = await targetCollection.insertMany(data);
                console.log(`   ✅ 成功插入 ${result.insertedCount} 条数据`);
            }
        }

        console.log('\n✅ 数据迁移完成！');

    } catch (error) {
        console.error('❌ 迁移失败:', error.message);
        console.error(error.stack);
    } finally {
        if (sourceConn) await sourceConn.close();
        if (targetConn) await targetConn.close();
        console.log('\n🔌 数据库连接已关闭');
    }
}

// 检查是否需要 SSH 隧道
console.log('📋 数据迁移脚本');
console.log('================');
console.log('源数据库: 远程服务器 (139.180.215.236)');
console.log('目标数据库: 本地 (localhost:27017)');
console.log('');
console.log('⚠️  注意: 如果远程数据库需要通过 SSH 隧道访问，请确保:');
console.log('   1. SSH 隧道已建立');
console.log('   2. 远程 MongoDB 端口已转发到本地某个端口');
console.log('');
console.log('例如: ssh -L 27018:localhost:27017 user@139.180.215.236');
console.log('     然后将 SOURCE_URI 中的端口改为 27018');
console.log('');

migrateData();
