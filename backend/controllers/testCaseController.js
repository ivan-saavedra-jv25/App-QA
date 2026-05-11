const { TestCase, Plan, TestCaseExample } = require('../models');
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
        }, {
          model: TestCaseExample,
          as: 'examples',
          order: [['created_at', 'ASC']],
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

  // Obtener ejemplos de un test case
  static async getExamplesByTestCase(req, res) {
    try {
      const { id } = req.params;
      const examples = await TestCaseExample.findAll({
        where: { test_case_id: id },
        order: [['created_at', 'ASC']],
      });

      res.json(examples);
    } catch (error) {
      console.error('Error getting test case examples:', error);
      res.status(500).json({ message: 'Error getting test case examples' });
    }
  }

  // Crear ejemplo para un test case
  static async createExample(req, res) {
    try {
      const { id } = req.params;
      const { example_type, input_json } = req.body;

      if (!example_type || !['TEXT', 'IMAGE_URL', 'FILE_SET'].includes(example_type)) {
        return res.status(400).json({ message: 'Invalid example_type. Must be TEXT, IMAGE_URL, or FILE_SET' });
      }

      if (input_json === undefined || input_json === null) {
        return res.status(400).json({ message: 'input_json is required' });
      }

      const testCase = await TestCase.findByPk(id);
      if (!testCase) {
        return res.status(404).json({ message: 'Test case not found' });
      }

      const example = await TestCaseExample.create({
        test_case_id: id,
        example_type,
        input_json,
      });

      res.status(201).json(example);
    } catch (error) {
      console.error('Error creating test case example:', error);
      res.status(500).json({ message: 'Error creating test case example' });
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
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "passed" THEN 1 END')), 'passed'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "failed" THEN 1 END')), 'failed'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "pending" THEN 1 END')), 'pending'],
        ],
        raw: true,
      });

      res.json(stats[0]);
    } catch (error) {
      console.error('Error getting plan stats:', error);
      res.status(500).json({ message: 'Error getting plan stats' });
    }
  }

  // Exportar prompt para IA
  static async exportPrompt(req, res) {
    try {
      logger.info('Exportando prompt para IA');
      
      // Leer el prompt desde archivo
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '..', 'prompt.txt');
      
      let prompt;
      try {
        prompt = fs.readFileSync(promptPath, 'utf8');
        logger.info('Prompt leído desde archivo exitosamente');
        logger.info('Tamaño del prompt:', prompt.length, 'caracteres');
      } catch (fileError) {
        logger.error('Error leyendo archivo prompt.txt:', fileError);
        logger.error('Ruta del archivo:', promptPath);
        logger.error('¿Existe el archivo?', fs.existsSync(promptPath));
        
        // Fallback a prompt hardcoded si el archivo no existe
        prompt = ``;
        logger.info('Usando prompt fallback');
      }
      
      // Configurar headers para descarga de archivo
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="prompt.txt"');
      
      logger.info('Enviando prompt al cliente');
      res.send(prompt);
      logger.info('Prompt enviado exitosamente');
    } catch (error) {
      logger.error('Error exportando prompt:', error);
      logger.error('Stack trace:', error.stack);
      res.status(500).json({ message: 'Error exportando prompt', error: error.message });
    }
  }
}

module.exports = TestCaseController;
