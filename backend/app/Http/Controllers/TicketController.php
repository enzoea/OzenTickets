<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Services\TicketService;

class TicketController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $ids = (array) $request->query('responsavel_id', []);
        $from = $request->query('from');
        $to = $request->query('to');
        $status = $request->query('status');

        $query = Ticket::query()
            ->ofUsers($ids)
            ->inDateRange($from, $to)
            ->byStatus($status)
            ->with(['responsavel','solicitante']);

        return TicketResource::collection($query->get());
    }

    public function store(StoreTicketRequest $request, TicketService $service)
    {
        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas visualização para usuários cliente'], 403);
        }
        $ticket = $service->create($request->validated());
        return (new TicketResource($ticket->load('responsavel')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket, TicketService $service)
    {
        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas visualização para usuários cliente'], 403);
        }
        $service->update($ticket, $request->validated());
        return new TicketResource($ticket->load('responsavel'));
    }
}
