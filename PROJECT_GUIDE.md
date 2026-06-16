# CLINIQUE MOUNSIF — PROJECT GUIDE
# For developers and AI assistants

## 🏥 PROJECT OVERVIEW
- Name : Clinique Mounsif
- Type : Private clinic management platform
- Location : Casablanca, Maroc
- Description : Secure web platform for managing patients, appointments, consultations, prescriptions and medical records for a private clinic.

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

## 📁 COMPLETE FOLDER STRUCTURE

hospital_mcd_laravel/
│
├── 📂 backend/                                         ← Laravel API (port 8000)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/                            ← API logic
│   │   │   │   ├── AppointmentController.php            ← Handles CRUD for appointments, doctor planning, and status updates
│   │   │   │   ├── AuthController.php                   ← Handles user registration, login, logout, and token management
│   │   │   │   ├── ConsultationController.php           ← Handles medical consultation records, observations, and billing tariff
│   │   │   │   ├── Controller.php                       ← Base Laravel controller class
│   │   │   │   ├── DashboardController.php              ← Handles dashboard status details or placeholder endpoints
│   │   │   │   ├── PatientController.php                ← Handles CRUD for patient records, search, and personal profile updates
│   │   │   │   └── PrescriptionController.php           ← Handles medical prescription records, dosage instructions, and active medication list
│   │   │   ├── Middleware/                             ← Auth + RBAC checks
│   │   │   │   ├── ForceHttps.php                       ← Redirects HTTP requests to secure HTTPS
│   │   │   │   ├── RoleMiddleware.php                   ← Restricts route access to users with authorized roles
│   │   │   │   └── SecurityHeaders.php                  ← Appends security-focused HTTP headers to protect against XSS
│   │   │   ├── Requests/                               ← Form validation
│   │   │   │   └── PatientRequest.php                   ← Implements validation rules for creating/editing patient records
│   │   │   └── Resources/                              ← JSON formatting
│   │   │       └── PatientResource.php                  ← Formats and serializes patient record JSON representations
│   │   ├── Models/                                     ← Database models
│   │   │   ├── Appointment.php                          ← Model mapping doctor-patient appointments, scheduled time, and status
│   │   │   ├── AuditLog.php                             ← Model logging database write actions (CREATE, UPDATE, DELETE) for clinical audits
│   │   │   ├── Consultation.php                         ← Model representing medical consultations, motifs, diagnostics, and fees
│   │   │   ├── ExamResult.php                           ← Model mapping clinical laboratory exams, PDF file paths, and doctor validations
│   │   │   ├── MedicalRecord.php                        ← Model representing patient general medical history, allergies, and treatments
│   │   │   ├── Patient.php                              ← Model mapping patient records, demographics, and relationship to user login accounts
│   │   │   ├── Prescription.php                         ← Model mapping drug prescriptions, statuses, and links to consultation events
│   │   │   ├── QueueEntry.php                           ← Model representing real-time patient queue entries
│   │   │   ├── Role.php                                 ← Model defining authorization roles (directeur, medecin, secretaire, etc.)
│   │   │   ├── TimelineEvent.php                        ← Model logging patient events to show in chronological timeline views
│   │   │   └── User.php                                 ← Model for clinic users, email credentials, specialties, and role relations
│   │   ├── Observers/                                  ← Lifecycle Observers
│   │   │   └── AuditLogObserver.php                     ← Intercepts model lifecycle events to write audit logs automatically
│   │   ├── Providers/                                  ← Service Providers
│   │   │   └── AppServiceProvider.php                   ← Configures application bootstrap, schema settings, and event listeners
│   │   └── Traits/                                     ← Shared logic
│   │       └── ApiResponse.php                          ← Reusable helper trait for consistent JSON formatting of success/error responses
│   ├── database/
│   │   ├── migrations/                                 ← Table definitions
│   │   │   ├── 0001_01_01_000001_create_cache_table.php ← Database cache table migration
│   │   │   ├── 0001_01_01_000002_create_jobs_table.php  ← Background queue jobs and failures table migration
│   │   │   ├── 2026_06_04_000001_create_roles_table.php ← Defines user roles table migration
│   │   │   ├── 2026_06_04_000002_create_users_table.php ← Defines users credentials, specialties, and role associations table migration
│   │   │   ├── 2026_06_04_000003_create_patients_table.php ← Defines patient demographic details and user accounts link migration
│   │   │   ├── 2026_06_04_000004_create_medical_records_table.php ← Defines patient folders for allergies, histories, and treatments migration
│   │   │   ├── 2026_06_04_000005_create_consultations_table.php ← Defines medical consultation reports, diagnoses, and fees migration
│   │   │   ├── 2026_06_04_000006_create_prescriptions_table.php ← Defines prescription forms and active statuses migration
│   │   │   ├── 2026_06_04_000007_create_appointments_table.php ← Defines appointment schedules, doctor planning, and statuses migration
│   │   │   ├── 2026_06_04_000008_create_exam_results_table.php ← Defines clinical lab test details and validation statuses migration
│   │   │   ├── 2026_06_04_000009_create_audit_logs_table.php ← Defines system activity audit trails migration
│   │   │   ├── 2026_06_06_214508_create_personal_access_tokens_table.php ← Database table for Laravel Sanctum auth tokens migration
│   │   │   ├── 2026_06_09_112604_create_queue_entries_table.php ← Database table for patient waiting queues migration
│   │   │   └── 2026_06_09_112605_create_timeline_events_table.php ← Database table for patient activity timelines migration
│   │   ├── seeders/                                    ← Test data seeders
│   │   │   ├── DashboardSeeder.php                      ← Seeds initial custom dashboard configurations
│   │   │   └── DatabaseSeeder.php                       ← Seeds roles, default Clinique Mounsif users, patients, and initial appointments
│   │   └── factories/                                  ← Fake data factories
│   │       ├── AppointmentFactory.php                   ← Generates fake appointment data for tests
│   │       ├── AuditLogFactory.php                      ← Generates fake system audit trails
│   │       ├── ConsultationFactory.php                  ← Generates fake medical consultation reports
│   │       ├── ExamResultFactory.php                    ← Generates fake lab test results
│   │       ├── MedicalRecordFactory.php                 ← Generates fake patient history files
│   │       ├── PatientFactory.php                       ← Generates fake patient demographic profiles
│   │       ├── PrescriptionFactory.php                  ← Generates fake drug prescriptions
│   │       ├── QueueEntryFactory.php                    ← Generates fake waiting queue records
│   │       ├── RoleFactory.php                          ← Generates fake user roles
│   │       ├── TimelineEventFactory.php                 ← Generates fake patient events
│   │       └── UserFactory.php                          ← Generates fake user credential entries
│   ├── routes/
│   │   └── api.php                                     ← ALL API routes
│   ├── .env                                            ← DB + App config
│   └── composer.json                                   ← PHP dependencies
│
├── 📂 gateway/                                         ← Node.js API Gateway (port 3050)
│   ├── src/
│   │   ├── index.js                                    ← Gateway entry point, loaders, and port setup
│   │   ├── middlewares/
│   │   │   ├── logger.js                               ← Formats and logs HTTP traffic using Winston and Morgan
│   │   │   ├── rateLimiter.js                          ← Enforces request limits for security
│   │   │   └── security.js                             ← Configures helmet headers and CORS rules
│   │   └── routes/
│   │       ├── docs.js                                 ← Serves the Swagger UI interactive API specification
│   │       └── proxy.js                                ← Proxies traffic and rate-limits API requests before Laravel routing
│   ├── .env                                            ← Gateway config file
│   └── package.json                                    ← Node dependencies
│
├── 📂 frontend/                                        ← React (port 5173)
│   ├── src/
│   │   ├── contexts/                                   ← Global state contexts
│   │   │   └── AuthContext.jsx                          ← Context providing login, logout, and role permission checks
│   │   ├── hooks/                                      ← Custom React hooks
│   │   │   ├── useApi.js                                ← Custom hook providing easy access to the Axios API instance
│   │   │   ├── useAuth.js                               ← Custom hook wrapping the global AuthContext
│   │   │   └── usePatients.js                           ← Custom hook to perform search and paginated patient lists
│   │   ├── services/                                   ← API callers
│   │   │   ├── api.js                                   ← Configures Axios client base URL and authorization interceptors
│   │   │   └── patientService.js                        ← Helper functions to interact with the backend patient endpoints
│   │   ├── components/
│   │   │   ├── layout/                                 ← Shell layout wrapper files
│   │   │   │   ├── ClinOpsShell.jsx                     ← Shell wrapping the Navbar, Sidebar, and inner dashboard views
│   │   │   │   ├── Layout.jsx                           ← Wrapper layout component to swap shells depending on path
│   │   │   │   ├── Navbar.jsx                           ← Navigation bar with current clinic brand header and profile actions
│   │   │   │   └── Sidebar.jsx                          ← Sidebar navigation menu displaying role-specific features
│   │   │   ├── common/                                 ← Reusable components
│   │   │   │   ├── Badge.jsx                            ← Status badge component with role/priority-colored styles
│   │   │   │   ├── ErrorMessage.jsx                     ← Styled component displaying error states
│   │   │   │   ├── LoadingSpinner.jsx                   ← Styled indicator showing loading states
│   │   │   │   ├── Pagination.jsx                       ← Reusable paginated footer element
│   │   │   │   └── ProtectedRoute.jsx                   ← Component restricting page access using role-checks
│   │   │   └── patients/
│   │   │       └── PatientForm.jsx                      ← Patient intake form component
│   │   ├── pages/
│   │   │   ├── auth/                                   ← Authentication pages
│   │   │   │   └── LoginPage.jsx                        ← Interactive login page using ClinOps dark theme styling
│   │   │   ├── admin/                                  ← Directeur pages
│   │   │   │   ├── AdminDashboard.jsx                   ← Main dashboard for Directeur with stats and user list
│   │   │   │   ├── AuditLogs.jsx                        ← Audit logs viewer page
│   │   │   │   ├── ClinicalDashboard.html               ← Legacy dashboard mockup layout
│   │   │   │   └── dashboard/                           ← ❌ (Empty directory)
│   │   │   ├── medecin/                                ← Doctor pages
│   │   │   │   ├── MedecinDashboard.jsx                 ← Main dashboard for Doctor with today's appointments and planning
│   │   │   │   ├── NewConsultation.jsx                  ← Page to input medical consultations and prescribe drugs
│   │   │   │   ├── PatientDetail.jsx                    ← Fiche patient detailing past consults and history
│   │   │   │   └── PatientsList.jsx                     ← Paginated patient list with clinical search capabilities
│   │   │   ├── infirmier/                              ← Nurse pages
│   │   │   │   └── InfirmierDashboard.jsx               ← Nurse view to see patient vitals and record nursing logs
│   │   │   ├── secretaire/                             ← Secretary pages
│   │   │   │   └── SecretaireDashboard.jsx              ← Secretary reception dashboard with appointment booking and check-in
│   │   │   └── patient/                                ← Patient pages
│   │   │       └── PatientDashboard.jsx                 ← Patient portal with appointments list and prescription files
│   │   ├── styles/                                     ← CSS styles
│   │   ├── App.jsx                                     ← React App routing definition
│   │   └── main.jsx                                    ← React DOM entry point
│   ├── tailwind.config.js                               ← Tailwind configurations
│   ├── vite.config.js                                  ← Vite bundler configurations
│   └── package.json                                    ← Node dependencies
│
├── 📂 backend_old/                                     ← Old backup (ignore)
├── 📂 frontend_redesign/                               ← Redesign layout files (ignore)
├── 🟢 start.bat                                         ← Starts all servers
├── 🔴 stop.bat                                          ← Stops all servers
├── ⚙️  install.bat                                      ← First time setup
└── 📖 PROJECT_GUIDE.md                                  ← This file

## 🗄️ DATABASE SCHEMA

### 1. Table `roles`
- **Purpose**: Stores authorization roles for users.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `name` → Role name (e.g. Directeur, Médecin)
  - `slug` → Unique identifier slug (directeur, medecin, infirmier, secretaire, patient)
  - `description` → Role description (nullable)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Has many `users`

### 2. Table `users`
- **Purpose**: Stores clinical staff members and general user accounts.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `first_name` → First name
  - `last_name` → Last name
  - `email` → Email address (unique)
  - `password` → Hashed credentials password
  - `role_id` → FK to `roles` (restrict on delete)
  - `phone` → Phone number (nullable)
  - `specialty` → Doctor's medical specialty (nullable)
  - `is_active` → Status boolean (default true)
  - `remember_token` → Standard Laravel token (nullable)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `Role`
  - Has one `Patient` (nullable)
  - Has many `Appointments` (as doctor)
  - Has many `Consultations` (as doctor)
  - Has many `Prescriptions` (as doctor)

### 3. Table `patients`
- **Purpose**: Stores patient records and demographic details.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `user_id` → FK to `users` (nullable, unique, for patient portal log-in)
  - `social_security_number` → National health ID / SSN (unique)
  - `date_of_birth` → Date of birth
  - `gender` → Enum ('M', 'F', 'Autre')
  - `address` → Home address (nullable)
  - `phone` → Phone number (nullable)
  - `blood_type` → Enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') (nullable)
  - `emergency_contact_name` → Emergency contact name (nullable)
  - `emergency_contact_phone` → Emergency contact phone (nullable)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `User` (nullable)
  - Has one `MedicalRecord`
  - Has many `Appointments`
  - Has many `Consultations`
  - Has many `Prescriptions`
  - Has many `ExamResults`

### 4. Table `medical_records`
- **Purpose**: Stores clinical backgrounds and persistent health folders.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `patient_id` → FK to `patients` (unique, cascade on delete)
  - `allergies` → Persistent patient allergies list (nullable text)
  - `medical_history` → Patient's past medical history / antécédents (nullable text)
  - `family_history` → Patient's family medical history (nullable text)
  - `current_treatments` → Currently active clinical treatments list (nullable text)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `Patient`

### 5. Table `consultations`
- **Purpose**: Stores clinical reports of patient consultation sessions.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `patient_id` → FK to `patients` (cascade on delete)
  - `doctor_id` → FK to `users` (restrict on delete)
  - `date_consultation` → Date and time of consultation
  - `motif` → Primary consultation motif / symptom reason
  - `symptoms` → Detailed symptoms list (nullable text)
  - `diagnostic` → Formal clinical diagnosis (nullable text)
  - `observations` → General clinical notes / observations (nullable text)
  - `tarif` → Billing tariff fee (decimal, nullable)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `Patient`
  - Belongs to `User` (doctor)
  - Has many `Prescriptions`
  - Has many `ExamResults`

### 6. Table `prescriptions`
- **Purpose**: Stores medical drug prescriptions.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `consultation_id` → FK to `consultations` (nullable, set null on delete)
  - `patient_id` → FK to `patients` (cascade on delete)
  - `doctor_id` → FK to `users` (restrict on delete)
  - `date_prescription` → Date of prescription
  - `status` → Enum ('Active', 'Terminée', 'Annulée') (default 'Active')
  - `content` → Prescribed medications list and posologies (text)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `Patient`
  - Belongs to `User` (doctor)
  - Belongs to `Consultation` (nullable)

### 7. Table `appointments`
- **Purpose**: Stores planned scheduled visits.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `patient_id` → FK to `patients` (cascade on delete)
  - `doctor_id` → FK to `users` (restrict on delete)
  - `date_heure` → Scheduled date and time
  - `status` → Enum ('Planifié', 'Confirmé', 'Annulé', 'Honoré', 'Non Honoré') (default 'Planifié')
  - `motif` → Appointment motif (nullable string)
  - `notes` → Front desk notes / nurse details (nullable text)
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `Patient`
  - Belongs to `User` (doctor)

### 8. Table `exam_results`
- **Purpose**: Stores clinical laboratory test findings.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `patient_id` → FK to `patients` (cascade on delete)
  - `consultation_id` → FK to `consultations` (nullable, set null on delete)
  - `doctor_id` → FK to `users` (restrict on delete)
  - `type_examen` → Examination type (e.g. Sanguin, Radiologie)
  - `date_examen` → Exam date and time
  - `results` → Clinical test findings text
  - `file_path` → Server path to result documents / PDFs (nullable string)
  - `status` → Enum ('En attente', 'Disponible', 'Validé') (default 'En attente')
  - `created_at` / `updated_at` → Timestamps
- **Relations**:
  - Belongs to `Patient`
  - Belongs to `User` (doctor)
  - Belongs to `Consultation` (nullable)

### 9. Table `audit_logs`
- **Purpose**: Immutably registers all model modifications for system security audits.
- **Columns**:
  - `id` → Primary key (auto increment)
  - `user_id` → FK to `users` (nullable, set null on delete)
  - `action` → Action tag (e.g. CREATE, UPDATE, DELETE)
  - `table_affected` → Name of SQL table affected (e.g. patients)
  - `record_id` → ID of target record (nullable)
  - `old_values` → JSON map of values before update (nullable)
  - `new_values` → JSON map of values after update (nullable)
  - `ip_address` → IP address of requester (nullable)
  - `user_agent` → Browser agent of requester (nullable)
  - `created_at` → Timestamp (useCurrent)
- **Relations**:
  - Belongs to `User` (nullable)

### 10. Table `queue_entries`
- **Purpose**: Tracks patient waiting list entries (placeholder).
- **Columns**:
  - `id` → Primary key (auto increment)
  - `created_at` / `updated_at` → Timestamps

### 11. Table `timeline_events`
- **Purpose**: Tracks patient clinic activity timelines (placeholder).
- **Columns**:
  - `id` → Primary key (auto increment)
  - `created_at` / `updated_at` → Timestamps

---

## 🔌 API ENDPOINTS

METHOD | ROUTE | CONTROLLER@METHOD | ROLES | WHAT IT DOES
-------|-------|-------------------|-------|-------------
GET    | /api/health | callback | public | Simple health check
POST   | /api/register | AuthController@register | public | Register user/patient account
POST   | /api/login | AuthController@login | public | Login to get sanctum token
POST   | /api/auth/register | AuthController@register | public | Alias to register patient
POST   | /api/auth/login | AuthController@login | public | Alias to login
GET    | /api/me | AuthController@me | authenticated | Get authenticated user info
POST   | /api/logout | AuthController@logout | authenticated | Revoke token and logout
POST   | /api/auth/logout | AuthController@logout | authenticated | Alias to logout
GET    | /api/admin/stats | callback | directeur | Get clinic dashboard stats
GET    | /api/admin/users | callback | directeur | List all clinical staff members
GET    | /api/admin/audit-logs | callback | directeur | Paginate system security audit logs
GET    | /api/admin/patients | PatientController@index | directeur | List patients (admin context)
POST   | /api/admin/patients | PatientController@store | directeur | Create patient (admin context)
GET    | /api/admin/patients/{patient} | PatientController@show | directeur | Get patient details (admin context)
PUT    | /api/admin/patients/{patient} | PatientController@update | directeur | Edit patient details (admin context)
DELETE | /api/admin/patients/{patient} | PatientController@destroy | directeur | Delete patient record
GET    | /api/admin/appointments | AppointmentController@index | directeur | List appointments (admin context)
POST   | /api/admin/appointments | AppointmentController@store | directeur | Schedule appointment (admin context)
GET    | /api/admin/appointments/{appointment} | AppointmentController@show | directeur | Get appointment details (admin context)
PUT    | /api/admin/appointments/{appointment} | AppointmentController@update | directeur | Edit appointment details (admin context)
DELETE | /api/admin/appointments/{appointment} | AppointmentController@destroy | directeur | Delete appointment record
GET    | /api/admin/consultations | ConsultationController@index | directeur | List consultations (admin context)
POST   | /api/admin/consultations | ConsultationController@store | directeur | Record consultation (admin context)
GET    | /api/admin/consultations/{consultation} | ConsultationController@show | directeur | Get consultation details (admin context)
PUT    | /api/admin/consultations/{consultation} | ConsultationController@update | directeur | Edit consultation details (admin context)
DELETE | /api/admin/consultations/{consultation} | ConsultationController@destroy | directeur | Delete consultation record
GET    | /api/admin/prescriptions | PrescriptionController@index | directeur | List prescriptions (admin context)
POST   | /api/admin/prescriptions | PrescriptionController@store | directeur | Record prescription (admin context)
GET    | /api/admin/prescriptions/{prescription} | PrescriptionController@show | directeur | Get prescription details (admin context)
PUT    | /api/admin/prescriptions/{prescription} | PrescriptionController@update | directeur | Edit prescription details (admin context)
DELETE | /api/admin/prescriptions/{prescription} | PrescriptionController@destroy | directeur | Delete prescription record
GET    | /api/medecin/patients | PatientController@index | medecin | List patient directories
GET    | /api/medecin/patients/{patient} | PatientController@show | medecin | View specific patient clinical folder
GET    | /api/medecin/appointments | AppointmentController@index | medecin | Get list of doctor's own appointments
GET    | /api/medecin/appointments/{appointment} | AppointmentController@show | medecin | Get specific appointment details
PUT    | /api/medecin/appointments/{appointment} | AppointmentController@update | medecin | Edit appointment (status/notes updates)
GET    | /api/medecin/consultations | ConsultationController@index | medecin | List doctor's own consultation reports
GET    | /api/medecin/consultations/{consultation} | ConsultationController@show | medecin | View specific consultation details
POST   | /api/medecin/consultations | ConsultationController@store | medecin | Store a new consultation report
PUT    | /api/medecin/consultations/{consultation} | ConsultationController@update | medecin | Edit an existing consultation report
GET    | /api/medecin/prescriptions | PrescriptionController@index | medecin | List doctor's own prescriptions
GET    | /api/medecin/prescriptions/{prescription} | PrescriptionController@show | medecin | View specific prescription details
POST   | /api/medecin/prescriptions | PrescriptionController@store | medecin | Store a new patient drug prescription
PUT    | /api/medecin/prescriptions/{prescription} | PrescriptionController@update | medecin | Edit an existing prescription
GET    | /api/secretaire/patients | PatientController@index | secretaire | List patients (reception context)
GET    | /api/secretaire/patients/{patient} | PatientController@show | secretaire | View patient details (no medical details)
POST   | /api/secretaire/patients | PatientController@store | secretaire | Register a new patient profile
PUT    | /api/secretaire/patients/{patient} | PatientController@update | secretaire | Edit patient contact details
GET    | /api/secretaire/appointments | AppointmentController@index | secretaire | List clinic appointments
GET    | /api/secretaire/appointments/{appointment} | AppointmentController@show | secretaire | View specific appointment details
POST   | /api/secretaire/appointments | AppointmentController@store | secretaire | Create a new patient appointment booking
PUT    | /api/secretaire/appointments/{appointment} | AppointmentController@update | secretaire | Update appointment (status, time, motif)
GET    | /api/secretaire/doctors | callback | secretaire | Get list of active doctors for booking dropdown
GET    | /api/patient/profile/{patient} | PatientController@show | patient | View patient's own profile card
PUT    | /api/patient/profile/{patient} | PatientController@update | patient | Update patient's own contact number/address
GET    | /api/patient/prescriptions | PrescriptionController@index | patient | List patient's own historical prescriptions
GET    | /api/patient/prescriptions/{prescription} | PrescriptionController@show | patient | View patient's own specific prescription details
GET    | /api/patient/appointments | AppointmentController@index | patient | List patient's own scheduled appointments
GET    | /api/patient/appointments/{appointment} | AppointmentController@show | patient | View patient's own specific appointment details
PUT    | /api/patient/appointments/{appointment}/cancel | callback | patient | Cancel patient's own appointment
GET    | /api/infirmier/patients | PatientController@index | infirmier | View patient list (nursing context)
GET    | /api/infirmier/appointments | AppointmentController@index | infirmier | View appointments list (nursing context)

---

## 🎨 DESIGN SYSTEM
Dark theme — ClinOps style

Colors :
  --bg-base:      #0a0d12  ← Main background
  --bg-surface:   #0f1318  ← Cards and panels
  --bg-elevated:  #151a22  ← Hover states
  --bg-card:      #1a2030  ← Input backgrounds
  --border:       #232c3a  ← All borders
  --text-primary: #e8edf5  ← Main text
  --text-secondary:#8a96a8 ← Labels and metadata
  --accent-blue:  #3b82f6  ← Primary actions
  --accent-teal:  #14b8a6  ← Success states
  --urgent:       #ef4444  ← Urgent/danger
  --waiting:      #f97316  ← Warning
  --stable:       #22c55e  ← Success/stable
  --new:          #a855f7  ← New items

Fonts :
  Inter       → All text
  JetBrains Mono → Numbers, IDs, timestamps, clock

Roles colors :
  directeur  → #ef4444 (red)
  medecin    → #3b82f6 (blue)
  infirmier  → #14b8a6 (teal)
  secretaire → #f97316 (orange)
  patient    → #a855f7 (purple)

## ➕ HOW TO ADD A NEW FEATURE
Step by step for any developer or AI :

Example : Adding a "Billing" module

BACKEND (5 steps) :
1. php artisan make:migration create_bills_table
   → Edit file in database/migrations/
2. php artisan make:model Bill
   → Edit app/Models/Bill.php
   → Add fillable, relations, casts
3. php artisan make:controller BillController --api
   → Edit app/Http/Controllers/BillController.php
   → Add index, store, show, update, destroy
4. Add routes in routes/api.php :
   Route::middleware(['auth:sanctum','role:directeur'])
     ->group(function() {
       Route::apiResource('bills', BillController::class);
     });
5. php artisan migrate

FRONTEND (4 steps) :
1. Create src/pages/admin/Billing.jsx
   → Use ClinOps dark style
   → Import api from services/api.js
2. Add route in App.jsx :
   <Route path="/admin/billing" element={
     <ProtectedRoute allowedRoles={['directeur']}>
       <Billing />
     </ProtectedRoute>
   } />
3. Add navigation in ClinOpsShell.jsx :
   Add to directeur nav items array
4. npm run dev to test

## ✅ CURRENT STATUS

COMPLETED :
✅ Database migrations for 11 core tables (`roles`, `users`, `patients`, `medical_records`, `consultations`, `prescriptions`, `appointments`, `exam_results`, `audit_logs`, `queue_entries`, `timeline_events`)
✅ Laravel authentication (Sanctum) with dual endpoint configuration (`/api/login` and `/api/auth/login`)
✅ Custom Role-Based Access Control (RBAC) supporting 5 roles
✅ Complete API REST structure for all dashboard views
✅ Node.js API Gateway + Swagger Documentation served at `http://localhost:3050/api/docs`
✅ React frontend with dark theme matching the ClinOps design system
✅ Directeur dashboard (AdminDashboard.jsx) with stats and doctor specialties
✅ Médecin dashboard (MedecinDashboard.jsx) with full clinical consultations manager
✅ Secrétaire dashboard (SecretaireDashboard.jsx) with agenda scheduling and check-ins
✅ Infirmier dashboard (InfirmierDashboard.jsx) with vital signs logging
✅ Patient dashboard (PatientDashboard.jsx) with medical prescriptions view
✅ Full E2E verification test suite (`test_all.ps1`)

IN PROGRESS :
- None

TODO / MISSING :
- None

## 📋 COPY-PASTE SNIPPETS

SNIPPET 1 — New Laravel API endpoint :
// In routes/api.php
Route::middleware(['auth:sanctum', 'role:medecin'])
  ->group(function () {
    Route::get('/my-endpoint', [MyController::class, 'index']);
    Route::post('/my-endpoint', [MyController::class, 'store']);
});

// In MyController.php
public function index(Request $request)
{
    $data = MyModel::where('user_id', auth()->id())
                   ->paginate(10);
    return response()->json([
        'success' => true,
        'data' => $data
    ]);
}

SNIPPET 2 — New protected React page :
// In App.jsx - add this route :
<Route path="/medecin/my-page" element={
  <ProtectedRoute allowedRoles={['medecin']}>
    <MyPage />
  </ProtectedRoute>
} />

// MyPage.jsx structure :
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MyPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-endpoint')
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '18px 20px' }}>
      {loading ? (
        <div style={{ 
          background: '#1a2030', 
          height: 200, 
          borderRadius: 8 
        }} />
      ) : (
        <div>{/* your content */}</div>
      )}
    </div>
  );
};
export default MyPage;

SNIPPET 3 — Add permission to a role :
// In a seeder or tinker :
$role = Role::findByName('secretaire');
$permission = Permission::create(['name' => 'bills.view']);
$role->givePermissionTo($permission);

// Check in controller :
if (!auth()->user()->can('bills.view')) {
    return response()->json(['message' => 'Forbidden'], 403);
}

## 🔧 TROUBLESHOOTING

ERROR : "Could not open input file: artisan"
CAUSE : Wrong directory
FIX   : cd hospital_mcd_laravel\backend

ERROR : "SQLSTATE[HY000] Connection refused"
CAUSE : MySQL not running
FIX   : Open XAMPP → Start MySQL

ERROR : "401 Unauthorized"
CAUSE : Token missing or expired
FIX   : Logout and login again in the browser

ERROR : "403 Forbidden"  
CAUSE : User role doesn't have permission
FIX   : Check routes/api.php middleware for that route

ERROR : Blank white screen on React page
CAUSE : Import error or missing component
FIX   : Open browser DevTools → Console → fix the error

ERROR : "Cross-Origin Request Blocked"
CAUSE : CORS not configured for this origin
FIX   : Add http://localhost:5173 to gateway/.env
        ALLOWED_ORIGINS=http://localhost:5173

ERROR : "php is not recognized"
CAUSE : PHP not in Windows PATH
FIX   : Use full path D:\xampp\php\php.exe artisan ...

ERROR : Gateway shows 502 Bad Gateway
CAUSE : Laravel server not running
FIX   : Start Laravel : php artisan serve --port=8000

ERROR : Vite hot reload not working
CAUSE : File watcher issue on Windows
FIX   : Stop and restart npm run dev

ERROR : "Token has been blacklisted"
CAUSE : User logged out but token still used
FIX   : Clear localStorage and login again

## 📌 IMPORTANT NOTES FOR ANY AI WORKING ON THIS PROJECT

1. ALWAYS use full PHP path : D:\xampp\php\php.exe
   Never just "php" — it won't work on this machine

2. The project runs WITHOUT Docker
   Use XAMPP for MySQL only
   Use start.bat to launch everything

3. All API calls go through Gateway (port 3050)
   NOT directly to Laravel (port 8000)
   Frontend → Gateway:3050 → Laravel:8000

4. Design system is ClinOps dark theme
   NEVER use white backgrounds or light themes
   ALWAYS use CSS variables from clinops.css

5. Roles are : directeur, medecin, infirmier, secretaire, patient
   NOT : admin, doctor, nurse, staff

6. Clinic name is "Clinique Mounsif"
   NEVER write "Al Shifa", "MediSys", or "ClinOps"

7. When creating React components :
   - Always handle loading state
   - Always handle error state
   - Always use ClinOps color variables
   - Never use hardcoded colors

8. When creating Laravel controllers :
   - Always use ApiResponse trait
   - Always validate with Form Requests
   - Always check RBAC permissions
   - Always log sensitive actions to audit_logs

══════════════════════════════════
LAST UPDATED : 2026-06-16 12:55:53 UTC
PROJECT NAME : Clinique Mounsif
PROJECT STATUS : In Development
CLINIC : Clinique Mounsif — Casablanca, Maroc
NEXT STEP : Ready for production testing and final user acceptance review.
STUDENT : [Ask user for name / TO BE FILLED]
══════════════════════════════════
