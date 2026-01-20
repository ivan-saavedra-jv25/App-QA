const express = require('express');
const TestCaseController = require('../controllers/testCaseController');

const router = express.Router();

// Exportar prompt para IA (DEBE ir antes de /:id)
router.get('/export-prompt', TestCaseController.exportPrompt);

// Obtener todos los test cases de un plan
router.get('/plan/:planId', TestCaseController.getTestCasesByPlan);

// Obtener estadísticas de un plan
router.get('/plan/:planId/stats', TestCaseController.getPlanStats);

// Obtener un test case por ID
router.get('/:id', TestCaseController.getTestCaseById);

// Crear un nuevo test case en un plan
router.post('/plan/:planId', TestCaseController.createTestCase);

// Actualizar un test case
router.put('/:id', TestCaseController.updateTestCase);

// Actualizar solo el estado de un test case
router.patch('/:id/status', TestCaseController.updateTestCaseStatus);

// Eliminar un test case
router.delete('/:id', TestCaseController.deleteTestCase);

module.exports = router;
