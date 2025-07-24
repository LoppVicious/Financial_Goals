import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  FileText, 
  AlertTriangle, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Target,
  DollarSign
} from 'lucide-react';

const Help = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const faqs = [
    {
      question: '¿Cómo se calculan las proyecciones?',
      answer: 'Utilizamos fórmulas de interés compuesto para calcular el crecimiento de tus ahorros. La fórmula principal es: VF = PMT × ((1+r)^n - 1) / r + PV×(1+r)^n, donde VF es el valor futuro, PMT el pago mensual, r la tasa de interés mensual, n el número de meses y PV el valor presente.',
    },
    {
      question: '¿Qué significa "ajuste por inflación"?',
      answer: 'La inflación reduce el poder adquisitivo del dinero con el tiempo. Ajustamos tu objetivo por inflación para que el monto final tenga el mismo poder de compra que hoy. Por ejemplo, si tu objetivo es €10,000 en 5 años con 2% de inflación anual, necesitarás aproximadamente €11,041.',
    },
    {
      question: '¿Cómo elijo la rentabilidad esperada?',
      answer: 'La rentabilidad depende de tu estrategia de inversión. Valores conservadores: 2-4% (depósitos, bonos). Moderados: 4-7% (fondos mixtos). Agresivos: 7-10% (acciones, fondos de renta variable). Recuerda que mayor rentabilidad implica mayor riesgo.',
    },
    {
      question: '¿Puedo cambiar mis supuestos después?',
      answer: 'Sí, puedes editar tus metas en cualquier momento para ajustar el objetivo, fecha, aportes, inflación o rentabilidad esperada. Las proyecciones se actualizarán automáticamente.',
    },
    {
      question: '¿Cómo importo mis aportes desde un CSV?',
      answer: 'En la versión Premium podrás importar aportes desde un archivo CSV con el formato: fecha,monto,tipo,notas. Ejemplo: 2024-01-15,250.00,mensual,Aporte enero.',
    },
  ];

  const formulas = [
    {
      name: 'Valor Futuro de Anualidad',
      formula: 'VF = PMT × ((1+r)^n - 1) / r + PV×(1+r)^n',
      description: 'Calcula cuánto tendrás al final del período con aportes regulares.',
      variables: [
        'VF = Valor Futuro',
        'PMT = Pago Mensual',
        'r = Tasa de interés mensual',
        'n = Número de meses',
        'PV = Valor Presente (inicial)'
      ]
    },
    {
      name: 'Aporte Requerido',
      formula: 'PMT = (VF - PV×(1+r)^n) × r / ((1+r)^n - 1)',
      description: 'Calcula cuánto debes aportar mensualmente para alcanzar tu objetivo.',
      variables: [
        'PMT = Pago Mensual requerido',
        'VF = Valor Futuro objetivo',
        'PV = Valor Presente (inicial)',
        'r = Tasa de interés mensual',
        'n = Número de meses'
      ]
    },
    {
      name: 'Ajuste por Inflación',
      formula: 'Valor Real = Valor Nominal × (1 + inflación)^años',
      description: 'Ajusta el objetivo por la pérdida de poder adquisitivo.',
      variables: [
        'Valor Real = Monto ajustado por inflación',
        'Valor Nominal = Monto sin ajustar',
        'Inflación = Tasa de inflación anual',
        'Años = Tiempo hasta el objetivo'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Centro de Ayuda
        </h1>
        <p className="text-xl text-gray-600">
          Todo lo que necesitas saber sobre planificación financiera
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/goals/create"
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Crear Meta</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Guía paso a paso para crear tu primera meta financiera
          </p>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Calculadora</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Entiende cómo funcionan nuestros cálculos financieros
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Estrategias</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Consejos para optimizar tus ahorros e inversiones
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">
              Aviso Importante
            </h3>
            <div className="text-yellow-700 space-y-2 text-sm">
              <p>
                <strong>Esta herramienta no constituye asesoría financiera.</strong> Las proyecciones 
                son estimaciones basadas en los supuestos que proporciones y no garantizan resultados futuros.
              </p>
              <p>
                Los mercados financieros son volátiles y los rendimientos pasados no predicen 
                rendimientos futuros. Siempre consulta con un asesor financiero profesional 
                antes de tomar decisiones de inversión importantes.
              </p>
              <p>
                Usa esta herramienta como guía para planificar, pero considera factores adicionales 
                como emergencias, cambios en ingresos, gastos inesperados y diversificación de riesgos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulas Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Calculator className="h-6 w-6 mr-2 text-blue-600" />
          Fórmulas Utilizadas
        </h2>
        
        <div className="space-y-6">
          {formulas.map((formula, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{formula.name}</h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-3 font-mono text-sm">
                {formula.formula}
              </div>
              <p className="text-gray-600 mb-3">{formula.description}</p>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">Variables:</p>
                <ul className="list-disc list-inside space-y-1">
                  {formula.variables.map((variable, idx) => (
                    <li key={idx}>{variable}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <HelpCircle className="h-6 w-6 mr-2 text-blue-600" />
          Preguntas Frecuentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedSection === index ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSection === index && (
                <div className="px-4 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSV Format Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-blue-600" />
          Formato CSV para Importar Aportes
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Para importar tus aportes desde un archivo CSV (disponible en Premium), 
            usa el siguiente formato:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-mono text-sm mb-2">fecha,monto,tipo,notas</p>
            <p className="font-mono text-sm mb-2">2024-01-15,250.00,mensual,Aporte enero</p>
            <p className="font-mono text-sm mb-2">2024-02-15,250.00,mensual,Aporte febrero</p>
            <p className="font-mono text-sm">2024-03-01,500.00,extra,Bonus trabajo</p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Especificaciones:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>fecha:</strong> Formato YYYY-MM-DD</li>
              <li><strong>monto:</strong> Número decimal (usa punto como separador)</li>
              <li><strong>tipo:</strong> mensual, extra, o inicial</li>
              <li><strong>notas:</strong> Texto descriptivo (opcional)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
          Consejos para el Éxito
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Planificación</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Define metas específicas y realistas
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Revisa y ajusta tus supuestos regularmente
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Considera múltiples escenarios (optimista, pesimista)
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Mantén un fondo de emergencia separado
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Ejecución</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Automatiza tus aportes mensuales
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Registra todos tus aportes para seguimiento preciso
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Diversifica tus inversiones según tu perfil de riesgo
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Celebra los hitos alcanzados para mantener motivación
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¿Necesitas más ayuda?
        </h3>
        <p className="text-gray-600 mb-4">
          Si tienes preguntas específicas o sugerencias, no dudes en contactarnos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:soporte@planificadorfin.com"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enviar Email
          </a>
          <Link
            to="/dashboard"
            className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;