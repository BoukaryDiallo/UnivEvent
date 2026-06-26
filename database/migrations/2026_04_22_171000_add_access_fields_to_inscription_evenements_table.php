<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscription_evenements', function (Blueprint $table) {
            $table->string('access_token')->nullable()->unique()->after('statut');
            $table->timestamp('checked_in_at')->nullable()->after('access_token');
        });
    }

    public function down(): void
    {
        Schema::table('inscription_evenements', function (Blueprint $table) {
            $table->dropUnique(['access_token']);
        });

        Schema::table('inscription_evenements', function (Blueprint $table) {
            $table->dropColumn(['access_token', 'checked_in_at']);
        });
    }
};
