<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('kb_articles', function (Blueprint $table) {
            $table->index('kb_category_id');
            $table->index('status');
            $table->index('visibilidade');
            $table->index('updated_at');
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('kb_articles', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropIndex(['kb_category_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['visibilidade']);
            $table->dropIndex(['updated_at']);
        });
    }
};

