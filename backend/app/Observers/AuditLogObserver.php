<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogObserver
{
    /**
     * Enregistre un log d'audit après la création d'un enregistrement.
     *
     * @param Model $model Le modèle qui vient d'être créé
     * @return void
     */
    public function created(Model $model): void
    {
        $this->logAction('CREATE', $model, null, $model->toArray());
    }

    /**
     * Enregistre un log d'audit après la modification d'un enregistrement.
     * Logue précisément les changements (anciennes vs nouvelles valeurs).
     *
     * @param Model $model Le modèle modifié
     * @return void
     */
    public function updated(Model $model): void
    {
        // Récupération des attributs modifiés
        $dirty = $model->getDirty();
        $oldValues = [];
        $newValues = [];

        foreach ($dirty as $key => $value) {
            // Ignore le timestamp updated_at de la comparaison pour plus de clarté
            if ($key === 'updated_at') {
                continue;
            }
            $oldValues[$key] = $model->getOriginal($key);
            $newValues[$key] = $value;
        }

        // Si des attributs métier significatifs ont été modifiés, on logue
        if (!empty($newValues)) {
            $this->logAction('UPDATE', $model, $oldValues, $newValues);
        }
    }

    /**
     * Enregistre un log d'audit après la suppression d'un enregistrement.
     *
     * @param Model $model Le modèle supprimé
     * @return void
     */
    public function deleted(Model $model): void
    {
        $this->logAction('DELETE', $model, $model->toArray(), null);
    }

    /**
     * Méthode helper privée pour insérer le log dans la base de données.
     *
     * @param string $action L'action effectuée (CREATE, UPDATE, DELETE)
     * @param Model $model Le modèle affecté
     * @param array|null $oldValues Tableau des anciennes données
     * @param array|null $newValues Tableau des nouvelles données
     * @return void
     */
    private function logAction(string $action, Model $model, ?array $oldValues = null, ?array $newValues = null): void
    {
        // Enregistre uniquement si une requête HTTP est en cours ou s'il y a un utilisateur
        AuditLog::create([
            'user_id' => auth()->check() ? auth()->id() : null, // ID de l'utilisateur ou null si console (ex: seeder)
            'action' => $action,
            'table_affected' => $model->getTable(),
            'record_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request() ? request()->ip() : null,
            'user_agent' => request() ? request()->userAgent() : null,
        ]);
    }
}
