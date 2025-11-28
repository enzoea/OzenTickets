<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'subtitulo',
        'descricao',
        'status',
        'prioridade',
        'responsavel_id',
        'solicitante_id',
        'data_prevista',
    ];

    protected $casts = [
        'status' => TicketStatus::class,
        'prioridade' => TicketPriority::class,
        'data_prevista' => 'date',
        'responsavel_id' => 'integer',
        'solicitante_id' => 'integer',
    ];

    public function responsavel()
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function scopeByStatus(Builder $query, TicketStatus|string|null $status): Builder
    {
        if (!$status) return $query;
        $value = $status instanceof TicketStatus ? $status->value : $status;
        return $query->where('status', $value);
    }

    public function scopeOfUsers(Builder $query, array|string|null $ids): Builder
    {
        if (!$ids || (is_array($ids) && count($ids) === 0)) return $query;
        $ids = is_array($ids) ? $ids : [$ids];
        $ids = array_map(fn ($v) => $v === '__none__' ? null : (int) $v, $ids);
        return $query->where(function ($q) use ($ids) {
            if (in_array(null, $ids, true)) {
                $q->orWhereNull('responsavel_id');
            }
            $numericIds = array_values(array_filter($ids, fn ($v) => $v !== null));
            if (count($numericIds) > 0) {
                $q->orWhereIn('responsavel_id', $numericIds);
            }
        });
    }

    public function scopeInDateRange(Builder $query, ?string $from, ?string $to): Builder
    {
        if (!$from && !$to) return $query;
        if ($from) $query->whereDate('data_prevista', '>=', $from);
        if ($to) $query->whereDate('data_prevista', '<=', $to);
        return $query;
    }
}
