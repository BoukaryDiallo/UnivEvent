<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update Concours
        DB::table('event_types')
            ->where('slug', 'concours')
            ->update([
                'allow_organizer' => true,
                'allow_intervenant' => true,
                'allow_jury' => true,
                'allow_participant' => true,
            ]);

        // Update Conference
        DB::table('event_types')
            ->where('slug', 'conference')
            ->update([
                'allow_organizer' => true,
                'allow_intervenant' => true,
                'allow_jury' => false,
                'allow_participant' => true,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
