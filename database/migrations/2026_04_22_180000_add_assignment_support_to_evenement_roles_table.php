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
        $schema = Schema::getConnection()->getSchemaBuilder();

        if ($schema->hasIndex('evenement_roles', 'evenement_roles_evenement_id_category_index')) {
            Schema::table('evenement_roles', function (Blueprint $table) {
                $table->dropIndex(['evenement_id', 'category']);
            });
        }

        if ($schema->hasIndex('evenement_roles', 'evenement_roles_category_role_index')) {
            Schema::table('evenement_roles', function (Blueprint $table) {
                $table->dropIndex(['category', 'role']);
            });
        }

        if ($schema->hasIndex('evenement_roles', 'evenement_roles_user_id_index')) {
            Schema::table('evenement_roles', function (Blueprint $table) {
                $table->dropIndex(['user_id']);
            });
        }

        $hasUserForeignKey = collect($schema->getForeignKeys('evenement_roles'))
            ->contains(fn (array $foreignKey): bool => $foreignKey['columns'] === ['user_id']);

        if ($hasUserForeignKey && Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('evenement_roles', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        Schema::table('evenement_roles', function (Blueprint $table) {
            if (Schema::hasColumn('evenement_roles', 'user_id')) {
                if (Schema::getConnection()->getDriverName() === 'sqlite') {
                    $table->dropColumn('user_id');
                } else {
                    $table->dropConstrainedForeignId('user_id');
                }
            }

            if (Schema::hasColumn('evenement_roles', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};
