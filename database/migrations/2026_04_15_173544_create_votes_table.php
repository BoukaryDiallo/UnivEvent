<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id('id_vote');

            $table->dateTime('date_vote')->useCurrent();

            $table->integer('tour'); // clé du second tour

            $table->foreignId('id_user')
                ->constrained('users', 'id')
                ->onDelete('cascade');

            $table->foreignId('id_election')
                ->constrained('elections', 'id_election')
                ->onDelete('cascade');

            $table->foreignId('id_candidature')
                ->constrained('candidatures', 'id_candidature')
                ->onDelete('cascade');

            $table->unique(['id_user', 'id_election', 'tour']);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
