<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from the following domains / hosts will receive stateful API
    | authentication cookies. Typically, these should include your local
    | and production domains which access your API via your frontend.
    |
    | Dépend de la variable d'environnement SANCTUM_STATEFUL_DOMAINS.
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:3050,localhost:5173,127.0.0.1,127.0.0.1:8000',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | This array contains the authentication guards that will be checked when
    | Sanctum is trying to authenticate a request. If none of these guards
    | are able to authenticate the request, Sanctum will use the default.
    |
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration des jetons (Token Expiration)
    |--------------------------------------------------------------------------
    |
    | Cette valeur définit la durée de validité (en minutes) de chaque jeton
    | d'accès émis (Personal Access Token). Par défaut, nous la limitons à
    | 480 minutes (8 heures) pour répondre aux critères de sécurité HDS.
    | Un script périodique (Scheduler) purge les jetons expirés via :
    | php artisan sanctum:prune-expired
    |
    */

    'expiration' => 480, // 480 minutes = 8 heures

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | When adjusting the bandwidth, you can customize the middleware
    | that Sanctum uses for checking session state or converting headers.
    |
    */

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

];
