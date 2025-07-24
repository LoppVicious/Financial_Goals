import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useGoal, useDeleteGoal } from '../../hooks/useGoals';
import { useContributions, useCreateContribution } from '../../hooks/useContributions';
import LineChart from '../../components/ui/LineChart';
import ProgressBar from '../../components/ui/ProgressBar';
import { formatCurrency, calculateProgress, inflationAdjust, futureValueAnnuity, requiredPayment } from '../../utils/formulas';
import { formatDate } from '../../utils/dates';

const contributionSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  contribution_date: z.string().min(1, 'La fecha es obligatoria'),
  type: z.enum(['monthly', 'extra', 'initial']),
  notes: z.string().optional(),
});

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: goal, isLoading: goalLoading } = useGoal(id);
  const { data: contributions = [], isLoading: contributionsLoading } = useContributions(id);
  const createContribution = useCreateContribution();
  const deleteGoal = useDeleteGoal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      type: 'extra',
      contribution_date: new Date().toISOString().split('T')[0],
    },
  });

  if (goalLoading || contributionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Meta no encontrada</p>
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

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
    requiredPayment(inflationAdjustedTarget, goal.return_rate, monthsRemaining, currentValue) : 0;

  // Generate projection data for chart
  const generateProjectionData = () => {
    const data = [];
    const monthsToProject = Math.min(monthsRemaining, 120); // Max 10 years
    let projectedValue = currentValue;
    
    for (let month = 1; month <= monthsToProject; month++) {
      const monthlyRate = goal.return_rate / 12;
      projectedValue = projectedValue * (1 + monthlyRate) + goal.monthly_contribution;
      
      const targetAtMonth = inflationAdjust(
        goal.target_amount, 
        goal.inflation_rate, 
        month / 12
      );
      
      data.push({
        month,
        value: projectedValue,
        target: targetAtMonth,
      });
    }
    
    return data;
  };

  const projectionData = generateProjectionData();

  const onSubmitContribution = async (data) => {
    try {
      await createContribution.mutateAsync({
        goalId: id,
        ...data,
        amount: Number(data.amount),
      });
      
      reset();
      setShowAddContribution(false);
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await deleteGoal.mutateAsync(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{goal.name}</h1>
            <p className="text-gray-600 capitalize">{goal.type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Objetivo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(inflationAdjustedTarget)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progreso</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress.toFixed(0)}%
              </p>
            </div>
            <div className="w-8 h-8">
              <ProgressBar progress={progress} showPercentage={false} size="sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aporte Requerido</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(requiredMonthly)}/mes
              </p>
            </div>
            <Calculator className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progreso General</h3>
          {goal.target_date && (
            <span className="text-sm text-gray-600">
              Meta: {formatDate(goal.target_date)}
            </span>
          )}
        </div>
        
        <ProgressBar 
          progress={progress} 
          size="lg"
          color={progress >= 100 ? 'green' : progress >= 75 ? 'blue' : progress >= 50 ? 'yellow' : 'red'}
        />
        
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{formatCurrency(currentValue)}</span>
          <span>{formatCurrency(inflationAdjustedTarget)}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyección</h3>
        <LineChart 
          data={projectionData}
          height={400}
          lines={[
            { key: 'value', color: '#3B82F6', name: 'Valor Proyectado' },
            { key: 'target', color: '#EF4444', name: 'Objetivo Ajustado' },
          ]}
        />
      </div>

      {/* Contributions Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Aportes</h3>
          <button
            onClick={() => setShowAddContribution(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Aporte
          </button>
        </div>

        {/* Add Contribution Form */}
        {showAddContribution && (
          <form onSubmit={handleSubmit(onSubmitContribution)} className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  {...register('contribution_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.contribution_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.contribution_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="extra">Aporte Extra</option>
                  <option value="monthly">Aporte Mensual</option>
                  <option value="initial">Aporte Inicial</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContribution(false);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <input
                {...register('notes')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del aporte..."
              />
            </div>
          </form>
        )}

        {/* Contributions List */}
        {contributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aún no has registrado aportes</p>
            <p className="text-sm">Añade tu primer aporte para comenzar el seguimiento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Notas</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr key={contribution.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">
                      {formatDate(contribution.contribution_date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(contribution.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        contribution.type === 'initial' ? 'bg-blue-100 text-blue-800' :
                        contribution.type === 'monthly' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {contribution.type === 'initial' ? 'Inicial' :
                         contribution.type === 'monthly' ? 'Mensual' : 'Extra'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {contribution.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar meta?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los aportes asociados.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteGoal}
                disabled={deleteGoal.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteGoal.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetail;