# Financial Goals - Planificador Fin Light

Una aplicación web completa para planificación de metas financieras personales, diseñada para usuarios sin conocimientos financieros avanzados.

## 🚀 Características

### MVP (Retail - Gratuito)
- ✅ **Wizard de onboarding** de 5 pasos para crear metas
- ✅ **Dashboard intuitivo** con estadísticas y progreso visual
- ✅ **Cálculos financieros** precisos con interés compuesto
- ✅ **Seguimiento de aportes** manuales
- ✅ **Proyecciones visuales** con gráficos interactivos
- ✅ **Ajuste por inflación** automático
- ✅ **Múltiples tipos de metas**: Casa, Viaje, Coche, Jubilación, Otros

### Premium (Próximamente)
- 🔄 **Escenarios múltiples** (optimista, pesimista, base)
- 🔄 **Simulación Monte Carlo** para análisis de riesgo
- 🔄 **Import/Export CSV** de aportes
- 🔄 **Reportes PDF/Excel**
- 🔄 **Stress testing** de mercado
- 🔄 **Notificaciones** por email
- 🔄 **Comparador de objetivos**

## 🛠 Stack Tecnológico

### Frontend
- **React 18** con Vite
- **Tailwind CSS** para estilos
- **React Hook Form + Zod** para formularios
- **TanStack Query** para estado del servidor
- **Recharts** para gráficos
- **React Router** para navegación

### Backend
- **Node.js + Express**
- **SQLite** (desarrollo) / **PostgreSQL** (producción)
- **Knex.js** como query builder
- **JWT** para autenticación
- **Joi** para validación
- **Bcrypt** para seguridad

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Configuración Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd financial-goals
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Instalar dependencias del backend**
```bash
cd server
npm install
cd ..
```

4. **Configurar variables de entorno**
```bash
# Frontend
cp .env.example .env

# Backend
cp server/.env.example server/.env
```

5. **Editar archivos .env**

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Financial Goals
```

**Backend (server/.env):**
```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=tu-clave-secreta-muy-larga-y-segura
JWT_REFRESH_SECRET=otra-clave-secreta-para-refresh-tokens
DB_FILENAME=./financial_goals.db
```

6. **Ejecutar en modo desarrollo**
```bash
# Opción 1: Ejecutar ambos servicios
npm run dev:full

# Opción 2: Ejecutar por separado
# Terminal 1 - Frontend
npm run dev:client

# Terminal 2 - Backend
npm run dev:server
```

7. **Abrir la aplicación**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## 🧪 Testing

### Backend
```bash
cd server
npm test
```

### Tests incluidos
- ✅ Fórmulas financieras (futureValueAnnuity, requiredPayment, etc.)
- ✅ Autenticación (registro, login, JWT)
- ✅ Endpoints principales
- ✅ Validaciones

## 🚀 Despliegue

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `VITE_API_URL=https://tu-backend.railway.app/api`
3. Deploy automático desde main branch

### Backend (Railway)
1. Conectar repositorio a Railway
2. Configurar variables de entorno de producción
3. Railway detectará automáticamente el Dockerfile

### Backend (Render)
1. Crear nuevo Web Service
2. Conectar repositorio
3. Configurar:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node.js

### Base de Datos (Producción)
- **Supabase**: PostgreSQL gestionado
- **Railway**: PostgreSQL incluido
- **Render**: PostgreSQL add-on

## 📊 Estructura del Proyecto

```
financial-goals/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas principales
│   ├── hooks/             # Custom hooks
│   ├── services/          # API calls
│   └── utils/             # Utilidades
├── server/                # Backend Node.js
│   ├── routes/            # Endpoints REST
│   ├── models/            # Modelos de datos
│   ├── services/          # Lógica de negocio
│   ├── middleware/        # Middleware Express
│   └── utils/             # Utilidades del servidor
├── package.json           # Dependencias frontend
└── server/package.json    # Dependencias backend
```

## 🔧 Scripts Disponibles

### Frontend
```bash
npm run dev:client      # Desarrollo frontend
npm run build          # Build producción
npm run preview        # Preview build
```

### Backend
```bash
npm run dev:server     # Desarrollo backend
npm run start          # Producción
npm run test           # Tests
```

### Combinados
```bash
npm run dev:full       # Frontend + Backend
npm test              # Tests backend
```

## 🔐 Seguridad

- ✅ **JWT** con refresh tokens
- ✅ **Bcrypt** para contraseñas
- ✅ **Rate limiting** en endpoints
- ✅ **Validación** de entrada con Joi
- ✅ **CORS** configurado
- ✅ **Helmet** para headers de seguridad

## 📈 Fórmulas Financieras

### Valor Futuro de Anualidad
```
VF = PMT × ((1+r)^n - 1) / r + PV×(1+r)^n
```

### Aporte Requerido
```
PMT = (VF - PV×(1+r)^n) × r / ((1+r)^n - 1)
```

### Ajuste por Inflación
```
Valor Real = Valor Nominal × (1 + inflación)^años
```

## ⚠️ Disclaimers

**Esta herramienta no constituye asesoría financiera.** Las proyecciones son estimaciones basadas en los supuestos proporcionados y no garantizan resultados futuros. Siempre consulta con un asesor financiero profesional.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: Ver `/help` en la aplicación
- **Issues**: GitHub Issues
- **Email**: soporte@planificadorfin.com

## 🗺 Roadmap

### v1.1 (Próximo)
- [ ] Mejoras UX/UI
- [ ] Import/Export CSV básico
- [ ] Notificaciones push

### v2.0 (Premium)
- [ ] Suscripciones con Stripe
- [ ] Simulación Monte Carlo
- [ ] Reportes PDF
- [ ] API de datos financieros

### v2.1 (Avanzado)
- [ ] App móvil (React Native)
- [ ] Integración bancaria
- [ ] IA para recomendaciones