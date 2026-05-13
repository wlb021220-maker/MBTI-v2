const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const auth = require('../middleware/auth');

// 提交测试结果
router.post('/submit-test', resultController.submitTest);

// 需要认证的路由
router.get('/admin/results', auth, resultController.getResults);
router.get('/admin/results/:id', auth, resultController.getResultDetail);
router.get('/admin/statistics', auth, resultController.getStatistics);
router.get('/admin/export/csv', auth, resultController.exportCSV);
router.post('/admin/results/upload', auth, resultController.uploadTestData);
router.post('/admin/results/import', auth, resultController.uploadJsonFile);

// 将所有批量操作路由放在单条操作路由之前，避免路由冲突
router.delete('/admin/results/batch-delete', auth, resultController.batchDeleteResults);
router.put('/admin/results/batch-update-status', auth, resultController.batchUpdateStatus);
router.post('/admin/results/batch-push-wecom', auth, resultController.batchPushToWeCom);

// 单条操作路由（必须放在批量路由之后）
router.put('/admin/results/:id/status', auth, resultController.updateStatus);
router.put('/admin/results/:id/english-name', auth, resultController.updateEnglishName);
router.put('/admin/results/:id/candidate-type', auth, resultController.updateCandidateType);
router.post('/admin/results/:id/push-wecom', auth, resultController.pushToWeComManual);
router.delete('/admin/results/:id', auth, resultController.deleteResult);

module.exports = router;