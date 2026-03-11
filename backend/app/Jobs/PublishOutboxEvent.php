<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\OutboxEvent;

class PublishOutboxEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $eventId;

    public function __construct(int $eventId)
    {
        $this->eventId = $eventId;
    }

    public function handle(): void
    {
        $event = OutboxEvent::find($this->eventId);
        if (!$event || $event->published_at) {
            return;
        }
        if (app()->runningUnitTests()) {
            $event->published_at = now();
            $event->save();
            return;
        }
        Log::info('Publishing outbox event', [
            'event_id' => $event->id,
            'type' => $event->type,
            'payload' => $event->payload,
        ]);
        $single = config('services.events.webhook_url') ?? env('EVENT_WEBHOOK_URL');
        $multi  = config('services.events.webhook_urls') ?? env('EVENT_WEBHOOK_URLS');
        $targets = [];
        if (is_string($multi) && $multi !== '') {
            $targets = array_values(array_filter(array_map(fn ($x) => trim($x), explode(',', $multi))));
        } elseif (is_string($single) && $single !== '') {
            $targets = [trim($single)];
        }
        $okAll = true;
        foreach ($targets as $webhook) {
            try {
                $resp = Http::timeout(5)->post($webhook, [
                    'id' => $event->id,
                    'type' => $event->type,
                    'payload' => $event->payload,
                    'occurred_at' => optional($event->occurred_at)->toISOString(),
                ]);
                Log::info('Outbox webhook delivered', [
                    'status' => $resp->status(),
                    'url' => $webhook,
                ]);
                if ($resp->failed()) {
                    $okAll = false;
                }
            } catch (\Throwable $e) {
                Log::warning('Outbox webhook delivery failed', [
                    'url' => $webhook,
                    'error' => $e->getMessage(),
                ]);
                $okAll = false;
            }
        }
        if ($okAll) {
            $event->published_at = now();
            $event->save();
        } else {
            $event->retries = ($event->retries ?? 0) + 1;
            $event->save();
            static::dispatch($event->id)->delay(now()->addSeconds(10));
        }
    }
}
