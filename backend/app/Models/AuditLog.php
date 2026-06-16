<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    // Pas de colonne updated_at pour les logs d'audit
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'table_affected',
        'record_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Un log d'audit est associé à l'utilisateur qui a fait l'action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
