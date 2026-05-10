<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscription_evenements', function (Blueprint $table) {
            if (! Schema::hasColumn('inscription_evenements', 'is_waitlist')) {
                $table->boolean('is_waitlist')->default(false)->after('checked_in_at');
            }

            if (! Schema::hasColumn('inscription_evenements', 'waitlist_position')) {
                $table->unsignedInteger('waitlist_position')->nullable()->after('is_waitlist');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inscription_evenements', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('inscription_evenements', 'is_waitlist')) {
                $columns[] = 'is_waitlist';
            }

            if (Schema::hasColumn('inscription_evenements', 'waitlist_position')) {
                $columns[] = 'waitlist_position';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
