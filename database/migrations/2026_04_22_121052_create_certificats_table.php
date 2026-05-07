<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('certificats', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evenement_id')
                ->constrained('evenements')
                ->onDelete('cascade');

            $table->foreignId('utilisateur_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('code_certificat')->unique();

            // fichier PDF généré
            $table->string('fichier')->nullable();

            // QR / vérification publique
            $table->string('url_verification')->nullable();

            // état du certificat
            $table->string('statut')->default('valide');
            // valide | annule | expire

            $table->dateTime('date_delivrance')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificats');
    }
};