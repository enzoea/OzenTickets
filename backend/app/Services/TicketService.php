<?php

namespace App\Services;

use App\Models\Ticket;
use App\Jobs\TicketStatusChangedNotify;
use App\Models\OutboxEvent;
use App\Jobs\PublishOutboxEvent;

class TicketService
{
    public function create(array $data): Ticket
    {
        // mirror assigned_to_user_id into responsavel_id if provided
        if (isset($data['assigned_to_user_id']) && !isset($data['responsavel_id'])) {
            $data['responsavel_id'] = $data['assigned_to_user_id'];
        }
        $ticket = Ticket::create($data);
        if (!$ticket->codigo) {
            $ticket->codigo = $ticket->id;
            $ticket->save();
        }
        // sync tags if provided
        if (isset($data['tag_ids']) && is_array($data['tag_ids'])) {
            $ticket->tags()->sync($data['tag_ids']);
        }
        // system update: ticket created
        \App\Models\TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => null,
            'conteudo' => 'Ticket criado',
            'type' => 'system',
        ]);
        $outbox = \App\Models\OutboxEvent::create([
            'type' => 'ticket.created',
            'payload' => [
                'ticket_id' => $ticket->id,
                'project_id' => $ticket->project_id,
                'status' => is_string($ticket->status) ? $ticket->status : ($ticket->status?->value),
                'titulo' => $ticket->titulo,
            ],
            'occurred_at' => now(),
        ]);
        \App\Jobs\PublishOutboxEvent::dispatch($outbox->id);
        return $ticket;
    }

    public function update(Ticket $ticket, array $data): Ticket
    {
        $originalStatus = $ticket->status;
        // mirror assigned_to_user_id into responsavel_id if provided
        if (isset($data['assigned_to_user_id']) && !isset($data['responsavel_id'])) {
            $data['responsavel_id'] = $data['assigned_to_user_id'];
        }
        $ticket->update($data);
        // sync tags if provided
        if (isset($data['tag_ids']) && is_array($data['tag_ids'])) {
            $ticket->tags()->sync($data['tag_ids']);
        }
        // status change notification
        if (isset($data['status']) && $data['status'] !== $originalStatus) {
            \App\Models\TicketUpdate::create([
                'ticket_id' => $ticket->id,
                'user_id' => null,
                'conteudo' => 'Status alterado para ' . (is_string($ticket->status) ? $ticket->status : ($ticket->status?->value)),
                'type' => 'system',
            ]);
            // set resolved_at if finalized
            $finalValues = ['finalizado'];
            $cur = is_string($ticket->status) ? $ticket->status : ($ticket->status?->value);
            if (in_array($cur, $finalValues, true)) {
                $ticket->resolved_at = now();
                $ticket->save();
            }
            TicketStatusChangedNotify::dispatch($ticket->id, is_string($originalStatus) ? $originalStatus : ($originalStatus?->value), $cur);
            $outbox = OutboxEvent::create([
                'type' => 'ticket.status_changed',
                'payload' => [
                    'ticket_id' => $ticket->id,
                    'from' => is_string($originalStatus) ? $originalStatus : ($originalStatus?->value),
                    'to' => $cur,
                ],
                'occurred_at' => now(),
            ]);
            PublishOutboxEvent::dispatch($outbox->id);
        }
        return $ticket;
    }
}
