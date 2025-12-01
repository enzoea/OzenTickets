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
        $q = $request->query('q');
        $projectId = $request->query('project_id');

        $user = $request->user();
        $userProjectIds = $user ? $user->projects()->pluck('projects.id')->all() : [];

        if ($projectId) {
            if (!in_array((int) $projectId, $userProjectIds, true)) {
                return response()->json(['message' => 'Sem acesso ao projeto'], 403);
            }
        }

        $query = Ticket::query()
            ->ofUsers($ids)
            ->inDateRange($from, $to)
            ->byStatus($status)
            ->matchesQuery($q)
            ->when(!$projectId, function ($q2) use ($userProjectIds) {
                if (count($userProjectIds) > 0) {
                    $q2->whereIn('project_id', $userProjectIds);
                } else {
                    $q2->whereRaw('1=0');
                }
            })
            ->ofProject($projectId)
            ->with(['responsavel','solicitante']);

        return TicketResource::collection($query->orderBy('created_at', 'desc')->get());
    }

    public function store(StoreTicketRequest $request, TicketService $service)
    {
        $current = $request->user();
        $pid = (int) ($request->validated()['project_id'] ?? 0);
        if ($pid <= 0) return response()->json(['message' => 'Projeto obrigatório'], 422);
        $hasAccess = $current?->projects()->where('projects.id', $pid)->exists();
        if (!$hasAccess) return response()->json(['message' => 'Sem acesso ao projeto'], 403);

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
