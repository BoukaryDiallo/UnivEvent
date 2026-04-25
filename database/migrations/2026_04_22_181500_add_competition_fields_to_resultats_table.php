<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resultats', function (Blueprint $table) {
            $table->decimal('note', 8, 2)->default(0)->change();
            $table->string('admission')->nullable()->after('classement');
            $table->string('mention')->nullable()->after('admission');
            $table->decimal('admission_average_snapshot', 5, 2)->nullable()->after('mention');
            $table->json('criteria_breakdown')->nullable()->after('admission_average_snapshot');
            $table->timestamp('published_at')->nullable()->after('criteria_breakdown');
            $table->timestamp('validated_at')->nullable()->after('published_at');
            $table->foreignId('validated_by')->nullable()->after('validated_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('resultats', function (Blueprint $table) {
            $table->dropConstrainedForeignId('validated_by');
            $table->dropColumn([
                'admission',
                'mention',
                'admission_average_snapshot',
                'criteria_breakdown',
                'published_at',
                'validated_at',
            ]);
            $table->integer('note')->default(0)->change();
        });
    }
};
