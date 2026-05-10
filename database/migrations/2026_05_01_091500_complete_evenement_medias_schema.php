<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenement_medias', function (Blueprint $table) {
            if (! Schema::hasColumn('evenement_medias', 'description')) {
                $table->text('description')->nullable()->after('taille');
            }

            if (! Schema::hasColumn('evenement_medias', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('description');
            }

            if (! Schema::hasColumn('evenement_medias', 'download_allowed')) {
                $table->boolean('download_allowed')->default(true)->after('is_public');
            }
        });
    }

    public function down(): void
    {
        Schema::table('evenement_medias', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('evenement_medias', 'description')) {
                $columns[] = 'description';
            }

            if (Schema::hasColumn('evenement_medias', 'is_public')) {
                $columns[] = 'is_public';
            }

            if (Schema::hasColumn('evenement_medias', 'download_allowed')) {
                $columns[] = 'download_allowed';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
