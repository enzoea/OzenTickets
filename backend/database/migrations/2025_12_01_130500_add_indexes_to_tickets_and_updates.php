<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->index('status');
            $table->index('responsavel_id');
            $table->index('assigned_to_user_id');
            $table->index('project_id');
            $table->index('data_prevista');
            $table->index('due_at');
            $table->index('created_at');
        });

        Schema::table('ticket_updates', function (Blueprint $table) {
            $table->index('ticket_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['responsavel_id']);
            $table->dropIndex(['assigned_to_user_id']);
            $table->dropIndex(['project_id']);
            $table->dropIndex(['data_prevista']);
            $table->dropIndex(['due_at']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('ticket_updates', function (Blueprint $table) {
            $table->dropIndex(['ticket_id']);
            $table->dropIndex(['created_at']);
        });
    }
};

