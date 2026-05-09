const mongoose = require('mongoose');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 配置
const SSH_HOST = '139.180.215.236';
const SSH_PORT = 22;
const REMOTE_MONGO_PORT = 27017;
const LOCAL_TUNNEL_PORT = 27018; // 本地转发端口
const DB_NAME = 'mbti_test';

// 目标数据库（本地）
const TARGET_URI = 'mongodb://localhost:27017/mbti_test';

async function setupSSHTunnel() {
    console.log('🔌 正在建立 SSH 隧道...');
    console.log(`   ${SSH_HOST}:${REMOTE_MONGO_PORT} → localhost:${LOCAL_TUNNEL_PORT}`);
    
    // 使用 ssh 命令建立隧道
    const sshCommand = `ssh -f -N -L ${LOCAL_TUNNEL_PORT}:localhost:${REMOTE_MONGO_PORT} ${SSH_HOST} -p ${SSH_PORT}`;
    
    try {
        await execPromise(sshCommand);
        console.log('✅ SSH 隧道建立成功');
        
        // 等待隧道建立
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
    } catch (error) {
        console.error('❌ SSH 隧道建立失败:', error.message);
        console.log('\n💡 提示: 请确保:');
        console.log('   1. 已安装 SSH 客户端');
        console.log('   2. 已配置 SSH 密钥或知道密码');
        console.log('   3. 可以访问远程服务器');
        return false;
    }
}

async function closeSSHTunnel() {
    try {
        await execPromise(`taskkill /F /IM ssh.exe`);
        console.log('🔌 SSH 隧道已关闭');
    } catch (error) {
        // 忽略错误
    }
}

async function migrateData() {
    const sourceUri = `mongodb://localhost:${LOCAL_TUNNEL_PORT}/${DB_NAME}`;
    let sourceConn, targetConn;
    
    try {
        console.log('\n🔄 正在连接源数据库...');
        console.log(`   ${sourceUri}`);
        sourceConn = await mongoose.createConnection(sourceUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ 源数据库连接成功');

        console.log('🔄 正在连接目标数据库...');
        targetConn = await mongoose.createConnection(TARGET_URI);
        console.log('✅ 目标数据库连接成功');

        const sourceDb = sourceConn.db;
        const targetDb = targetConn.db;

        // 要迁移的集合列表
        const collections = ['results', 'users'];
        let totalMigrated = 0;

        for (const collectionName of collections) {
            console.log(`\n📦 正在迁移集合: ${collectionName}`);
            
            const sourceCollection = sourceDb.collection(collectionName);
            const data = await sourceCollection.find({}).toArray();
            
            console.log(`   源集合中有 ${data.length} 条数据`);
            
            if (data.length === 0) {
                console.log(`   ⏭️  跳过空集合`);
                continue;
            }

            const targetCollection = targetDb.collection(collectionName);
            
            // 清空目标集合
            const deleteResult = await targetCollection.deleteMany({});
            console.log(`   🗑️  已清空目标集合 (${deleteResult.deletedCount} 条)`);

            // 插入数据
            const result = await targetCollection.insertMany(data);
            console.log(`   ✅ 成功插入 ${result.insertedCount} 条数据`);
            totalMigrated += result.insertedCount;
        }

        console.log('\n✅ 数据迁移完成！');
        console.log(`   总共迁移 ${totalMigrated} 条数据`);

    } catch (error) {
        console.error('❌ 迁移失败:', error.message);
        throw error;
    } finally {
        if (sourceConn) await sourceConn.close();
        if (targetConn) await targetConn.close();
        console.log('\n🔌 数据库连接已关闭');
    }
}

async function main() {
    console.log('📋 数据迁移工具');
    console.log('================');
    console.log(`源数据库: ${SSH_HOST}:${REMOTE_MONGO_PORT}/${DB_NAME}`);
    console.log(`目标数据库: localhost:27017/${DB_NAME}`);
    console.log('');

    // 建立 SSH 隧道
    const tunnelReady = await setupSSHTunnel();
    if (!tunnelReady) {
        console.log('\n⚠️  请手动建立 SSH 隧道后再运行此脚本:');
        console.log(`   ssh -L ${LOCAL_TUNNEL_PORT}:localhost:${REMOTE_MONGO_PORT} ${SSH_HOST}`);
        process.exit(1);
    }

    try {
        // 执行迁移
        await migrateData();
    } catch (error) {
        console.error('\n❌ 迁移过程出错');
    } finally {
        // 关闭 SSH 隧道
        await closeSSHTunnel();
    }
}

main();
