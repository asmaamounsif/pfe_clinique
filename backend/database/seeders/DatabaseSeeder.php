<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. Roles ──────────────────────────────────────────────
        $roles = [
            ['name' => 'Directeur',       'slug' => 'admin',      'description' => 'Directeur de la clinique'],
            ['name' => 'Médecin',        'slug' => 'medecin',    'description' => 'Médecin praticien'],
            ['name' => 'Infirmier',      'slug' => 'infirmier',  'description' => 'Personnel infirmier'],
            ['name' => 'Secrétaire',     'slug' => 'secretaire', 'description' => 'Secrétariat et accueil'],
            ['name' => 'Patient',        'slug' => 'patient',    'description' => 'Patient de la clinique'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['slug' => $role['slug']], array_merge($role, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $adminId      = DB::table('roles')->where('slug', 'admin')->value('id');
        $medecinId    = DB::table('roles')->where('slug', 'medecin')->value('id');
        $infirmierId  = DB::table('roles')->where('slug', 'infirmier')->value('id');
        $secretaireId = DB::table('roles')->where('slug', 'secretaire')->value('id');
        $patientId    = DB::table('roles')->where('slug', 'patient')->value('id');

        // ── 2. Users ──────────────────────────────────────────────
        $users = [
            // 1 Directeur
            [
                'first_name' => 'Directeur',
                'last_name'  => 'Al Shifa',
                'email'      => 'admin@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $adminId,
                'phone'      => '0600000001',
                'specialty'  => null,
                'is_active'  => true,
            ],
            // 5 Doctors with specialties
            [
                'first_name' => 'Jean',
                'last_name'  => 'Dupont',
                'email'      => 'medecin@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $medecinId,
                'phone'      => '0600000002',
                'specialty'  => 'Médecine générale',
                'is_active'  => true,
            ],
            [
                'first_name' => 'Karim',
                'last_name'  => 'Alaoui',
                'email'      => 'medecin2@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $medecinId,
                'phone'      => '0600000012',
                'specialty'  => 'Cardiologie',
                'is_active'  => true,
            ],
            [
                'first_name' => 'Sofia',
                'last_name'  => 'Bensouda',
                'email'      => 'medecin3@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $medecinId,
                'phone'      => '0600000013',
                'specialty'  => 'Pédiatrie',
                'is_active'  => true,
            ],
            [
                'first_name' => 'Youssef',
                'last_name'  => 'El Amrani',
                'email'      => 'medecin4@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $medecinId,
                'phone'      => '0600000014',
                'specialty'  => 'Gynécologie',
                'is_active'  => true,
            ],
            [
                'first_name' => 'Leila',
                'last_name'  => 'Meziane',
                'email'      => 'medecin5@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $medecinId,
                'phone'      => '0600000015',
                'specialty'  => 'Dermatologie',
                'is_active'  => true,
            ],
            // 3 Nurses
            [
                'first_name' => 'Marie',
                'last_name'  => 'Curie',
                'email'      => 'infirmier@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $infirmierId,
                'phone'      => '0600000003',
                'specialty'  => null,
                'is_active'  => true,
            ],
            [
                'first_name' => 'Ahmed',
                'last_name'  => 'Tazi',
                'email'      => 'infirmier2@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $infirmierId,
                'phone'      => '0600000023',
                'specialty'  => null,
                'is_active'  => true,
            ],
            [
                'first_name' => 'Sarah',
                'last_name'  => 'Lahlou',
                'email'      => 'infirmier3@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $infirmierId,
                'phone'      => '0600000033',
                'specialty'  => null,
                'is_active'  => true,
            ],
            // 2 Secrétaires
            [
                'first_name' => 'Fatima',
                'last_name'  => 'Zahra',
                'email'      => 'secretaire@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $secretaireId,
                'phone'      => '0600000005',
                'specialty'  => null,
                'is_active'  => true,
            ],
            [
                'first_name' => 'Khalid',
                'last_name'  => 'Naciri',
                'email'      => 'secretaire2@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $secretaireId,
                'phone'      => '0600000025',
                'specialty'  => null,
                'is_active'  => true,
            ],
            // 1 Patient Account
            [
                'first_name' => 'Pierre',
                'last_name'  => 'Martin',
                'email'      => 'patient@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $patientId,
                'phone'      => '0600000004',
                'specialty'  => null,
                'is_active'  => true,
            ],
            // Additional Patients for realistic agenda
            [
                'first_name' => 'Rachid',
                'last_name'  => 'El Alami',
                'email'      => 'rachid@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $patientId,
                'phone'      => '0611223344',
                'specialty'  => null,
                'is_active'  => true,
            ],
            [
                'first_name' => 'Nadia',
                'last_name'  => 'Mansouri',
                'email'      => 'nadia@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $patientId,
                'phone'      => '0622334455',
                'specialty'  => null,
                'is_active'  => true,
            ],
            [
                'first_name' => 'Sami',
                'last_name'  => 'Fassi',
                'email'      => 'sami@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $patientId,
                'phone'      => '0633445566',
                'specialty'  => null,
                'is_active'  => true,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(['email' => $user['email']], array_merge($user, [
                'remember_token' => null,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]));
        }

        // Fetch User IDs for Patient seeding
        $pierreUserId = DB::table('users')->where('email', 'patient@example.com')->value('id');
        $rachidUserId = DB::table('users')->where('email', 'rachid@example.com')->value('id');
        $nadiaUserId = DB::table('users')->where('email', 'nadia@example.com')->value('id');
        $samiUserId = DB::table('users')->where('email', 'sami@example.com')->value('id');

        // ── 3. Patients Table ──────────────────────────────────────
        $patients = [
            [
                'user_id' => $pierreUserId,
                'social_security_number' => '190010203040',
                'date_of_birth' => '1990-05-12',
                'gender' => 'M',
                'address' => 'Casablanca, Anfa',
                'phone' => '0600000004',
                'blood_type' => 'O+',
                'emergency_contact_name' => 'Marie Martin',
                'emergency_contact_phone' => '0611111111',
            ],
            [
                'user_id' => $rachidUserId,
                'social_security_number' => '182050987654',
                'date_of_birth' => '1982-11-23',
                'gender' => 'M',
                'address' => 'Casablanca, Maarif',
                'phone' => '0611223344',
                'blood_type' => 'A+',
                'emergency_contact_name' => 'Laila El Alami',
                'emergency_contact_phone' => '0622222222',
            ],
            [
                'user_id' => $nadiaUserId,
                'social_security_number' => '188040765432',
                'date_of_birth' => '1988-04-15',
                'gender' => 'F',
                'address' => 'Casablanca, Gauthier',
                'phone' => '0622334455',
                'blood_type' => 'B-',
                'emergency_contact_name' => 'Omar Mansouri',
                'emergency_contact_phone' => '0633333333',
            ],
            [
                'user_id' => $samiUserId,
                'social_security_number' => '195070543210',
                'date_of_birth' => '1995-07-07',
                'gender' => 'M',
                'address' => 'Casablanca, Bourgogne',
                'phone' => '0633445566',
                'blood_type' => 'AB+',
                'emergency_contact_name' => 'Karim Fassi',
                'emergency_contact_phone' => '0644444444',
            ],
        ];

        foreach ($patients as $p) {
            DB::table('patients')->updateOrInsert(['social_security_number' => $p['social_security_number']], array_merge($p, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Fetch Doctor and Patient IDs for Appointments
        $docGeneralId = DB::table('users')->where('email', 'medecin@example.com')->value('id');
        $docCardioId  = DB::table('users')->where('email', 'medecin2@example.com')->value('id');
        $docPedId     = DB::table('users')->where('email', 'medecin3@example.com')->value('id');

        $pierrePatientId = DB::table('patients')->where('user_id', $pierreUserId)->value('id');
        $rachidPatientId = DB::table('patients')->where('user_id', $rachidUserId)->value('id');
        $nadiaPatientId  = DB::table('patients')->where('user_id', $nadiaUserId)->value('id');
        $samiPatientId   = DB::table('patients')->where('user_id', $samiUserId)->value('id');

        // ── 4. Appointments Table (Today's agenda) ─────────────────
        $today = Carbon::today();

        $appointments = [
            [
                'patient_id' => $pierrePatientId,
                'doctor_id'  => $docGeneralId,
                'date_heure' => $today->copy()->hour(9)->minute(30)->toDateTimeString(),
                'status'     => 'Confirmé',
                'motif'      => 'Consultation de routine',
                'notes'      => 'Patient se plaint de fatigue légère',
            ],
            [
                'patient_id' => $rachidPatientId,
                'doctor_id'  => $docCardioId,
                'date_heure' => $today->copy()->hour(10)->minute(45)->toDateTimeString(),
                'status'     => 'Planifié',
                'motif'      => 'Suivi cardiologique',
                'notes'      => 'Bilan annuel après pose de stent',
            ],
            [
                'patient_id' => $nadiaPatientId,
                'doctor_id'  => $docPedId,
                'date_heure' => $today->copy()->hour(14)->minute(15)->toDateTimeString(),
                'status'     => 'Planifié',
                'motif'      => 'Vaccination enfant',
                'notes'      => 'Rappel DT Polio pour le bébé',
            ],
            [
                'patient_id' => $samiPatientId,
                'doctor_id'  => $docGeneralId,
                'date_heure' => $today->copy()->hour(16)->minute(00)->toDateTimeString(),
                'status'     => 'Annulé',
                'motif'      => 'Certificat d aptitude sportive',
                'notes'      => 'Annulé par le patient ce matin',
            ],
        ];

        foreach ($appointments as $app) {
            DB::table('appointments')->insert(array_merge($app, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('✅ Roles, Clinique Al Shifa users, patients, and today\'s appointments seeded successfully.');
        $this->command->info('   admin@example.com       (Directeur) / password');
        $this->command->info('   medecin@example.com     (Généraliste) / password');
        $this->command->info('   medecin2@example.com    (Cardiologue) / password');
        $this->command->info('   infirmier@example.com   (Infirmier) / password');
        $this->command->info('   secretaire@example.com  (Secrétaire) / password');
        $this->command->info('   patient@example.com     (Patient) / password');
    }
}
