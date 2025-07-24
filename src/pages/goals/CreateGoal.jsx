import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GoalWizard from '../../components/forms/GoalWizard';

const CreateGoal = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver al Dashboard
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nueva Meta
        </h1>
        <p className="text-gray-600">
          Sigue estos pasos para definir tu objetivo financiero
        </p>
      </div>

      {/* Wizard Component */}
      <GoalWizard />
    </div>
  );
};

export default CreateGoal;