<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('programmes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evenement_id')
                ->constrained('evenements')
                ->onDelete('cascade');

            $table->string('titre');
            $table->text('description')->nullable();

            $table->string('intervenant')->nullable();

            // plus flexible et propre
            $table->date('date_programme')->nullable();
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();

            // utile pour salles / organisation concours
            $table->string('salle')->nullable();

            // très important pour organiser logique métier
            $table->string('type_section')->nullable();
            // ex: ouverture, session, pause, epreuve, resultat

            $table->integer('ordre')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programmes');
    }
};