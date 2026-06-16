<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Force la redirection en HTTPS si l'environnement est configuré en production.
     * Utile si l'application est directement exposée sans reverse proxy externe gérant le SSL.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Redirige uniquement en environnement de production si la requête n'est pas sécurisée (HTTP)
        if (config('app.env') === 'production' && !$request->secure()) {
            return redirect()->secure($request->getRequestUri());
        }

        return $next($request);
    }
}
