<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenement_roles', function (Blueprint $table) {
            $table->string('category')->default('audience')->after('evenement_id');
            $table->foreignId('user_id')->nullable()->after('role')->constrained('users')->nullOnDelete();

            $table->index(['evenement_id', 'category']);
            $table->index(['category', 'role']);
            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('evenement_roles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropIndex(['evenement_id', 'category']);
            $table->dropIndex(['category', 'role']);
            $table->dropIndex(['user_id']);
            $table->dropColumn('category');
        });
    }
};
