<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outbox_events', function (Blueprint $table) {
            $table->id();
            $table->string('type', 255);
            $table->json('payload');
            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('retries')->default(0);
            $table->timestamps();
            $table->index(['published_at']);
            $table->index(['type', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outbox_events');
    }
};
