// frontend/src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Leer el idioma guardado o usar 'es' por defecto
const savedLang = localStorage.getItem('lang') || 'es';

i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'es',
    resources: {
      es: {
        translation: {
          splash: {
            title: 'Planifica tu futuro financiero',
            desc: 'Toma el control de tus finanzas y alcanza tus metas con nuestras herramientas de planificación intuitivas.',
            start: 'Empezar',
            login: 'Iniciar sesión',
            legal: 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.'
          },
          login: {
            alt: 'Volver atrás',
            title: 'Iniciar Sesión',
            email: 'Correo electrónico',
            emailPlaceholder: 'Introduce tu correo electrónico',
            password: 'Contraseña',
            passwordPlaceholder: 'Introduce tu contraseña',
            forgot: '¿Olvidaste tu contraseña?',
            submit: 'Iniciar Sesión',
            createAccount: 'Crear cuenta',
            errorInvalid: 'Email o contraseña incorrectos'
          },
          register: {
            alt: 'Volver atrás',
            title: 'Crear cuenta',
            name: 'Nombre completo',
            namePlaceholder: 'Introduce tu nombre completo',
            email: 'Correo electrónico',
            emailPlaceholder: 'Introduce tu correo electrónico',
            password: 'Contraseña',
            passwordPlaceholder: 'Elige una contraseña',
            submit: 'Crear cuenta',
            login: 'Iniciar sesión',
            errorInvalid: 'Error al crear cuenta'
          },
          dashboard: {
            loading: "Cargando metas…",
            noGoals: "No tienes metas aún.",
            newGoal: "Nueva meta",
            onTrack: "Vas en línea",
            onTarget: "Aportas lo justo"
          },
          settings: {
            title: 'Ajustes',
            language: 'Idioma',
            logout: 'Cerrar sesión',
            back: 'Volver'
          }
        }
      },
      en: {
        translation: {
          splash: {
            title: 'Plan Your Financial Future',
            desc: 'Take control of your finances and achieve your goals with our intuitive planning tools.',
            start: 'Get Started',
            login: 'Log In',
            legal: 'By continuing, you agree to our Terms of Service and Privacy Policy.'
          },
          login: {
            alt: 'Go back',
            title: 'Log In',
            email: 'Email',
            emailPlaceholder: 'Enter your email',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            forgot: 'Forgot password?',
            submit: 'Log In',
            createAccount: 'Create Account',
            errorInvalid: 'Invalid email or password'
          },
          register: {
            alt: 'Go back',
            title: 'Create Account',
            name: 'Full Name',
            namePlaceholder: 'Enter your full name',
            email: 'Email',
            emailPlaceholder: 'Enter your email',
            password: 'Password',
            passwordPlaceholder: 'Choose a password',
            submit: 'Create Account',
            login: 'Log In',
            errorInvalid: 'Error creating account'
          },
          dashboard: {
            title: 'My Goals',
            loading: 'Loading goals…',
            errorLoad: 'Could not load goals.',
            noGoals: "You haven't created any goals yet.",
            newGoal: '+ New goal'
          },
          goalDetail: {
            title: "Detalle de meta",
            loading: "Cargando meta…",
            targe: "Cantidad objetivo",
            current: "Aportado hasta ahora",
            progress: "Progreso",
            assumptions: "Supuestos",
            inflation: "Inflación",
            return: "Rentabilidad esperada",
            edit: "Editar supuestos",
            delete: "Eliminar meta",
            confirmDelete: "¿Seguro que quieres eliminar esta meta?"
          },
          settings: {
            title: 'Settings',
            language: 'Language',
            logout: 'Logout',
            back: 'Back'
          }
        }
      }
    }
  });

// Al cambiar el idioma, guardarlo en localStorage
i18n.on('languageChanged', (lang) => {
  localStorage.setItem('lang', lang);
});

export default i18n;
