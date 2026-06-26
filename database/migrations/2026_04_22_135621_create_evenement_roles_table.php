<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_roles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evenement_id')
                ->constrained('evenements')
                ->onDelete('cascade');

            // rôle autorisé à accéder / participer
            $table->string('role');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_roles');
    }
};
