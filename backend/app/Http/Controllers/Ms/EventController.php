<?php

namespace App\Http\Controllers\Ms;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NotificationEvent;
use App\Models\AnalyticsStatusCount;

class EventController extends Controller
{
    public function notificationsIndex()
    {
        $items = NotificationEvent::query()->orderByDesc('created_at')->limit(100)->get();
        return response()->json($items->map(function ($x) {
            return [
                'id' => $x->id,
                'type' => $x->type,
                'payload' => $x->payload,
                'occurred_at' => $x->occurred_at?->toISOString(),
                'received_at' => $x->created_at?->toISOString(),
            ];
        }));
    }

    public function notificationsStore(Request $request)
    {
        $type = $request->input('type');
        if (!is_string($type) || $type === '') {
            return response()->json(['message' => 'type required'], 400);
        }
        $evt = NotificationEvent::create([
            'type' => $type,
            'payload' => (array) $request->input('payload', []),
            'occurred_at' => $request->input('occurred_at') ? \Illuminate\Support\Carbon::parse($request->input('occurred_at')) : now(),
        ]);
        return response()->json(['accepted' => true, 'id' => $evt->id]);
    }

    public function analyticsStore(Request $request)
    {
        $type = $request->input('type');
        if (!is_string($type) || $type === '') {
            return response()->json(['message' => 'type required'], 400);
        }
        if ($type === 'ticket.created') {
            $status = $request->input('payload.status');
            if (is_string($status) && $status !== '') {
                $this->incStatus($status);
            }
        } elseif ($type === 'ticket.status_changed') {
            $from = $request->input('payload.from');
            $to = $request->input('payload.to');
            if (is_string($to) && $to !== '') {
                $this->incStatus($to);
            }
            if (is_string($from) && $from !== '') {
                $this->decStatus($from);
            }
        }
        return response()->json(['accepted' => true]);
    }

    public function analyticsByStatus()
    {
        $rows = AnalyticsStatusCount::query()->orderBy('status')->get();
        return response()->json($rows->map(fn ($r) => ['status' => $r->status, 'total' => (int) $r->total]));
    }

    protected function incStatus(string $status): void
    {
        $row = AnalyticsStatusCount::query()->where('status', $status)->first();
        if ($row) {
            $row->total = (int) $row->total + 1;
            $row->save();
        } else {
            AnalyticsStatusCount::create(['status' => $status, 'total' => 1]);
        }
    }

    protected function decStatus(string $status): void
    {
        $row = AnalyticsStatusCount::query()->where('status', $status)->first();
        if ($row) {
            $row->total = max(0, (int) $row->total - 1);
            $row->save();
        }
    }
}
