const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Platform API',
      version: '1.0.0',
      description: 'Documentation interactive de la plateforme API Gateway de gestion hospitalière des patients.'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Portail d\'Entrée API Gateway (Recommandé)'
      },
      {
        url: 'http://localhost:8000',
        description: 'Serveur Direct Laravel (Backend)'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Saisissez votre jeton d\'accès (Token) généré lors de la connexion pour vous authentifier.'
        }
      }
    }
  },
  // Scanner les fichiers de routes pour récupérer les JSDocs Swagger
  apis: ['./src/routes/*.js', './routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
