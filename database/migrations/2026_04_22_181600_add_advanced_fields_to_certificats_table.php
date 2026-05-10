<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificats', function (Blueprint $table) {
            $table->string('type')->default('attestation')->after('utilisateur_id');
            $table->string('statut')->default('brouillon')->change();
            $table->json('template_snapshot')->nullable()->after('url_verification');
            $table->json('overrides')->nullable()->after('template_snapshot');
            $table->json('payload')->nullable()->after('overrides');
            $table->timestamp('preview_generated_at')->nullable()->after('payload');
            $table->timestamp('published_at')->nullable()->after('preview_generated_at');
            $table->timestamp('revoked_at')->nullable()->after('published_at');
        });
    }

    public function down(): void
    {
        Schema::table('certificats', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'template_snapshot',
                'overrides',
                'payload',
                'preview_generated_at',
                'published_at',
                'revoked_at',
            ]);
            $table->string('statut')->default('valide')->change();
        });
    }
};
