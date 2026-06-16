<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Gère une requête entrante en injectant les en-têtes HTTP de sécurité recommandés pour la production.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Injection des en-têtes HTTP de sécurité pour atténuer les vulnérabilités courantes
        $response->headers->set('X-Frame-Options', 'DENY'); // Protection contre le Clickjacking
        $response->headers->set('X-Content-Type-Options', 'nosniff'); // Évite le reniflage de type MIME
        $response->headers->set('X-XSS-Protection', '1; mode=block'); // Filtre XSS du navigateur
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Contrôle le referrer envoyé
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()'); // Désactive l'accès matériel
        
        // Content Security Policy (CSP) stricte pour l'API
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';");

        return $response;
    }
}
