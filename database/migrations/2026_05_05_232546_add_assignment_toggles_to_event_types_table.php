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
        Schema::table('event_types', function (Blueprint $table) {
            $table->boolean('allow_organizer')->default(true)->after('features');
            $table->boolean('allow_intervenant')->default(true)->after('allow_organizer');
            $table->boolean('allow_jury')->default(false)->after('allow_intervenant');
            $table->boolean('allow_participant')->default(true)->after('allow_jury');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            $table->dropColumn(['allow_organizer', 'allow_intervenant', 'allow_jury', 'allow_participant']);
        });
    }
};
