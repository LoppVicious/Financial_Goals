// frontend/src/pages/onboarding/Onboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepType from './StepType';
import StepAmount from './StepAmount';
import StepTerm from './StepTerm';
import StepAssumptions from './StepAssumptions';
import StepSummary from './StepSummary';

const steps = [
  { id: 0, Component: StepType },
  { id: 1, Component: StepAmount },
  { id: 2, Component: StepTerm },
  { id: 3, Component: StepAssumptions },
  { id: 4, Component: StepSummary },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currency: 'EUR',
    targetDate: '',
    yearsToGoal: null,
    defaultInflation: 0.02,
    defaultReturn: 0.05,
  });
  const navigate = useNavigate();

  const StepComponent = steps[currentStep].Component;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const updateForm = updates => {
    setForm(f => ({ ...f, ...updates }));
  };

  return (
    <div className="onboarding-container">
      <div className="stepper-header">
        <h2>Paso {currentStep + 1} de {steps.length}</h2>
      </div>
      <div className="step-content">
        <StepComponent
          form={form}
          updateForm={updateForm}
          nextStep={nextStep}
          prevStep={prevStep}
          navigate={navigate}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      </div>
    </div>
  );
}
