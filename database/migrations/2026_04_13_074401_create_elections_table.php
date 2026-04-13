<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up()
    {
        Schema::create('elections', function (Blueprint $table) {
            $table->id('id_election');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->enum('statut', ['ouverte', 'fermee'])->default('fermee');

            $table->foreignId('id_circonscription')
                ->constrained('circonscriptions', 'id_circonscription')
                ->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('elections');
    }
};
