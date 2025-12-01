<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ticket\StoreTicketUpdateRequest;
use App\Http\Resources\TicketUpdateResource;
use App\Models\Ticket;
use App\Models\TicketUpdate;
use Illuminate\Http\Request;

class TicketUpdateController extends Controller
{
    public function index(Request $request, Ticket $ticket)
    {
        $updates = TicketUpdate::where('ticket_id', $ticket->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return TicketUpdateResource::collection($updates);
    }

    public function store(StoreTicketUpdateRequest $request, Ticket $ticket)
    {
        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas visualização para usuários cliente'], 403);
        }
        $data = $request->validated();
        $update = TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()?->id,
            'conteudo' => $data['conteudo'],
            'type' => 'comment',
        ]);
        // system log
        TicketUpdate::create([
            'ticket_id' => $ticket->id,
            'user_id' => null,
            'conteudo' => 'Novo comentário',
            'type' => 'system',
        ]);
        return (new TicketUpdateResource($update->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(StoreTicketUpdateRequest $request, Ticket $ticket, TicketUpdate $update)
    {
        if ($update->ticket_id !== $ticket->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $userId = $request->user()?->id;
        if (!$userId || $update->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas visualização para usuários cliente'], 403);
        }

        $data = $request->validated();
        $update->update(['conteudo' => $data['conteudo']]);

        return new TicketUpdateResource($update->load('user'));
    }

    public function destroy(Request $request, Ticket $ticket, TicketUpdate $update)
    {
        if ($update->ticket_id !== $ticket->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $userId = $request->user()?->id;
        if (!$userId || $update->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas visualização para usuários cliente'], 403);
        }

        $update->delete();
        return response()->json(null, 204);
    }
}
