<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('resultats', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evenement_id')
                ->constrained('evenements')
                ->onDelete('cascade');

            $table->foreignId('utilisateur_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->integer('note')->default(0);
            $table->integer('classement')->nullable();

            $table->timestamps();

            $table->unique(['evenement_id', 'utilisateur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultats');
    }
};