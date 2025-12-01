<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class MetricController extends Controller
{
    private function baseQuery(Request $request): Builder
    {
        $ids = (array) $request->query('responsavel_id', []);
        $from = $request->query('from');
        $to = $request->query('to');
        $status = $request->query('status');
        $projectId = $request->query('project_id');
        $user = $request->user();
        $userProjectIds = $user ? $user->projects()->pluck('projects.id')->all() : [];

        $query = Ticket::query()
            ->ofUsers($ids)
            ->inDateRange($from, $to)
            ->byStatus($status)
            ->when(!$projectId, function ($q2) use ($userProjectIds) {
                if (count($userProjectIds) > 0) {
                    $q2->whereIn('project_id', $userProjectIds);
                } else {
                    $q2->whereRaw('1=0');
                }
            })
            ->ofProject($projectId);

        if ($projectId && !in_array((int) $projectId, $userProjectIds, true)) {
            return Ticket::query()->whereRaw('1=0');
        }

        return $query;
    }

    public function byStatus(Request $request)
    {
        $metrics = $this->baseQuery($request)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status, 'total' => (int) $row->total]);

        return response()->json($metrics);
    }

    public function byUser(Request $request)
    {
        $metrics = $this->baseQuery($request)
            ->selectRaw('responsavel_id, COUNT(*) as total')
            ->groupBy('responsavel_id')
            ->with('responsavel:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'user_id' => $item->responsavel_id,
                    'name'    => $item->responsavel->name ?? 'Sem responsável',
                    'total'   => (int) $item->total,
                ];
            });

        return response()->json($metrics);
    }
}
