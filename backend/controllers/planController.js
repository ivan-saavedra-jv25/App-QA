const { Plan, TestCase } = require('../models');
const logger = require('../utils/logger');

class PlanController {
  // Obtener todos los planes
  static async getAllPlans(req, res) {
    try {
      const plans = await Plan.findAll({
        include: [{
          model: TestCase,
          as: 'testCases',
          attributes: ['id', 'status'],
        }],
        order: [['created_at', 'DESC']],
      });

      // Calcular progreso para cada plan
      const plansWithProgress = plans.map(plan => {
        const planData = plan.toJSON();
        const totalCases = planData.testCases.length;
        const completedCases = planData.testCases.filter(tc => tc.status !== 'PENDING').length;
        const progress = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
        
        return {
          ...planData,
          progress,
          totalCases,
          completedCases,
        };
      });

      res.json(plansWithProgress);
    } catch (error) {
      console.error('Error getting plans:', error);
      res.status(500).json({ message: 'Error getting plans' });
    }
  }

  // Obtener un plan por ID con sus test cases
  static async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const plan = await Plan.findByPk(id, {
        include: [{
          model: TestCase,
          as: 'testCases',
          order: [['created_at', 'ASC']],
        }],
      });

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Calcular progreso
      const planData = plan.toJSON();
      const totalCases = planData.testCases.length;
      const completedCases = planData.testCases.filter(tc => tc.status !== 'PENDING').length;
      const progress = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
      
      const planWithProgress = {
        ...planData,
        progress,
        totalCases,
        completedCases,
      };

      res.json(planWithProgress);
    } catch (error) {
      console.error('Error getting plan:', error);
      res.status(500).json({ message: 'Error getting plan' });
    }
  }

  // Crear un nuevo plan
  static async createPlan(req, res) {
    logger.log('=== INICIO CREATE PLAN ===');
    logger.log('Request URL:', req.originalUrl);
    logger.log('HTTP Method:', req.method);
    logger.log('Request Headers:', req.headers);
    logger.log('Request Body:', req.body);
    
    try {
      const { name, description, testCases } = req.body;

      logger.log('Datos extraídos:', {
        name,
        description,
        testCases
      });

      if (!name || name.trim() === '') {
        logger.log('Error: Nombre vacío');
        return res.status(400).json({ message: 'Name is required' });
      }

      // Crear el plan
      logger.log('Creando plan...');
      const plan = await Plan.create({
        name: name.trim(),
        description: description?.trim() || null,
      });

      logger.log('Plan creado:', plan.toJSON());

      // Si se proporcionan test cases, crearlos
      if (testCases && Array.isArray(testCases) && testCases.length > 0) {
        logger.log('Procesando test cases...');
        const validTestCases = testCases.filter(tc => tc.name && tc.name.trim() !== '');
        
        logger.log('Test cases válidos:', validTestCases);
        
        if (validTestCases.length > 0) {
          const createdTestCases = await Promise.all(
            validTestCases.map(tc => {
              logger.log('Creando test case:', tc);
              return TestCase.create({
                plan_id: plan.id,
                name: tc.name.trim(),
                description: tc.description?.trim() || null,
                validation_type: tc.validation_type || tc.type || null,
                priority: tc.priority || 'P2',
                status: 'PENDING',
              });
            })
          );
          
          logger.log('Test cases creados:', createdTestCases.map(tc => tc.toJSON()));
        }
      }

      logger.log('=== FIN CREATE PLAN ===');
      res.status(201).json(plan);
    } catch (error) {
      logger.error('Error en createPlan:', error);
      res.status(500).json({ message: 'Error creating plan' });
    }
  }

  // Actualizar un plan
  static async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const plan = await Plan.findByPk(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
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

      await plan.update(updateData);
      res.json(plan);
    } catch (error) {
      console.error('Error updating plan:', error);
      res.status(500).json({ message: 'Error updating plan' });
    }
  }

  // Eliminar un plan
  static async deletePlan(req, res) {
    try {
      const { id } = req.params;
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      await plan.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting plan:', error);
      res.status(500).json({ message: 'Error deleting plan' });
    }
  }

  // Método para actualizar el progreso de un plan
  static async updatePlanProgress(planId) {
    try {
      const plan = await Plan.findByPk(planId, {
        include: [{
          model: TestCase,
          as: 'testCases',
          attributes: ['status'],
        }],
      });

      if (!plan) return;

      const totalCases = plan.testCases.length;
      const completedCases = plan.testCases.filter(tc => tc.status !== 'PENDING').length;
      const progress = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

      // Actualizar estado del plan basado en el progreso
      let newStatus = plan.status;
      if (progress === 100 && totalCases > 0) {
        newStatus = 'COMPLETED';
      } else if (progress > 0 && plan.status === 'PENDING') {
        newStatus = 'IN_PROGRESS';
      } else if (progress > 0 && plan.status === 'COMPLETED') {
        newStatus = 'IN_PROGRESS';
      }

      if (newStatus !== plan.status) {
        await plan.update({ status: newStatus });
      }
    } catch (error) {
      console.error('Error updating plan progress:', error);
    }
  }
}

module.exports = PlanController;
