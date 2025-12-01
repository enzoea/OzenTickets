<?php

namespace App\Services;

use App\Models\Ticket;

class TicketService
{
    public function create(array $data): Ticket
    {
        $ticket = Ticket::create($data);
        if (!$ticket->codigo) {
            $ticket->codigo = $ticket->id;
            $ticket->save();
        }
        return $ticket;
    }

    public function update(Ticket $ticket, array $data): Ticket
    {
        $ticket->update($data);
        return $ticket;
    }
}
