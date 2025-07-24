import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Plane, 
  Car, 
  Palmtree, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import { formatCurrency, calculateProgress, inflationAdjust } from '../../utils/formulas';
import { formatDate } from '../../utils/dates';

const GoalCard = ({ goal, contributions = [] }) => {
  const getGoalIcon = (type) => {
    const icons = {
      casa: Home,
      viaje: Plane,
      coche: Car,
      jubilacion: Palmtree,
      otro: Target,
    };
    
    const Icon = icons[type] || Target;
    return <Icon className="h-6 w-6" />;
  };

  const getGoalTypeLabel = (type) => {
    const labels = {
      casa: 'Casa',
      viaje: 'Viaje',
      coche: 'Coche',
      jubilacion: 'Jubilación',
      otro: 'Otro',
    };
    
    return labels[type] || 'Objetivo';
  };

  // Calculate current value from contributions
  const currentValue = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  
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
  
  // Calculate progress
  const progress = calculateProgress(currentValue, inflationAdjustedTarget);
  
  // Calculate required monthly contribution
  const monthsRemaining = yearsToTarget * 12;
  const requiredMonthly = monthsRemaining > 0 ? 
    Math.max(0, (inflationAdjustedTarget - currentValue) / monthsRemaining) : 0;
  
  // Determine status
  const getStatus = () => {
    if (progress >= 100) {
      return { text: '¡Meta alcanzada!', color: 'green', icon: TrendingUp };
    }
    
    if (goal.monthly_contribution >= requiredMonthly * 0.95) {
      return { text: 'En línea', color: 'green', icon: TrendingUp };
    }
    
    if (goal.monthly_contribution >= requiredMonthly * 0.8) {
      return { text: 'Cerca del objetivo', color: 'yellow', icon: Minus };
    }
    
    const deficit = requiredMonthly - goal.monthly_contribution;
    return { 
      text: `Necesitas +${formatCurrency(deficit)}/mes`, 
      color: 'red', 
      icon: TrendingDown 
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Link 
      to={`/goals/${goal.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {getGoalIcon(goal.type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {goal.name}
              </h3>
              <p className="text-sm text-gray-500">
                {getGoalTypeLabel(goal.type)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentValue)}
            </p>
            <p className="text-sm text-gray-500">
              de {formatCurrency(inflationAdjustedTarget)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar 
            progress={progress} 
            color={status.color}
            showPercentage={false}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">
              {progress.toFixed(0)}% completado
            </span>
            {goal.target_date && (
              <span className="text-sm text-gray-500">
                {formatDate(goal.target_date)}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            status.color === 'green' ? 'bg-green-50 text-green-700' :
            status.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            <StatusIcon className="h-4 w-4" />
            <span>{status.text}</span>
          </div>
          
          {goal.monthly_contribution > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Aporte mensual</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(goal.monthly_contribution)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GoalCard;