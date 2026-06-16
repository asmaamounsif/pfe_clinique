const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { logger } = require('../middlewares/logger');
const { authLimiter, apiLimiter } = require('../middlewares/rateLimiter');
const router = express.Router();

const laravelUrl = process.env.LARAVEL_URL || 'http://localhost:8000';

// Configuration commune du middleware de proxy HTTP
const proxyOptions = {
  target: laravelUrl,
  changeOrigin: true,
  proxyTimeout: 30000, // Timeout de réponse de 30 secondes
  timeout: 30000,      // Timeout de connexion de 30 secondes
  on: {
    // Gestion globale des erreurs de connexion vers Laravel
    error: (err, req, res) => {
      logger.error('Hospital API Gateway Proxy Error', {
        message: err.message,
        url: req.url,
        method: req.method,
        stack: err.stack
      });

      res.status(502).json({
        success: false,
        message: 'Le serveur d\'application (backend) est inaccessible. Veuillez patienter ou contacter l\'administration.',
        data: null,
        errors: { gateway: [err.message] }
      });
    },
    // Ajout d'en-têtes personnalisés pour tracer le passage par le Gateway
    proxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying request: ${req.method} ${req.originalUrl} -> ${proxyOptions.target}${proxyReq.path}`);
      proxyReq.setHeader('X-Gateway-Proxy', 'NodeJS-API-Gateway');
    }
  }
};

const laravelProxy = createProxyMiddleware(proxyOptions);

// 1. Limiteur strict pour l'authentification (5 requêtes / 15min)
router.use('/api/login', authLimiter);
router.use('/api/register', authLimiter);
router.use('/api/auth/login', authLimiter);
router.use('/api/auth/register', authLimiter);

// 2. Limiteur classique pour les autres requêtes API (200 requêtes / 15min)
// On exclut les routes d'authentification qui ont déjà leur propre limiteur
router.use('/api', (req, res, next) => {
  const authPaths = ['/api/login', '/api/register', '/api/auth/login', '/api/auth/register'];
  if (authPaths.includes(req.path)) {
    return next();
  }
  return apiLimiter(req, res, next);
});

// 3. Redirection Proxy vers Laravel (monté sur "/" pour préserver le chemin "/api" complet)
router.use('/', laravelProxy);

module.exports = router;
