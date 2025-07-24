const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

class Contribution {
  static async create(contributionData) {
    const id = uuidv4();
    const contribution = {
      id,
      ...contributionData,
      created_at: new Date()
    };
    
    const [createdContribution] = await db('contributions')
      .insert(contribution)
      .returning('*');
    
    return createdContribution;
  }

  static async findById(id) {
    return await db('contributions')
      .where({ id })
      .first();
  }

  static async findByGoalId(goalId) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .orderBy('contribution_date', 'desc');
  }

  static async update(id, updates) {
    const [contribution] = await db('contributions')
      .where({ id })
      .update(updates)
      .returning('*');
    
    return contribution;
  }

  static async delete(id) {
    return await db('contributions')
      .where({ id })
      .del();
  }

  static async getTotalByGoalId(goalId) {
    const result = await db('contributions')
      .where({ goal_id: goalId })
      .sum('amount as total')
      .first();
    
    return parseFloat(result.total) || 0;
  }

  static async getContributionStats(goalId) {
    const stats = await db('contributions')
      .where({ goal_id: goalId })
      .select([
        db.raw('COUNT(*) as total_contributions'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('AVG(amount) as avg_amount'),
        db.raw('MIN(amount) as min_amount'),
        db.raw('MAX(amount) as max_amount'),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as monthly_contributions', ['monthly']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as extra_contributions', ['extra']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as initial_contributions', ['initial'])
      ])
      .first();
    
    return stats;
  }

  static async getContributionsByDateRange(goalId, startDate, endDate) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .andWhere('contribution_date', '>=', startDate)
      .andWhere('contribution_date', '<=', endDate)
      .orderBy('contribution_date', 'desc');
  }

  static async getContributionsByType(goalId, type) {
    return await db('contributions')
      .where({ goal_id: goalId, type })
      .orderBy('contribution_date', 'desc');
  }

  static async getMonthlyContributionSummary(goalId, year) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .whereRaw('EXTRACT(year FROM contribution_date) = ?', [year])
      .select([
        db.raw('EXTRACT(month FROM contribution_date) as month'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('COUNT(*) as contribution_count')
      ])
      .groupBy(db.raw('EXTRACT(month FROM contribution_date)'))
      .orderBy('month');
  }

  static async getRecentContributions(goalId, limit = 10) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .orderBy('contribution_date', 'desc')
      .limit(limit);
  }

  static async bulkCreate(contributions) {
    const contributionsWithIds = contributions.map(contribution => ({
      id: uuidv4(),
      ...contribution,
      created_at: new Date()
    }));

    return await db('contributions')
      .insert(contributionsWithIds)
      .returning('*');
  }

  static async deleteByGoalId(goalId) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .del();
  }

  static async getContributionHistory(goalId) {
    const contributions = await db('contributions')
      .where({ goal_id: goalId })
      .orderBy('contribution_date', 'asc');

    // Calculate running total
    let runningTotal = 0;
    return contributions.map(contribution => {
      runningTotal += parseFloat(contribution.amount);
      return {
        ...contribution,
        running_total: runningTotal
      };
    });
  }

  static async getContributionTrend(goalId, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await db('contributions')
      .where({ goal_id: goalId })
      .andWhere('contribution_date', '>=', startDate)
      .select([
        db.raw('DATE_TRUNC(\'month\', contribution_date) as month'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('COUNT(*) as contribution_count')
      ])
      .groupBy(db.raw('DATE_TRUNC(\'month\', contribution_date)'))
      .orderBy('month');
  }

  static async findLargestContribution(goalId) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .orderBy('amount', 'desc')
      .first();
  }

  static async findSmallestContribution(goalId) {
    return await db('contributions')
      .where({ goal_id: goalId })
      .orderBy('amount', 'asc')
      .first();
  }
}

module.exports = Contribution;