<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TicketStatusChangedNotify implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $ticketId;
    public ?string $from;
    public ?string $to;

    public function __construct(int $ticketId, ?string $from, ?string $to)
    {
        $this->ticketId = $ticketId;
        $this->from = $from;
        $this->to = $to;
    }

    public function handle(): void
    {
        Log::info('Ticket status changed', [
            'ticket_id' => $this->ticketId,
            'from' => $this->from,
            'to' => $this->to,
        ]);
    }
}
