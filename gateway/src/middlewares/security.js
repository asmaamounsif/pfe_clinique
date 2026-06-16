const helmet = require('helmet');
const cors = require('cors');

// 1. CONFIGURATION DE CORS
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
const allowedOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permet les outils locaux (comme Postman, curl) sans en-tête d'origine
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par la politique CORS (Hospital Gateway)'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

// 2. CONFIGURATION DE HELMET (EN-TÊTES DE SÉCURITÉ)
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:8000"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"] // Évite le clickjacking
    }
  },
  // Bloque l'inclusion dans des iframes (DENY)
  xFrameOptions: { action: 'deny' },
  // Active HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 an en secondes
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'same-origin' }
});

module.exports = {
  corsMiddleware,
  helmetMiddleware
};
