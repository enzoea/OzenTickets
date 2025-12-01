<?php

namespace App\Http\Requests\Ticket;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required','string','max:255'],
            'subtitulo' => ['nullable','string','max:255'],
            'descricao' => ['nullable','string'],
            'status' => [Rule::enum(TicketStatus::class)],
            'prioridade' => ['nullable', Rule::enum(TicketPriority::class)],
            'responsavel_id' => ['nullable','exists:users,id'],
            'assigned_to_user_id' => ['nullable','exists:users,id'],
            'solicitante_id' => ['nullable','exists:users,id'],
            'data_prevista' => ['nullable','date'],
            'sla_hours' => ['nullable','integer','min:1'],
            'due_at' => ['nullable','date'],
            'resolved_at' => ['nullable','date'],
            'tag_ids' => ['nullable','array'],
            'tag_ids.*' => ['integer','exists:tags,id'],
            'project_id' => ['required','exists:projects,id'],
        ];
    }
}
