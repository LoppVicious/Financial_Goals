const goalRepo = require('../repositories/goalRepo');

exports.createGoal = async (userId, data) => {
  const newGoal = await goalRepo.insert({
    userId,
    currentAmount: 0,
    ...data,
  });
  return newGoal;
};

exports.listGoals = async (userId) => {
  const rows = await goalRepo.findByUser(userId);
  return rows.map(goal => {
    const progressPercent = goal.currentAmount / goal.targetAmount * 100;
    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      adjustedTarget: goal.targetAmount,
      progressPercent: Math.round(progressPercent),
    };
  });
};
