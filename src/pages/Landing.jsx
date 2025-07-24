import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Shield, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Target,
      title: 'Metas Claras',
      description: 'Define objetivos específicos como casa, viaje, jubilación y más.',
    },
    {
      icon: BarChart3,
      title: 'Seguimiento Visual',
      description: 'Visualiza tu progreso con gráficos y barras de progreso intuitivas.',
    },
    {
      icon: TrendingUp,
      title: 'Cálculos Precisos',
      description: 'Proyecciones con interés compuesto, inflación y rentabilidad.',
    },
    {
      icon: Shield,
      title: 'Datos Seguros',
      description: 'Tu información financiera se mantiene privada y segura.',
    },
  ];

  const benefits = [
    'Planificación financiera sin jerga técnica',
    'Cálculos automáticos de aportes necesarios',
    'Seguimiento de progreso en tiempo real',
    'Ajustes por inflación y rentabilidad',
    'Interfaz intuitiva y fácil de usar',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Planificador Fin Light
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/help"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Ayuda
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Planifica tu futuro
            <span className="block text-blue-600">financiero</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Toma el control de tus finanzas y alcanza tus metas con nuestras 
            herramientas de planificación intuitivas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Empezar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              to="/help"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para planificar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas simples pero poderosas para alcanzar tus objetivos financieros.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Planificador Fin Light?
            </h2>
            <p className="text-xl text-gray-600">
              Diseñado para personas como tú, sin complicaciones financieras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comienza tu planificación hoy
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de personas que ya están alcanzando sus metas financieras.
          </p>
          
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
          >
            Crear cuenta gratuita
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <TrendingUp className="h-6 w-6" />
              <span className="text-lg font-semibold">Planificador Fin Light</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/help" className="hover:text-white transition-colors">
                Ayuda
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacidad
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>
              © 2024 Planificador Fin Light. 
              <strong className="ml-1 text-yellow-400">
                Esta herramienta no constituye asesoría financiera.
              </strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;