<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salles', function (Blueprint $table) {
            if (! Schema::hasColumn('salles', 'capacite')) {
                $table->integer('capacite')->default(1);
            }

            if (! Schema::hasColumn('salles', 'batiment')) {
                $table->string('batiment')->nullable();
            }

            if (! Schema::hasColumn('salles', 'disponible')) {
                $table->boolean('disponible')->default(true);
            }
        });
    }

    public function down(): void
    {
        Schema::table('salles', function (Blueprint $table) {
            $table->dropColumn(['capacite', 'batiment', 'disponible']);
        });
    }
};
