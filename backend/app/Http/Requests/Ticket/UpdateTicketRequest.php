<?php

namespace App\Http\Requests\Ticket;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes','string','max:255'],
            'subtitulo' => ['sometimes','nullable','string','max:255'],
            'descricao' => ['sometimes','nullable','string'],
            'status' => ['sometimes', Rule::enum(TicketStatus::class)],
            'prioridade' => ['sometimes', Rule::enum(TicketPriority::class)],
            'responsavel_id' => ['sometimes','nullable','exists:users,id'],
            'assigned_to_user_id' => ['sometimes','nullable','exists:users,id'],
            'solicitante_id' => ['sometimes','nullable','exists:users,id'],
            'data_prevista' => ['sometimes','nullable','date'],
            'sla_hours' => ['sometimes','nullable','integer','min:1'],
            'due_at' => ['sometimes','nullable','date'],
            'resolved_at' => ['sometimes','nullable','date'],
            'tag_ids' => ['sometimes','array'],
            'tag_ids.*' => ['integer','exists:tags,id'],
            'project_id' => ['sometimes','exists:projects,id'],
        ];
    }
}
