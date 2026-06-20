# CLINIQUE MOUNSIF — PROJECT GUIDE
# For developers and AI assistants

## 🏥 PROJECT OVERVIEW
- Name : Clinique Mounsif
- Type : Private clinic management platform
- Location : Casablanca, Maroc
- Description : Secure web platform for managing a private clinic, initialized from a clean slate.

Tech stack :
  Backend  → Laravel 11 + PHP 8.3 (port 8000)
  Gateway  → Node.js 20 + Express (port 3050)
  Frontend → React 18 + Vite + TailwindCSS (port 5173)
  Database → MySQL 8 (XAMPP)
  Auth     → Laravel Sanctum (Bearer tokens)
  RBAC     → Custom Slug-Based Role Middleware
  Docs     → Swagger UI at http://localhost:3050/api/docs

How to start :
  Step 1 → Open XAMPP, click Start on MySQL
  Step 2 → Double-click start.bat
  Step 3 → Open http://localhost:5173

Test accounts :
  Directeur  | admin@example.com       | password
  Médecin    | medecin@example.com     | password
  Infirmier  | infirmier@example.com   | password
  Secrétaire | secretaire@example.com  | password
  Patient    | patient@example.com     | password

---

## 🤖 AI WORKFLOW RULES
You MUST strictly adhere to the following rules during the redevelopment of this system:

### Rule 1: Continuous Documentation & Artifact Updates
After implementing any major feature, you must automatically update:
- The technical design/system concept ([architecture_conception.md](file:///c:/Users/HP/.gemini/antigravity/scratch/hospital_mcd_laravel/docs/architecture_conception.md)) including UML diagrams, ERDs, and flow charts.
- The master PFE report document ([rapport_pfe.md](file:///c:/Users/HP/.gemini/antigravity/scratch/hospital_mcd_laravel/docs/rapport_pfe.md)).
- The defense slides document ([presentation_pfe.md](file:///c:/Users/HP/.gemini/antigravity/scratch/hospital_mcd_laravel/docs/presentation_pfe.md)).

### Rule 2: Continuous Integration & Git Commits
After completing any successful step (e.g. database schema change, routing setup, component build):
- Run test validations (e.g., database seeding check or build verification).
- Automatically stage all changes, write a clean, semantic commit message, and push to the remote GitHub repository.

---

## 📁 FOLDER STRUCTURE (INITIAL STATE)

hospital_mcd_laravel/
│
├── 📂 backend/                                         ← Laravel API (port 8000)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/                            ← API logic
│   │   │   │   ├── AuthController.php                   ← Handles authentication (login, register, logout, me)
│   │   │   │   └── Controller.php                       ← Base Laravel controller class
│   │   ├── Models/                                     ← Database models
│   │   │   ├── Role.php                                 ← Model defining authorization roles (admin, medecin, etc.)
│   │   │   └── User.php                                 ← Model for users, email credentials, role relations
│   │   └── Traits/                                     ← Shared logic
│   │       └── ApiResponse.php                          ← Reusable helper trait for consistent JSON formatting
│   ├── database/
│   │   ├── migrations/                                 ← Table definitions (roles, users, cache, jobs, sanctum)
│   │   ├── seeders/                                    ← Base seeders
│   │   │   └── DatabaseSeeder.php                       ← Seeds the 5 core roles and 5 test users
│   │   └── factories/                                  ← Model factories
│   ├── routes/
│   │   └── api.php                                     ← Auth endpoints
│   ├── .env                                            ← DB + App config
│   └── composer.json                                   ← PHP dependencies
│
├── 📂 docs/                                            ← Project Conception, Report, and Defense
│   ├── architecture_conception.md                      ← High-level UML, ERDs, and network architectures
│   ├── rapport_pfe.md                                  ← PFE Report master document
│   └── presentation_pfe.md                             ← PFE Defense presentation slides
│
├── 📂 gateway/                                         ← Node.js API Gateway (port 3050)
├── 📂 frontend/                                        ← React SPA (port 5173)
│   ├── src/
│   │   ├── contexts/                                   ← Auth Context
│   │   ├── hooks/                                      ← useAuth, useApi, mocked useNotifications
│   │   ├── services/                                   ← API caller services
│   │   ├── components/
│   │   │   └── layout/                                 ← Layout components (ClinOpsShell, Sidebar, Navbar)
│   │   ├── pages/
│   │   │   ├── auth/                                   ← LoginPage.jsx
│   │   │   └── BlankDashboard.jsx                      ← Generic initialized slate component
│   │   ├── styles/                                     ← clinops.css stylesheet
│   │   └── App.jsx                                     ← Routes mapping all auth routes to BlankDashboard
│   ├── tailwind.config.js
│   └── package.json
│
├── 🟢 start.bat                                         ← Starts all servers
├── 🔴 stop.bat                                          ← Stops all servers
└── 📖 PROJECT_GUIDE.md                                  ← This file

---

## 🗄️ DATABASE SCHEMA (INITIAL STATE)

### 1. Table `roles`
- **Purpose**: Stores authorization roles.
- **Columns**:
  - `id` → Primary key
  - `name` → Role name (e.g. Directeur, Médecin)
  - `slug` → Unique identifier (admin, medecin, infirmier, secretaire, patient)
  - `description` → Description (nullable)

### 2. Table `users`
- **Purpose**: Stores credentials and role links.
- **Columns**:
  - `id` → Primary key
  - `first_name` → First name
  - `last_name` → Last name
  - `email` → Email (unique)
  - `password` → Hashed credentials
  - `role_id` → FK to `roles`
  - `phone` → Phone number (nullable)
  - `specialty` → Medical specialty (nullable)
  - `is_active` → Status boolean (default true)

---

## 🔌 API ENDPOINTS (INITIAL STATE)

METHOD | ROUTE | CONTROLLER@METHOD | WHAT IT DOES
-------|-------|-------------------|-------------
GET    | /api/health | callback | Simple health check
POST   | /api/register | AuthController@register | Register new user account
POST   | /api/login | AuthController@login | Login and get token
POST   | /api/auth/register | AuthController@register | Alias to register
POST   | /api/auth/login | AuthController@login | Alias to login
GET    | /api/me | AuthController@me | Get current user info (Sanctum)
POST   | /api/logout | AuthController@logout | Logout (Sanctum)
POST   | /api/auth/logout | AuthController@logout | Alias to logout

---

## 🎨 DESIGN SYSTEM
Dark theme — ClinOps style

Colors:
  --bg-base:      #0a0d12  ← Main background
  --bg-surface:   #0f1318  ← Cards and panels
  --bg-elevated:  #151a22  ← Hover states
  --bg-card:      #1a2030  ← Input backgrounds
  --border:       #232c3a  ← All borders
  --text-primary: #e8edf5  ← Main text
  --text-secondary:#8a96a8 ← Labels and metadata
  --accent-blue:  #3b82f6  ← Primary actions
  --accent-teal:  #14b8a6  ← Success states

Fonts:
  Inter       → Reading text
  JetBrains Mono → Numbers, IDs, timestamps, clock

---

## 📌 IMPORTANT NOTES FOR ANY AI WORKING ON THIS PROJECT

1. **The project runs WITHOUT Docker**
   Use XAMPP for MySQL only. Launch all servers using `start.bat`.

2. **All API calls go through the Gateway (port 3050)**
   Do not call the Laravel port (8000) directly.
   `Frontend:5173` → `Gateway:3050` → `Laravel:8000`.

3. **Design system is ClinOps dark theme**
   Never use white backgrounds or light themes. Always use CSS variables from `clinops.css` or Tailwind classes mapped in `tailwind.config.js`.

4. **Roles are strictly slug-based**:
   `admin`, `medecin`, `infirmier`, `secretaire`, `patient`.

5. **Clinic name is "Clinique Mounsif"**
   Ensure all layouts, branding, and text use "Clinique Mounsif — Casablanca, Maroc".

══════════════════════════════════
LAST UPDATED : 2026-06-20
PROJECT NAME : Clinique Mounsif
PROJECT STATUS : Clean Slate Initialized
══════════════════════════════════
