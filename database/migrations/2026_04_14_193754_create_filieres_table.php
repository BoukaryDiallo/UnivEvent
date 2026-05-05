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
        Schema::create('filieres', function (Blueprint $table) {
            $table->id('id_filiere');

            $table->unsignedBigInteger('id_departement');
            $table->string('nom');
            $table->string('code', 10)->unique();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_departement')
                ->references('id_departement')
                ->on('departements')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filieres');
    }
};