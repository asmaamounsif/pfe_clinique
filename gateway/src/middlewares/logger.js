const winston = require('winston');
const morgan = require('morgan');
const path = require('path');

// 1. CONFIGURATION DU LOGGER WINSTON
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    // Fichier pour consigner toutes les erreurs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Fichier pour consigner tous les logs (erreurs et succès)
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Affichage console coloré si on n'est pas en production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 2. INTEGRATION DE MORGAN AVEC WINSTON (FORMAT JSON)
const stream = {
  write: (message) => {
    try {
      const logData = JSON.parse(message);
      if (logData.status >= 400) {
        logger.error('HTTP Request Failure', logData);
      } else {
        logger.info('HTTP Request Success', logData);
      }
    } catch (e) {
      logger.info(message.trim());
    }
  }
};

// Formateur de requête personnalisé retournant une chaîne JSON
const morganJSONFormat = (tokens, req, res) => {
  return JSON.stringify({
    timestamp: tokens.date(req, res, 'iso'),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res) || '500'),
    responseTime: `${tokens['response-time'](req, res)} ms`,
    ip: req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress,
    userAgent: tokens['user-agent'](req, res)
  });
};

const morganMiddleware = morgan(morganJSONFormat, { stream });

module.exports = {
  logger,
  morganMiddleware
};
