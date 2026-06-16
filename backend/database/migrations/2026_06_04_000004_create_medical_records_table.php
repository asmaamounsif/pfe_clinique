<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            // patient_id est unique car relation de un à un (One-to-One) avec Patient
            $table->foreignId('patient_id')->unique()->constrained('patients')->onDelete('cascade');
            $table->text('allergies')->nullable();
            $table->text('medical_history')->nullable(); // antécédents médicaux
            $table->text('family_history')->nullable();  // antécédents familiaux
            $table->text('current_treatments')->nullable(); // traitements en cours
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
