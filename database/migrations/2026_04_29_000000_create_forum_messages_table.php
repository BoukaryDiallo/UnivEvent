<?php
/* C:\Users\PADSEM\clother-integrateur\UnivEvent\database\migrations\2026_04_29_000000_create_forum_messages_table.php */
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('forum_messages', function (Blueprint $column) {
            $column->id();
            $column->foreignId('club_id')->constrained()->onDelete('cascade');
            $column->foreignId('user_id')->constrained()->onDelete('cascade');
            $column->text('contenu');
            $column->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_messages');
    }
};
