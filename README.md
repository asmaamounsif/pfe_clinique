# Plateforme Hospitalière Sécurisée - SIH Patient Management

Cette plateforme est un prototype complet de Système d'Information Hospitalier (SIH) sécurisé de gestion des patients. Elle intègre un modèle de données rigoureux, une API REST robuste sous Laravel, une passerelle d'accès (API Gateway) Node.js et une application client riche sous React 18.

---

## 1. Stack Technique et Composants

- **Frontend** : React 18, Vite, TailwindCSS (style médical), Axios, React Hook Form, Zod.
- **API Gateway** : Node.js (Express), Http-Proxy-Middleware, Winston & Morgan logs, Helmet, Express-Rate-Limit, Swagger (OpenAPI 3).
- **Backend API** : Laravel 10+, PHP 8.3 FPM, Sanctum (Auth), Eloquent (ORM), Observers (Logs d'audit).
- **Base de Données** : MySQL 8.0 (persistant).
- **Mise en cache & Sessions** : Redis 7 (persistant).
- **Reverse Proxy Global** : Nginx (Gzip + SSL support).

---

## 2. Prérequis

- **Docker Desktop** (version 20+) ou Docker Engine avec Docker Compose.
- **Git** pour cloner le projet.
- **Make** (facultatif, recommandé pour utiliser les raccourcis de commande).

---

## 3. Installation Rapide

Déployez l'intégralité de l'infrastructure en **3 commandes simples** :

```bash
# 1. Clonez le dépôt du projet
git clone https://github.com/votre-compte/hospital_mcd_laravel.git

# 2. Configurez les variables d'environnement de production
cp .env.production .env

# 3. Lancez le déploiement multi-conteneur orchestré par Docker
docker-compose up --build
```
*(Alternative : si `make` est présent, utilisez simplement `make up` à l'étape 3).*

---

## 4. Points d'Accès de la Plateforme

Une fois le déploiement complété, les services sont accessibles sur les ports standardisés :

- **Portail Client (React SPA)** : [http://localhost](http://localhost) (Service par Nginx)
- **Documentation Interactive (Swagger)** : [http://localhost/api/docs](http://localhost/api/docs) (Swagger UI)
- **API Gateway (Passerelle)** : [http://localhost/api](http://localhost/api) (Port physique direct : 3000)
- **API Backend (Laravel direct)** : [http://localhost:8000](http://localhost:8000) (Non exposé par Nginx pour des raisons de sécurité)

---

## 5. Comptes Utilisateurs de Test (Seeding)

La base de données est initialisée automatiquement avec des profils d'utilisateurs factices et des rôles distincts. Tous les comptes partagent le mot de passe sécurisé par défaut : `password`.

| Identifiant (Email) | Rôle (Slug) | Droits d'Accès Associés |
|---|---|---|
| `admin@hopital.com` | `admin` | Accès total, lecture des logs d'audit complets. |
| `medecin@hopital.com` | `medecin` | Gestion clinique des patients, rédactions des comptes-rendus et ordonnances. |
| `secretaire@hopital.com` | `secretaire` | Admissions administratifs des patients, prise et déplacement de rendez-vous. |
| `patient@hopital.com` | `patient` | Consultation de son propre dossier médical, de ses ordonnances et rendez-vous. |

---

## 6. Structure du Projet

```text
hospital_mcd_laravel/
├── backend/                  # API REST Laravel (Backend)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # Contrôleurs cliniques et auth
│   │   │   ├── Middleware/   # SecurityHeaders et ForceHttps
│   │   │   └── Requests/     # PatientRequest (validation)
│   │   └── Observers/        # AuditLogObserver (traçabilité BDD)
│   ├── config/               # Configuration (sanctum.php)
│   ├── database/             # Migrations et Factories de test
│   └── tests/Feature/        # Tests d'intégration de sécurité
├── gateway/                  # API Gateway Node.js
│   ├── src/
│   │   ├── config/           # Configuration Swagger-JSDoc
│   │   ├── middlewares/      # Limiteurs, logs Winston, Helmet
│   │   ├── routes/           # Redirection Proxy et Docs
│   │   └── index.js          # Point d'entrée Express
│   └── Dockerfile            # Image Node 20 Alpine
├── frontend/                 # Application Client React 18
│   ├── src/
│   │   ├── components/       # Layouts, Sidebar, Formulaire Patient
│   │   ├── contexts/         # AuthContext (JWT & RBAC)
│   │   ├── hooks/            # useAuth, useApi, usePatients
│   │   ├── pages/            # Écrans cliniques et logs d'audit
│   │   └── services/         # Clients d'API (Axios)
│   ├── Dockerfile            # Compilation + Service Nginx Alpine
│   └── nginx.conf            # Routage d'URL SPA (try_files)
├── nginx/                    # Reverse Proxy Nginx racine
│   └── nginx.conf            # Dispatch et en-têtes HTTP de prod
├── docker-compose.yml        # Orchestration des 6 services
├── Makefile                  # Alias de commandes raccourcies
└── README.md                 # Ce document
```

---

## 7. Sécurité et Conformité HDS / RGPD

La plateforme implémente plusieurs mécanismes de sécurité de niveau entreprise :

1. **Isolation des conteneurs** : Seul le serveur Nginx racine et l'API Gateway exposent des ports publics. La base de données MySQL, Redis et Laravel s'exécutent dans un sous-réseau privé (`hospital_network`).
2. **Double Filtrage CORS & Helmet** : Sécurité des requêtes AJAX configurée au niveau de la Gateway et de Nginx pour rejeter les domaines tiers suspectés.
3. **Limiteur de Débit (Rate Limiting) Strict** : Bridage des tentatives de connexions (5 tentatives par 15min max) pour éviter le forçage brute de mot de passe.
4. **Traçabilité totale (Audit Logging)** : Chaque écriture en base de données sur les patients, prescriptions ou consultations déclenche un log d'audit non-modifiable en base de données.
5. **En-têtes HTTP de Sécurité** : CSP, HSTS, X-Frame-Options (DENY) et X-Content-Type-Options injectés automatiquement dans les réponses.

---

## 8. Guide de Contribution

1. Créez une branche de fonctionnalité à partir de la branche `main` : `git checkout -b feature/ma-fonctionnalite`.
2. Implémentez vos changements et testez la syntaxe de vos fichiers PHP (`php -l`) et JS (`node --check`).
3. Lancez la suite de tests de sécurité : `make test`.
4. Soumettez une Pull Request décrivant vos apports pour revue.
