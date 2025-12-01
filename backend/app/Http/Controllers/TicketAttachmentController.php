<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketAttachment;
use Illuminate\Http\Request;

class TicketAttachmentController extends Controller
{
    public function index(Request $request, Ticket $ticket)
    {
        $items = TicketAttachment::where('ticket_id', $ticket->id)->orderBy('created_at','desc')->get();
        return response()->json($items);
    }

    public function store(Request $request, Ticket $ticket)
    {
        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas visualização para usuários cliente'], 403);
        }
        $data = $request->validate([
            'path' => ['required','string','max:2000'],
            'mime' => ['nullable','string','max:255'],
            'original_name' => ['nullable','string','max:255'],
            'size' => ['nullable','integer','min:0'],
        ]);
        $item = TicketAttachment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()?->id,
            'path' => $data['path'],
            'mime' => $data['mime'] ?? null,
            'original_name' => $data['original_name'] ?? null,
            'size' => $data['size'] ?? null,
        ]);
        return response()->json($item, 201);
    }

    public function destroy(Request $request, Ticket $ticket, TicketAttachment $attachment)
    {
        if ($attachment->ticket_id !== $ticket->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }
        $userId = $request->user()?->id;
        if (!$userId || $attachment->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $attachment->delete();
        return response()->json(null, 204);
    }
}

