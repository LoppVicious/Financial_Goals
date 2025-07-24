const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

class Goal {
  static async create(goalData) {
    const id = uuidv4();
    const goal = {
      id,
      ...goalData,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [createdGoal] = await db('goals')
      .insert(goal)
      .returning('*');
    
    return createdGoal;
  }

  static async findById(id) {
    return await db('goals')
      .where({ id, is_active: true })
      .first();
  }

  static async findByUserId(userId) {
    return await db('goals')
      .where({ user_id: userId, is_active: true })
      .orderBy('created_at', 'desc');
  }

  static async update(id, updates) {
    const updatedData = {
      ...updates,
      updated_at: new Date()
    };

    const [goal] = await db('goals')
      .where({ id })
      .update(updatedData)
      .returning('*');
    
    return goal;
  }

  static async delete(id) {
    // Soft delete by setting is_active to false
    return await db('goals')
      .where({ id })
      .update({
        is_active: false,
        updated_at: new Date()
      });
  }

  static async hardDelete(id) {
    // Hard delete - removes the record completely
    return await db('goals')
      .where({ id })
      .del();
  }

  static async findByUserIdAndType(userId, type) {
    return await db('goals')
      .where({ user_id: userId, type, is_active: true })
      .orderBy('created_at', 'desc');
  }

  static async getGoalStats(userId) {
    const stats = await db('goals')
      .where({ user_id: userId, is_active: true })
      .select([
        db.raw('COUNT(*) as total_goals'),
        db.raw('SUM(target_amount) as total_target_amount'),
        db.raw('AVG(target_amount) as avg_target_amount'),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as casa_goals', ['casa']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as viaje_goals', ['viaje']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as coche_goals', ['coche']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as jubilacion_goals', ['jubilacion']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as otro_goals', ['otro'])
      ])
      .first();
    
    return stats;
  }

  static async getGoalWithContributions(id) {
    const goal = await this.findById(id);
    if (!goal) return null;

    const contributions = await db('contributions')
      .where({ goal_id: id })
      .orderBy('contribution_date', 'desc');

    return {
      ...goal,
      contributions
    };
  }

  static async updateProgress(id, currentAmount) {
    // This method can be used to cache calculated progress
    // For now, we'll just update the updated_at timestamp
    return await db('goals')
      .where({ id })
      .update({
        updated_at: new Date()
      });
  }

  static async findGoalsNearTarget(userId, threshold = 0.9) {
    // This would require joining with contributions to calculate current amounts
    // For now, return goals that are close to their target date
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    return await db('goals')
      .where({ user_id: userId, is_active: true })
      .andWhere('target_date', '<=', oneMonthFromNow)
      .orderBy('target_date', 'asc');
  }

  static async findOverdueGoals(userId) {
    const today = new Date();
    
    return await db('goals')
      .where({ user_id: userId, is_active: true })
      .andWhere('target_date', '<', today)
      .orderBy('target_date', 'asc');
  }

  static async searchGoals(userId, searchTerm) {
    return await db('goals')
      .where({ user_id: userId, is_active: true })
      .andWhere(function() {
        this.where('name', 'like', `%${searchTerm}%`)
            .orWhere('type', 'like', `%${searchTerm}%`);
      })
      .orderBy('created_at', 'desc');
  }

  static async getGoalsByDateRange(userId, startDate, endDate) {
    return await db('goals')
      .where({ user_id: userId, is_active: true })
      .andWhere('target_date', '>=', startDate)
      .andWhere('target_date', '<=', endDate)
      .orderBy('target_date', 'asc');
  }
}

module.exports = Goal;