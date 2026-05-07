<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            if (! Schema::hasColumn('evenements', 'theme')) {
                $table->string('theme')->nullable()->after('type');
            }
            if (! Schema::hasColumn('evenements', 'reglement')) {
                $table->text('reglement')->nullable()->after('description');
            }
            if (! Schema::hasColumn('evenements', 'video_url')) {
                $table->string('video_url')->nullable()->after('lien_live');
            }
            if (! Schema::hasColumn('evenements', 'date_soumission')) {
                $table->dateTime('date_soumission')->nullable()->after('date_fin');
            }
            if (! Schema::hasColumn('evenements', 'date_deliberation')) {
                $table->dateTime('date_deliberation')->nullable()->after('date_soumission');
            }
        });
    }

    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropColumn([
                'theme',
                'reglement',
                'video_url',
                'date_soumission',
                'date_deliberation',
            ]);
        });
    }
};
