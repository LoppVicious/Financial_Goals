import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Plane, 
  Car, 
  Palmtree, 
  Target,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import { useCreateGoal } from '../../hooks/useGoals';
import { formatCurrency } from '../../utils/formulas';
import { addYears, formatDateForInput } from '../../utils/dates';

const goalSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  type: z.enum(['casa', 'viaje', 'coche', 'jubilacion', 'otro']),
  target_amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  target_date: z.string().optional(),
  target_years: z.number().min(0.1, 'Debe ser al menos 0.1 años').optional(),
  monthly_contribution: z.number().min(0, 'El aporte no puede ser negativo').optional(),
  inflation_rate: z.number().min(0).max(0.2, 'La inflación debe estar entre 0% y 20%'),
  return_rate: z.number().min(0).max(0.3, 'La rentabilidad debe estar entre 0% y 30%'),
});

const GoalWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const createGoal = useCreateGoal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      inflation_rate: 0.02,
      return_rate: 0.05,
      monthly_contribution: 0,
    },
  });

  const watchedValues = watch();

  const goalTypes = [
    { id: 'casa', label: 'Casa', icon: Home, color: 'bg-blue-500' },
    { id: 'viaje', label: 'Viaje', icon: Plane, color: 'bg-green-500' },
    { id: 'coche', label: 'Coche', icon: Car, color: 'bg-red-500' },
    { id: 'jubilacion', label: 'Jubilación', icon: Palmtree, color: 'bg-yellow-500' },
    { id: 'otro', label: 'Otro', icon: Target, color: 'bg-purple-500' },
  ];

  const steps = [
    { number: 1, title: 'Tipo de Meta', description: 'Selecciona qué quieres lograr' },
    { number: 2, title: 'Objetivo', description: '¿Cuánto necesitas ahorrar?' },
    { number: 3, title: 'Plazo', description: '¿Para cuándo lo necesitas?' },
    { number: 4, title: 'Aporte', description: '¿Cuánto puedes aportar mensualmente?' },
    { number: 5, title: 'Supuestos', description: 'Ajusta inflación y rentabilidad' },
  ];

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1: return ['name', 'type'];
      case 2: return ['target_amount'];
      case 3: return ['target_date', 'target_years'];
      case 4: return ['monthly_contribution'];
      case 5: return ['inflation_rate', 'return_rate'];
      default: return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      // Process the data
      const goalData = {
        ...data,
        target_amount: Number(data.target_amount),
        monthly_contribution: Number(data.monthly_contribution) || 0,
        inflation_rate: Number(data.inflation_rate),
        return_rate: Number(data.return_rate),
      };

      // If target_years is provided, calculate target_date
      if (data.target_years && !data.target_date) {
        goalData.target_date = addYears(new Date(), data.target_years).toISOString().split('T')[0];
      }

      await createGoal.mutateAsync(goalData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de tu meta
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Ej: Casa en la playa, Viaje a Japón..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Tipo de objetivo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {goalTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = watchedValues.type === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setValue('type', type.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuánto quieres ahorrar en total?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">€</span>
                <input
                  {...register('target_amount', { valueAsNumber: true })}
                  type="number"
                  step="100"
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              {errors.target_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.target_amount.message}</p>
              )}
              
              {watchedValues.target_amount && (
                <p className="mt-2 text-sm text-gray-600">
                  Objetivo: <span className="font-semibold">{formatCurrency(watchedValues.target_amount)}</span>
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                ¿Para qué fecha quieres lograrlo?
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Fecha específica
                  </label>
                  <input
                    {...register('target_date')}
                    type="date"
                    min={formatDateForInput(new Date())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="text-center text-gray-500">
                  <span>o</span>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Años restantes
                  </label>
                  <input
                    {...register('target_years', { valueAsNumber: true })}
                    type="number"
                    step="0.5"
                    min="0.1"
                    placeholder="Ej: 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                Puedes estimar, luego podrás cambiarlo.
              </p>
              
              {(errors.target_date || errors.target_years) && (
                <p className="mt-1 text-sm text-red-600">
                  Debes especificar una fecha o años restantes
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Consejo:</strong> Si no tienes fecha fija, selecciona "No tengo fecha" 
                para introducir años aproximados.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuánto puedes aportar mensualmente?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">€</span>
                <input
                  {...register('monthly_contribution', { valueAsNumber: true })}
                  type="number"
                  step="10"
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              {errors.monthly_contribution && (
                <p className="mt-1 text-sm text-red-600">{errors.monthly_contribution.message}</p>
              )}
              
              <p className="mt-2 text-sm text-gray-500">
                Opcional. Si no estás seguro, déjalo en 0 y te calcularemos cuánto necesitas.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Supuestos por defecto:</strong> Estos valores son estimaciones. 
                Puedes ajustarlos según tu criterio.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inflación anual esperada
              </label>
              <div className="relative">
                <input
                  {...register('inflation_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.2"
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-3 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Valor actual: {((watchedValues.inflation_rate || 0.02) * 100).toFixed(1)}%
              </p>
              {errors.inflation_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.inflation_rate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rentabilidad anual esperada
              </label>
              <div className="relative">
                <input
                  {...register('return_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.3"
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-3 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Valor actual: {((watchedValues.return_rate || 0.05) * 100).toFixed(1)}%
              </p>
              {errors.return_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.return_rate.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border p-8">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={createGoal.isPending}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {createGoal.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Crear Meta</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GoalWizard;