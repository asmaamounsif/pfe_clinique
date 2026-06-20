<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Crée une nouvelle notification pour un utilisateur.
     * 
     * @param int $userId ID de l'utilisateur qui reçoit la notification
     * @param string $type Type de notification (nouveau_rdv, rdv_confirme, etc.)
     * @param string $title Titre court de la notification
     * @param string $message Corps de la notification
     * @param array $data Données supplémentaires (optionnel)
     * @return Notification
     */
    public static function send($userId, $type, $title, $message, $data = [])
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
