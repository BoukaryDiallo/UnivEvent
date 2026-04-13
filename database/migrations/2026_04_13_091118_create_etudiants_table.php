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
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_user')
                  ->constrained('users', 'id')
                  ->onDelete('cascade');

            $table->string('INE')->unique();
            $table->string('filiere');
            $table->string('niveau');
            $table->date('date_naissance')->nullable();
            $table->string('photo')->nullable();
           

            $table->timestamps();
            $table->softDeletes();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};
