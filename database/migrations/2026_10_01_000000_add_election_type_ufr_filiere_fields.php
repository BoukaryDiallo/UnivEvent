<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('elections', function (Blueprint $table) {
            $table->enum('type', ['ufr', 'promotion'])->nullable()->after('tour');
            $table->foreignId('id_ufr')->nullable()->after('type')
                  ->constrained('ufrs', 'id_ufr')
                  ->onDelete('set null');
            $table->foreignId('id_filiere')->nullable()->after('id_ufr')
                  ->constrained('filieres', 'id_filiere')
                  ->onDelete('set null');
            
            // Drop old circonscription FK
            $table->dropForeign(['id_circonscription']);
            $table->dropColumn('id_circonscription');
        });
    }

    public function down()
    {
        Schema::table('elections', function (Blueprint $table) {
            // Restore circonscription
            $table->foreignId('id_circonscription')->after('tour')
                  ->constrained('circonscriptions', 'id_circonscription')
                  ->onDelete('cascade');
            
            $table->dropForeign(['id_ufr']);
            $table->dropForeign(['id_filiere']);
            $table->dropColumn(['id_ufr', 'id_filiere', 'type']);
        });
    }
};

