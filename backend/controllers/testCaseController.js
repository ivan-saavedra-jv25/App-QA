const { TestCase, Plan } = require('../models');
const logger = require('../utils/logger');

class TestCaseController {
  // Obtener todos los test cases de un plan
  static async getTestCasesByPlan(req, res) {
    try {
      const { planId } = req.params;
      const testCases = await TestCase.findAll({
        where: { plan_id: planId },
        order: [['created_at', 'ASC']],
      });

      res.json(testCases);
    } catch (error) {
      console.error('Error getting test cases:', error);
      res.status(500).json({ message: 'Error getting test cases' });
    }
  }

  // Obtener un test case por ID
  static async getTestCaseById(req, res) {
    try {
      const { id } = req.params;
      const testCase = await TestCase.findByPk(id, {
        include: [{
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name'],
        }],
      });

      if (!testCase) {
        return res.status(404).json({ message: 'Test case not found' });
      }

      res.json(testCase);
    } catch (error) {
      console.error('Error getting test case:', error);
      res.status(500).json({ message: 'Error getting test case' });
    }
  }

  // Crear un nuevo test case
  static async createTestCase(req, res) {
    logger.log('=== INICIO CREATE TEST CASE ===');
    logger.log('Request URL:', req.originalUrl);
    logger.log('HTTP Method:', req.method);
    logger.log('Request Headers:', req.headers);
    logger.log('Request Params:', req.params);
    logger.log('Request Body:', req.body);
    
    try {
      const { planId } = req.params;
      const { name, description, validationType, priority } = req.body;



      // Verificar que el plan existe
      logger.log('Verificando existencia del plan...');
      const plan = await Plan.findByPk(planId);
      
      if (!plan) {
        logger.log('Plan no encontrado:', planId);
        return res.status(404).json({ message: 'Plan not found' });
      }
      
      logger.log('Plan encontrado:', plan.toJSON());

      if (!name || name.trim() === '') {
        logger.log('Error: Nombre vacío');
        return res.status(400).json({ message: 'Name is required' });
      }

      if (priority && !['P1', 'P2', 'P3'].includes(priority)) {
        logger.log('Error: Prioridad inválida:', priority);
        return res.status(400).json({ message: 'Invalid priority. Must be P1, P2, or P3' });
      }

      logger.log('Creando TestCase con datos:', {
        plan_id: planId,
        name: name.trim(),
        description: description?.trim() || null,
        validation_type: validationType?.trim() || null,
        priority: priority || 'P2'
      });

      const testCase = await TestCase.create({
        plan_id: planId,
        name: name.trim(),
        description: description?.trim() || null,
        validation_type: validationType?.trim() || null,
        priority: priority || 'P2',
      });

      logger.log('TestCase creado exitosamente:', testCase.toJSON());
      logger.log('=== FIN CREATE TEST CASE ===');

      // El hook afterCreate actualizará automáticamente el estado del plan
      res.status(201).json(testCase);
    } catch (error) {
      logger.error('Error en createTestCase:', error);
      res.status(500).json({ message: 'Error creating test case' });
    }
  }

  // Actualizar un test case
  static async updateTestCase(req, res) {
    try {
      const { id } = req.params;
      const { name, description, validationType, priority, status } = req.body;

      const testCase = await TestCase.findByPk(id);
      if (!testCase) {
        return res.status(404).json({ message: 'Test case not found' });
      }

      const updateData = {};
      if (name !== undefined) {
        if (!name || name.trim() === '') {
          return res.status(400).json({ message: 'Name is required' });
        }
        updateData.name = name.trim();
      }
      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }
      if (validationType !== undefined) {
        updateData.validation_type = validationType?.trim() || null;
      }
      if (priority !== undefined) {
        if (!['P1', 'P2', 'P3'].includes(priority)) {
          return res.status(400).json({ message: 'Invalid priority. Must be P1, P2, or P3' });
        }
        updateData.priority = priority;
      }
      if (status !== undefined) {
        if (!['PENDING', 'PASSED', 'FAILED', 'NA'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        updateData.status = status;
      }

      await testCase.update(updateData);
      // El hook afterUpdate actualizará automáticamente el progreso del plan

      res.json(testCase);
    } catch (error) {
      console.error('Error updating test case:', error);
      res.status(500).json({ message: 'Error updating test case' });
    }
  }

  // Actualizar solo el estado de un test case
  static async updateTestCaseStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['PENDING', 'PASSED', 'FAILED', 'NA'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const testCase = await TestCase.findByPk(id);
      if (!testCase) {
        return res.status(404).json({ message: 'Test case not found' });
      }

      await testCase.update({ status });
      // El hook afterUpdate actualizará automáticamente el progreso del plan

      res.json(testCase);
    } catch (error) {
      console.error('Error updating test case status:', error);
      res.status(500).json({ message: 'Error updating test case status' });
    }
  }

  // Eliminar un test case
  static async deleteTestCase(req, res) {
    try {
      const { id } = req.params;
      const testCase = await TestCase.findByPk(id);

      if (!testCase) {
        return res.status(404).json({ message: 'Test case not found' });
      }

      const planId = testCase.plan_id;
      await testCase.destroy();

      // Actualizar el progreso del plan después de eliminar
      const { PlanController } = require('./planController');
      await PlanController.updatePlanProgress(planId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting test case:', error);
      res.status(500).json({ message: 'Error deleting test case' });
    }
  }

  // Obtener estadísticas de un plan
  static async getPlanStats(req, res) {
    try {
      const { planId } = req.params;
      
      const stats = await TestCase.findAll({
        where: { plan_id: planId },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true,
      });

      const result = {
        PENDING: 0,
        PASSED: 0,
        FAILED: 0,
        NA: 0,
      };

      stats.forEach(stat => {
        result[stat.status] = parseInt(stat.count);
      });

      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      const completed = total - result.PENDING;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      res.json({
        ...result,
        total,
        completed,
        progress,
      });
    } catch (error) {
      console.error('Error getting plan stats:', error);
      res.status(500).json({ message: 'Error getting plan stats' });
    }
  }
}

module.exports = TestCaseController;
