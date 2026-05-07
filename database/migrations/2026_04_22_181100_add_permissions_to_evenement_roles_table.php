<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenement_roles', function (Blueprint $table) {
            $table->boolean('is_president_jury')->default(false)->after('user_id');
            $table->boolean('can_manage_messages')->default(false)->after('is_president_jury');
            $table->boolean('can_manage_comments')->default(false)->after('can_manage_messages');
            $table->boolean('can_edit_event')->default(false)->after('can_manage_comments');
            $table->boolean('can_change_visibility')->default(false)->after('can_edit_event');
            $table->boolean('can_manage_participants')->default(false)->after('can_change_visibility');
            $table->boolean('can_assign_jury')->default(false)->after('can_manage_participants');
            $table->boolean('can_assign_organizers')->default(false)->after('can_assign_jury');
            $table->boolean('can_manage_certificates')->default(false)->after('can_assign_organizers');
            $table->boolean('can_manage_results')->default(false)->after('can_manage_certificates');
            $table->json('meta')->nullable()->after('can_manage_results');
        });
    }

    public function down(): void
    {
        Schema::table('evenement_roles', function (Blueprint $table) {
            $table->dropColumn([
                'is_president_jury',
                'can_manage_messages',
                'can_manage_comments',
                'can_edit_event',
                'can_change_visibility',
                'can_manage_participants',
                'can_assign_jury',
                'can_assign_organizers',
                'can_manage_certificates',
                'can_manage_results',
                'meta',
            ]);
        });
    }
};
