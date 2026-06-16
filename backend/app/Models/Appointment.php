<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date_heure',
        'rappel_envoye',
        'status',
        'motif',
        'notes',
    ];

    protected $casts = [
        'date_heure' => 'datetime',
        'rappel_envoye' => 'boolean',
    ];

    /**
     * Un rendez-vous concerne un patient.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Un rendez-vous est avec un médecin.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
