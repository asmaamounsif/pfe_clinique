<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date_consultation',
        'motif',
        'symptoms',
        'diagnostic',
        'observations',
        'tarif',
    ];

    protected $casts = [
        'date_consultation' => 'datetime',
        'tarif' => 'decimal:2',
    ];

    /**
     * Une consultation concerne un patient.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Une consultation est effectuée par un médecin.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Une consultation peut mener à plusieurs ordonnances (prescriptions).
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Une consultation peut donner lieu à plusieurs examens.
     */
    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }
}
