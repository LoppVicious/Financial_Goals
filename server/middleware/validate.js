// server/middleware/validate.js
const Joi = require('joi');

/**
 * Middleware genérico de validación
 * @param {Joi.Schema} schema  - Esquema Joi
 * @param {'body'|'params'|'query'} property - Propiedad de req a validar
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message,
      value: d.context?.value
    }));
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details
    });
  }
  req[property] = value;
  next();
};

// ─── 1) Esquemas base ────────────────────────────────────────────────────────────
const userRegistration = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required()
});

const userLogin = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const goalCreation = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  type: Joi.string().valid('casa','viaje','coche','jubilacion','otro').required(),
  target_amount: Joi.number().positive().max(1e7).required(),
  target_date: Joi.date().iso().min('now'),
  target_years: Joi.number().positive().max(50),
  monthly_contribution: Joi.number().min(0).max(1e5).default(0),
  inflation_rate: Joi.number().min(0).max(0.2).default(0.02),
  return_rate: Joi.number().min(0).max(0.3).default(0.05)
}).or('target_date','target_years');

const goalUpdate = Joi.object({
  name: Joi.string().trim().min(1).max(255),
  type: Joi.string().valid('casa','viaje','coche','jubilacion','otro'),
  target_amount: Joi.number().positive().max(1e7),
  target_date: Joi.date().iso().min('now').allow(null),
  target_years: Joi.number().positive().max(50).allow(null),
  monthly_contribution: Joi.number().min(0).max(1e5),
  inflation_rate: Joi.number().min(0).max(0.2),
  return_rate: Joi.number().min(0).max(0.3),
  is_active: Joi.boolean()
});

const contributionCreation = Joi.object({
  amount: Joi.number().positive().max(1e6).required(),
  contribution_date: Joi.date().iso().max('now').required(),
  type: Joi.string().valid('monthly','extra','initial').default('extra'),
  notes: Joi.string().trim().max(500).allow('')
});

const contributionUpdate = Joi.object({
  amount: Joi.number().positive().max(1e6),
  contribution_date: Joi.date().iso().max('now'),
  type: Joi.string().valid('monthly','extra','initial'),
  notes: Joi.string().trim().max(500).allow('')
});

const requiredContributionCalc = Joi.object({
  targetAmount: Joi.number().positive().max(1e7).required(),
  currentAmount: Joi.number().min(0).max(1e7).default(0),
  years: Joi.number().positive().max(50).required(),
  returnRate: Joi.number().min(0).max(0.3).required(),
  inflationRate: Joi.number().min(0).max(0.2).default(0.02)
});

const futureValueCalc = Joi.object({
  monthlyContribution: Joi.number().min(0).max(1e5).required(),
  currentAmount: Joi.number().min(0).max(1e7).default(0),
  years: Joi.number().positive().max(50).required(),
  returnRate: Joi.number().min(0).max(0.3).required(),
  inflationRate: Joi.number().min(0).max(0.2).default(0.02)
});

// ─── 2) Esquemas paginación y filtros ─────────────────────────────────────────────
const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid('created_at','updated_at','name','target_amount')
    .default('created_at'),
  sortOrder: Joi.string().valid('asc','desc').default('desc')
});

const goalFilterQuery = Joi.object({
  type: Joi.string().valid('casa','viaje','coche','jubilacion','otro'),
  is_active: Joi.boolean().default(true),
  search: Joi.string().trim().max(100)
}).concat(paginationQuery);

const contributionFilterQuery = Joi.object({
  type: Joi.string().valid('monthly','extra','initial'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
}).concat(paginationQuery);

// ─── 3) Exportar esquemas ────────────────────────────────────────────────────────
const schemas = {
  userRegistration,
  userLogin,
  refreshToken: refreshTokenSchema,
  goalCreation,
  goalUpdate,
  contributionCreation,
  contributionUpdate,
  requiredContributionCalc,
  futureValueCalc,
  paginationQuery,
  goalFilterQuery,
  contributionFilterQuery
};

// ─── 4) Reglas de negocio adicionales ─────────────────────────────────────────────
const businessRuleValidation = {
  futureDate: (req, res, next) => {
    if (req.body.target_date) {
      const target = new Date(req.body.target_date);
      if (target <= new Date()) {
        return res.status(400).json({ error: 'Target date must be in the future' });
      }
    }
    next();
  },
  pastOrPresentDate: (req, res, next) => {
    if (req.body.contribution_date) {
      const contrib = new Date(req.body.contribution_date);
      const now = new Date(); now.setHours(23,59,59,999);
      if (contrib > now) {
        return res.status(400).json({ error: 'Contribution date cannot be in the future' });
      }
    }
    next();
  },
  reasonableFinancialValues: (req, res, next) => {
    const { target_amount, monthly_contribution, return_rate, inflation_rate } = req.body;
    if (target_amount < monthly_contribution) {
      return res.status(400).json({ error: 'Target amount must be ≥ monthly contribution' });
    }
    if (return_rate > 0.15) {
      req.warnings = ['Return rate above 15% is very optimistic'];
    }
    if (inflation_rate > 0.08) {
      req.warnings = req.warnings || [];
      req.warnings.push('Inflation rate above 8% is very high');
    }
    next();
  }
};

// ─── 5) Helpers UUID y validación de archivos ─────────────────────────────────────
const validateUUID = (paramName = 'id') =>
  validate(Joi.object({ [paramName]: Joi.string().uuid().required() }), 'params');

const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'FILE_REQUIRED' });
  }
  if (allowedTypes.length && !allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'INVALID_FILE_TYPE' });
  }
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'FILE_TOO_LARGE' });
  }
  next();
};

// ─── 6) Exportar todo ────────────────────────────────────────────────────────────
module.exports = {
  validate,
  schemas,
  validateUUID,
  validateFileUpload,
  businessRuleValidation
};
