const { Plan, TestCase } = require('../models');

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
    try {
      const { name, description, testCases } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Crear el plan
      const plan = await Plan.create({
        name: name.trim(),
        description: description?.trim() || null,
      });

      // Si se proporcionan test cases, crearlos
      if (testCases && Array.isArray(testCases) && testCases.length > 0) {
        const validTestCases = testCases.filter(tc => tc.name && tc.name.trim() !== '');
        
        if (validTestCases.length > 0) {
          await Promise.all(
            validTestCases.map(tc => 
              TestCase.create({
                plan_id: plan.id,
                name: tc.name.trim(),
                description: tc.description?.trim() || null,
              })
            )
          );
        }
      }

      // Obtener el plan completo con sus test cases
      const createdPlan = await Plan.findByPk(plan.id, {
        include: [{
          model: TestCase,
          as: 'testCases',
          order: [['created_at', 'ASC']],
        }],
      });

      // Calcular progreso
      const planData = createdPlan.toJSON();
      const totalCases = planData.testCases.length;
      const completedCases = planData.testCases.filter(tc => tc.status !== 'PENDING').length;
      const progress = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
      
      const planWithProgress = {
        ...planData,
        progress,
        totalCases,
        completedCases,
      };

      res.status(201).json(planWithProgress);
    } catch (error) {
      console.error('Error creating plan:', error);
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
