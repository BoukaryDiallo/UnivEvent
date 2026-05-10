<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenement_comments', function (Blueprint $table) {
            $table->string('status')->default('visible')->after('contenu');
            $table->foreignId('moderated_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->text('moderation_reason')->nullable()->after('moderated_by');
            $table->timestamp('moderated_at')->nullable()->after('moderation_reason');
        });

        Schema::table('event_messages', function (Blueprint $table) {
            $table->string('type')->default('question')->after('user_id');
            $table->foreignId('parent_id')->nullable()->after('contenu')->constrained('event_messages')->cascadeOnDelete();
            $table->string('status')->default('ouvert')->after('parent_id');
            $table->boolean('is_pinned')->default(false)->after('status');
            $table->foreignId('moderated_by')->nullable()->after('is_pinned')->constrained('users')->nullOnDelete();
            $table->text('moderation_reason')->nullable()->after('moderated_by');
            $table->timestamp('moderated_at')->nullable()->after('moderation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('event_messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
            $table->dropConstrainedForeignId('moderated_by');
            $table->dropColumn(['type', 'status', 'is_pinned', 'moderation_reason', 'moderated_at']);
        });

        Schema::table('evenement_comments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('moderated_by');
            $table->dropColumn(['status', 'moderation_reason', 'moderated_at']);
        });
    }
};
