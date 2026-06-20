<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\ApiResponse;

class RoleMiddleware
{
    use ApiResponse;

    /**
     * Gère une requête entrante en vérifiant si l'utilisateur possède l'un des rôles requis.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles Slugs des rôles autorisés (ex: 'admin', 'medecin')
     * @return Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // Vérification de la connexion de l'utilisateur, de son activité et de la correspondance de son rôle
        if (!$user || !$user->is_active || !$user->role || !in_array($user->role->slug, $roles)) {
            return $this->errorResponse(
                'Accès non autorisé : privilèges insuffisants ou compte inactif.',
                403,
                ['role' => ['Votre profil ne possède pas les autorisations nécessaires pour effectuer cette action.']]
            );
        }

        return $next($request);
    }
}
