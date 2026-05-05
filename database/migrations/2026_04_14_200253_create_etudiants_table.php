<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_user')
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('INE')->unique();

            // 🔗 relations académiques
            $table->unsignedBigInteger('id_ufr');
            $table->unsignedBigInteger('id_departement');
            $table->unsignedBigInteger('id_filiere');

            $table->enum('niveau', ['Licence1', 'Licence2', 'Licence3','Master1', 'Master2', 'Doctorat1','Doctorat2', 'Doctorat3'])
                  ->default('Licence1');;

            $table->date('date_naissance')->nullable();

            $table->enum('statut', ['inscrit', 'non_inscrit', 'suspendu'])
                ->default('inscrit');

            $table->string('photo')->nullable();

            $table->timestamps();
            $table->softDeletes();

          
            $table->foreign('id_ufr')
                ->references('id_ufr')
                ->on('ufrs');

            $table->foreign('id_departement')
                ->references('id_departement')
                ->on('departements');

            $table->foreign('id_filiere')
                ->references('id_filiere')
                ->on('filieres');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};