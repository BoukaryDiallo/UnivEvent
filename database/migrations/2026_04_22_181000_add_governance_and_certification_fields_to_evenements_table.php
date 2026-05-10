<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->enum('statut', ['brouillon', 'publie', 'en_cours', 'cloture', 'archive'])
                ->default('brouillon')
                ->change();
            $table->boolean('comments_enabled')->default(true)->after('checkin_active');
            $table->boolean('comment_replies_enabled')->default(true)->after('comments_enabled');
            $table->boolean('comment_reactions_enabled')->default(true)->after('comment_replies_enabled');
            $table->string('comment_policy')->default('accepted_participants')->after('comment_reactions_enabled');
            $table->boolean('messages_enabled')->default(true)->after('comment_policy');
            $table->boolean('evenement_certifie')->default(false)->after('messages_enabled');
            $table->json('certificate_template_schema')->nullable()->after('evenement_certifie');
            $table->string('certificate_template_version')->default('template_v1')->after('certificate_template_schema');
            $table->string('competition_status')->default('configuration')->after('certificate_template_version');
            $table->boolean('allow_participant_result_tracking')->default(false)->after('competition_status');
            $table->timestamp('results_published_at')->nullable()->after('allow_participant_result_tracking');
        });
    }

    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropColumn([
                'comments_enabled',
                'comment_replies_enabled',
                'comment_reactions_enabled',
                'comment_policy',
                'messages_enabled',
                'evenement_certifie',
                'certificate_template_schema',
                'certificate_template_version',
                'competition_status',
                'allow_participant_result_tracking',
                'results_published_at',
            ]);
            $table->enum('statut', ['brouillon', 'publie', 'cloture'])
                ->default('brouillon')
                ->change();
        });
    }
};
