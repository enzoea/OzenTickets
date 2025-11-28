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
            'solicitante_id' => ['sometimes','nullable','exists:users,id'],
            'data_prevista' => ['sometimes','nullable','date'],
        ];
    }
}
