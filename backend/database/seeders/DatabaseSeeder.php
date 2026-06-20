<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
            [
                'first_name' => 'Directeur',
                'last_name'  => 'Mounsif',
                'email'      => 'admin@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $adminId,
                'phone'      => '0600000001',
                'specialty'  => null,
                'is_active'  => true,
            ],
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
                'first_name' => 'Pierre',
                'last_name'  => 'Martin',
                'email'      => 'patient@example.com',
                'password'   => Hash::make('password'),
                'role_id'    => $patientId,
                'phone'      => '0600000004',
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

        $this->command->info('✅ Roles and the 5 default test users seeded successfully.');
        $this->command->info('   admin@example.com       (Directeur) / password');
        $this->command->info('   medecin@example.com     (Médecin) / password');
        $this->command->info('   infirmier@example.com   (Infirmier) / password');
        $this->command->info('   secretaire@example.com  (Secrétaire) / password');
        $this->command->info('   patient@example.com     (Patient) / password');
    }
}
