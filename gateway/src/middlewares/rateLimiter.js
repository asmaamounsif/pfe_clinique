const rateLimit = require('express-rate-limit');

// Limiteur global : 100 requêtes toutes les 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Trop de requêtes reçues, veuillez patienter avant de réessayer.',
    data: null,
    errors: { rate_limit: ['Limite globale dépassée. (100 requêtes max par 15min)'] }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour l'authentification (login, register) : 100 tentatives toutes les 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion ou d\'inscription, veuillez patienter.',
    data: null,
    errors: { rate_limit: ['Limite de sécurité d\'authentification dépassée. (5 requêtes max par 15min)'] }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour l'API générale : 200 requêtes toutes les 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Trop de requêtes sur les services API, veuillez patienter.',
    data: null,
    errors: { rate_limit: ['Limite d\'utilisation de l\'API dépassée. (200 requêtes max par 15min)'] }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter
};
