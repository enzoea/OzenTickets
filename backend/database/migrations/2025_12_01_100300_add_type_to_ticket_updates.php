<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ticket_updates', function (Blueprint $table) {
            $table->string('type')->default('comment')->after('conteudo');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_updates', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};

