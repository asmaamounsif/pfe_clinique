// Chargement des variables d'environnement au plus tôt
require('dotenv').config();

const express = require('express');
const { helmetMiddleware, corsMiddleware } = require('./middlewares/security');
const { globalLimiter } = require('./middlewares/rateLimiter');
const { morganMiddleware, logger } = require('./middlewares/logger');
const docsRouter = require('./routes/docs');
const proxyRouter = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Indiquer à Express de faire confiance aux proxys pour récupérer l'IP réelle du client (clé pour express-rate-limit)
app.set('trust proxy', 1);

// =========================================================================
// ORDONNANCEMENT CORRECT DES MIDDLEWARES
// =========================================================================

// 1. Middlewares de sécurité en tête
app.use(helmetMiddleware);
app.use(corsMiddleware);

// 2. Limiteur global de requêtes pour protéger l'infrastructure
app.use(globalLimiter);

// 3. Logger Morgan qui capture et redirige les requêtes HTTP vers Winston
app.use(morganMiddleware);

// ATTENTION CONCEPTION : Nous ne chargeons pas express.json() ou express.urlencoded()
// de manière globale car cela consommerait le flux de données (stream) des requêtes POST/PUT
// et empêcherait http-proxy-middleware de les retransmettre correctement à Laravel (blocage de requête).

// 4. Route de santé pour le Gateway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'API Gateway' });
});

// 5. Route pour Swagger UI (Documentation de l'API)
app.use(docsRouter);

// 5. Route du Proxy vers le backend Laravel
app.use(proxyRouter);

// =========================================================================
// GESTION CENTRALE DES ERREURS EXPRESS
// =========================================================================
app.use((err, req, res, next) => {
  logger.error('Unhandled Gateway Error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    message: 'Une erreur interne est survenue sur le serveur d\'accès (Gateway).',
    data: null,
    errors: { gateway: [err.message] }
  });
});

// Route de fallback pour les chemins non trouvés (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'La ressource demandée n\'existe pas sur le Gateway.',
    data: null,
    errors: { gateway: [`Route ${req.method} ${req.url} introuvable.`] }
  });
});

// Démarrage du serveur Gateway sur le port spécifié
app.listen(PORT, () => {
  logger.info(`Hospital API Gateway démarré avec succès sur le port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  logger.info(`Documentation Swagger disponible sur: http://localhost:${PORT}/api/docs`);
});
