const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');
const router = express.Router();

// Route pour servir la documentation interactive Swagger UI
router.use('/api/docs', swaggerUi.serve);
router.get('/api/docs', swaggerUi.setup(swaggerSpec));

// =========================================================================
// ANNOTATIONS JSDOC SWAGGER POUR LES 10 ENDPOINTS REQUIS
// =========================================================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur (Médecin, Secrétaire, Patient, Admin) de s'authentifier et d'obtenir un jeton d'accès Sanctum.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: medecin@hopital.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     access_token:
 *                       type: string
 *                       example: 1|laravel_sanctum_token_value
 *       401:
 *         description: Identifiants incorrects
 *       422:
 *         description: Erreur de validation des champs
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     description: Révoque le jeton d'accès actuel de l'utilisateur connecté.
 *     tags: [Authentification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Liste paginée des patients
 *     description: Récupère la liste de tous les patients avec filtres de recherche (nom, prénom, numéro de sécurité sociale).
 *     tags: [Patients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche (nom, prénom, numéro de sécurité sociale)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *       403:
 *         description: Accès interdit (rôle insuffisant)
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Créer un profil patient
 *     description: Enregistre un nouveau patient et génère son dossier médical automatiquement.
 *     tags: [Patients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - social_security_number
 *               - date_of_birth
 *               - gender
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID utilisateur associé (optionnel)
 *               social_security_number:
 *                 type: string
 *                 example: "1890975123456"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1989-09-12"
 *               gender:
 *                 type: string
 *                 enum: [M, F, Autre]
 *                 example: "M"
 *               address:
 *                 type: string
 *                 example: "12 Rue de la Paix, Paris"
 *               phone:
 *                 type: string
 *                 example: "0612345678"
 *               blood_type:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: "O+"
 *               emergency_contact_name:
 *                 type: string
 *                 example: "Jean Dupont"
 *               emergency_contact_phone:
 *                 type: string
 *                 example: "0687654321"
 *     responses:
 *       201:
 *         description: Patient créé avec succès
 *       422:
 *         description: Données de validation invalides
 *       403:
 *         description: Accès interdit
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Détails d'un patient
 *     description: Récupère la fiche détaillée d'un patient avec son dossier médical et ses informations de compte.
 *     tags: [Patients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unique du patient
 *     responses:
 *       200:
 *         description: Détails récupérés avec succès
 *       404:
 *         description: Patient non trouvé
 *       403:
 *         description: Accès interdit
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Modifier un profil patient
 *     description: Met à jour les informations de contact, adresse ou dossier de sécurité sociale d'un patient.
 *     tags: [Patients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unique du patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               social_security_number:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, Autre]
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               blood_type:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               emergency_contact_name:
 *                 type: string
 *               emergency_contact_phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient mis à jour avec succès
 *       404:
 *         description: Patient non trouvé
 *       422:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /api/consultations:
 *   get:
 *     summary: Liste des consultations
 *     description: Récupère l'historique des consultations. Les médecins ne voient que leurs propres consultations par défaut.
 *     tags: [Consultations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *         description: Filtrer par patient
 *     responses:
 *       200:
 *         description: Liste récupérée
 *       403:
 *         description: Accès interdit
 */

/**
 * @swagger
 * /api/consultations:
 *   post:
 *     summary: Enregistrer une consultation
 *     description: Enregistre les détails cliniques d'un examen médical. Le médecin connecté est enregistré comme l'auteur.
 *     tags: [Consultations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - date_consultation
 *               - motif
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 1
 *               date_consultation:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-04T14:30:00Z"
 *               motif:
 *                 type: string
 *                 example: "Maux de tête réguliers"
 *               symptoms:
 *                 type: string
 *                 example: "Céphalées pulsatiles côté gauche depuis 4 jours."
 *               diagnostic:
 *                 type: string
 *                 example: "Migraine ophtalmique suspectée."
 *               observations:
 *                 type: string
 *                 example: "Patient fatigué, tension artérielle normale (12/8)."
 *               tarif:
 *                 type: number
 *                 example: 50.00
 *     responses:
 *       201:
 *         description: Consultation enregistrée avec succès
 *       422:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Liste des rendez-vous
 *     description: Récupère la liste chronologique des rendez-vous (filtres disponibles par médecin et par date).
 *     tags: [Rendez-vous]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctor_id
 *         schema:
 *           type: integer
 *         description: Filtrer par médecin
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Liste récupérée
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Consulter les logs d'audit (Sécurité)
 *     description: Affiche l'historique complet des actions d'écritures (CREATE, UPDATE, DELETE) sur la plateforme. Réservé aux administrateurs.
 *     tags: [Sécurité / Audit]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logs d'audit récupérés
 *       403:
 *         description: Accès refusé (non-administrateur)
 */

module.exports = router;
