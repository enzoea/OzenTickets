<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\OutboxEvent;
use App\Jobs\PublishOutboxEvent;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('outbox:dispatch', function () {
    $pending = OutboxEvent::whereNull('published_at')->orderBy('id')->limit(100)->get();
    foreach ($pending as $evt) {
        PublishOutboxEvent::dispatch($evt->id);
    }
    $this->info('Outbox events dispatched: ' . $pending->count());
})->purpose('Dispatch pending Outbox events');

Artisan::command('outbox:seed-demo', function () {
    $evt = OutboxEvent::create([
        'type' => 'ticket.created',
        'payload' => [
            'ticket_id' => 999999,
            'project_id' => null,
            'status' => 'a_fazer',
            'titulo' => 'Demo',
        ],
        'occurred_at' => now(),
    ]);
    PublishOutboxEvent::dispatch($evt->id);
    $this->info('Demo outbox event created and dispatched: ' . $evt->id);
})->purpose('Seed a demo outbox event and dispatch it');
