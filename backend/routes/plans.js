const express = require('express');
const PlanController = require('../controllers/planController');

const router = express.Router();

// Obtener todos los planes
router.get('/', PlanController.getAllPlans);

// Obtener un plan por ID
router.get('/:id', PlanController.getPlanById);

// Crear un nuevo plan
router.post('/', PlanController.createPlan);

// Actualizar un plan
router.put('/:id', PlanController.updatePlan);

// Eliminar un plan
router.delete('/:id', PlanController.deletePlan);

module.exports = router;
