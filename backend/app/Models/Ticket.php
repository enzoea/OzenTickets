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
        'codigo',
        'project_id',
        'titulo',
        'subtitulo',
        'descricao',
        'status',
        'prioridade',
        'responsavel_id',
        'assigned_to_user_id',
        'solicitante_id',
        'data_prevista',
        'sla_hours',
        'due_at',
        'resolved_at',
    ];

    protected $casts = [
        'codigo' => 'integer',
        'status' => TicketStatus::class,
        'prioridade' => TicketPriority::class,
        'data_prevista' => 'date',
        'due_at' => 'date',
        'resolved_at' => 'datetime',
        'responsavel_id' => 'integer',
        'assigned_to_user_id' => 'integer',
        'solicitante_id' => 'integer',
        'sla_hours' => 'integer',
    ];

    public function responsavel()
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function updates()
    {
        return $this->hasMany(TicketUpdate::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'ticket_tag');
    }

    public function attachments()
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function kbArticles()
    {
        return $this->belongsToMany(KbArticle::class, 'kb_article_ticket');
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

    public function scopeInDueDateRange(Builder $query, ?string $from, ?string $to): Builder
    {
        if (!$from && !$to) return $query;
        if ($from) $query->whereDate('due_at', '>=', $from);
        if ($to) $query->whereDate('due_at', '<=', $to);
        return $query;
    }

    public function scopeOfProject(Builder $query, $projectId): Builder
    {
        if (!$projectId) return $query;
        return $query->where('project_id', (int) $projectId);
    }

    public function scopeMatchesQuery(Builder $query, ?string $q): Builder
    {
        $q = is_string($q) ? trim($q) : '';
        if (str_starts_with($q, '#')) {
            $q = ltrim($q, '#');
        }
        if ($q === '') return $query;

        $isNumeric = ctype_digit($q);
        $query->where(function ($sub) use ($q, $isNumeric) {
            if ($isNumeric) {
                $sub->orWhere('codigo', (int) $q)
                    ->orWhere('id', (int) $q);
            }
            $like = '%' . str_replace(['%','_'], ['\%','\_'], $q) . '%';
            $sub->orWhere('titulo', 'like', $like)
                ->orWhere('subtitulo', 'like', $like)
                ->orWhere('descricao', 'like', $like)
                ->orWhereExists(function ($exists) use ($like) {
                    $exists->selectRaw(1)
                        ->from('ticket_updates')
                        ->whereColumn('ticket_updates.ticket_id', 'tickets.id')
                        ->where('ticket_updates.conteudo', 'like', $like);
                });
        });

        return $query;
    }
}
