<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'project_id' => $this->project_id,
            'titulo' => $this->titulo,
            'subtitulo' => $this->subtitulo,
            'descricao' => $this->descricao,
            'status' => is_string($this->status) ? $this->status : ($this->status?->value),
            'prioridade' => is_string($this->prioridade) ? $this->prioridade : ($this->prioridade?->value),
            'responsavel_id' => $this->responsavel_id,
            'responsavel' => $this->whenLoaded('responsavel', function () {
                return $this->responsavel ? [
                    'id' => $this->responsavel->id,
                    'name' => $this->responsavel->name,
                ] : null;
            }),
            'solicitante_id' => $this->solicitante_id,
            'solicitante' => $this->whenLoaded('solicitante', function () {
                return $this->solicitante ? [
                    'id' => $this->solicitante->id,
                    'name' => $this->solicitante->name,
                ] : null;
            }),
            'data_prevista' => $this->data_prevista ? $this->data_prevista->toDateString() : null,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
