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
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->onDelete('set null');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('restrict'); // Médecin prescripteur ou validateur
            $table->string('type_examen'); // e.g., 'Sanguin', 'Radiologie', 'IRM', 'Urine'
            $table->dateTime('date_examen');
            $table->text('results');
            $table->string('file_path')->nullable(); // Chemin d'accès du fichier de résultat (PDF)
            $table->enum('status', ['En attente', 'Disponible', 'Validé'])->default('En attente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
