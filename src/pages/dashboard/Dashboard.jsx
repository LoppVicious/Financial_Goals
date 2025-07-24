import React from 'react';
import { Link } from 'react-router-dom';
import { useGoals } from '../../hooks/useGoals';
import { useContributions } from '../../hooks/useContributions';
import GoalCard from '../../components/ui/GoalCard';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatCurrency, calculateProgress, inflationAdjust } from '../../utils/formulas';

const Dashboard = () => {
  const { data: goals = [], isLoading: goalsLoading } = useGoals();

  // Calculate dashboard statistics
  const calculateStats = () => {
    if (!goals.length) {
      return {
        totalGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        averageProgress: 0,
        goalsOnTrack: 0,
      };
    }

    let totalTargetAmount = 0;
    let totalCurrentAmount = 0;
    let totalProgress = 0;
    let goalsOnTrack = 0;

    goals.forEach(goal => {
      // Calculate years to target
      const yearsToTarget = goal.target_years || 
        (goal.target_date ? 
          Math.max(0, (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 365.25)) : 
          0);
      
      // Adjust target for inflation
      const inflationAdjustedTarget = inflationAdjust(
        goal.target_amount, 
        goal.inflation_rate, 
        yearsToTarget
      );

      totalTargetAmount += inflationAdjustedTarget;

      // For now, we'll use monthly_contribution * months as current amount
      // In a real app, this would come from actual contributions
      const monthsElapsed = 6; // Placeholder
      const currentAmount = goal.monthly_contribution * monthsElapsed;
      totalCurrentAmount += currentAmount;

      const progress = calculateProgress(currentAmount, inflationAdjustedTarget);
      totalProgress += progress;

      // Consider "on track" if progress is reasonable for time elapsed
      if (progress >= 50 || goal.monthly_contribution >= (inflationAdjustedTarget / (yearsToTarget * 12)) * 0.9) {
        goalsOnTrack++;
      }
    });

    return {
      totalGoals: goals.length,
      totalTargetAmount,
      totalCurrentAmount,
      averageProgress: totalProgress / goals.length,
      goalsOnTrack,
    };
  };

  const stats = calculateStats();

  if (goalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen de tus metas financieras
          </p>
        </div>
        
        <Link
          to="/goals/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Meta
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Metas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Objetivo Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalTargetAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageProgress.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Línea</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.goalsOnTrack}/{stats.totalGoals}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Tus Metas</h2>
          {goals.length > 0 && (
            <Link
              to="/goals/create"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Añadir meta
            </Link>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aún no tienes metas
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera meta para empezar a planificar tu futuro financiero.
              </p>
              
              <Link
                to="/goals/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear primera meta
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal}
                contributions={[]} // We'll implement this when we have the contributions hook working
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/goals/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Nueva Meta</p>
                <p className="text-sm text-gray-600">Añadir objetivo financiero</p>
              </div>
            </Link>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Añadir Aporte</p>
                <p className="text-sm text-gray-600">Registrar contribución</p>
              </div>
            </button>

            <Link
              to="/help"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Ver Ayuda</p>
                <p className="text-sm text-gray-600">Guías y fórmulas</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;