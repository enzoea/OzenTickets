<?php

namespace App\Services;

use App\Models\Ticket;

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
        }
        return $ticket;
    }
}
