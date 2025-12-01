<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->integer('sla_hours')->nullable()->after('prioridade');
            $table->date('due_at')->nullable()->after('data_prevista');
            $table->timestamp('resolved_at')->nullable()->after('due_at');
            $table->foreignId('assigned_to_user_id')->nullable()->after('responsavel_id')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_to_user_id');
            $table->dropColumn(['sla_hours','due_at','resolved_at']);
        });
    }
};

