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
        Schema::table('inscription_evenements', function (Blueprint $table) {
            if (!Schema::hasColumn('inscription_evenements', 'donnees_formulaire')) {
                $table->json('donnees_formulaire')->nullable()->after('waitlist_position');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscription_evenements', function (Blueprint $table) {
            $table->dropColumn('donnees_formulaire');
        });
    }
};
