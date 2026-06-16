<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Retourne une réponse de succès au format standardisé JSON.
     *
     * @param mixed $data Données de réponse
     * @param string|null $message Message de statut
     * @param int $code Code statut HTTP (par défaut 200)
     * @return JsonResponse
     */
    protected function successResponse($data, string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null
        ], $code);
    }

    /**
     * Retourne une réponse d'erreur au format standardisé JSON.
     *
     * @param string $message Message d'erreur principal
     * @param int $code Code statut HTTP (ex: 401, 403, 404, 422)
     * @param array $errors Liste des erreurs détaillées (de validation ou système)
     * @return JsonResponse
     */
    protected function errorResponse(string $message, int $code, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors
        ], $code);
    }
}
