<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Inscription d'un nouvel utilisateur (par défaut rôle 'Patient' ou spécifié).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'role_slug' => 'nullable|string|exists:roles,slug', // Permet de spécifier le rôle lors du test
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        // Par défaut, un nouvel inscrit obtient le rôle 'patient'
        $roleSlug = $request->get('role_slug', 'patient');
        $role = Role::where('slug', $roleSlug)->first();

        if (!$role) {
            // Fallback si le rôle par défaut n'est pas encore configuré
            $role = Role::firstOrCreate(
                ['slug' => 'patient'],
                ['name' => 'Patient', 'description' => 'Rôle patient par défaut']
            );
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user' => $user->load('role'),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 'Utilisateur enregistré avec succès', 201);
    }

    /**
     * Connexion d'un utilisateur et génération du token Sanctum.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Données invalides', 422, $validator->errors()->toArray());
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Identifiants incorrects', 401);
        }

        if (!$user->is_active) {
            return $this->errorResponse('Compte désactivé. Veuillez contacter l\'administration.', 403);
        }

        // Chargement du rôle de l'utilisateur
        $user->load('role');

        // Création du token d'accès
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 'Connexion réussie', 200);
    }

    /**
     * Déconnexion de l'utilisateur (révocation du token actuel).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Révocation du jeton d'accès actuel
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Déconnexion réussie. Jeton révoqué.', 200);
    }

    /**
     * Informations sur l'utilisateur connecté.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');
        return $this->successResponse($user, 'Profil récupéré avec succès', 200);
    }
}
