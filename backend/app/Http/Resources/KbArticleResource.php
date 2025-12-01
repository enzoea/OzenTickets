<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KbArticleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'slug' => $this->slug,
            'conteudo' => $this->conteudo,
            'status' => $this->status,
            'visibilidade' => $this->visibilidade,
            'autor' => $this->whenLoaded('author', function () {
                return $this->author ? [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                ] : null;
            }),
            'categoria' => $this->whenLoaded('category', function () {
                return $this->category ? [
                    'id' => $this->category->id,
                    'nome' => $this->category->nome,
                ] : null;
            }),
            'tickets' => $this->whenLoaded('tickets', function () {
                return $this->tickets->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'codigo' => $t->codigo,
                        'titulo' => $t->titulo,
                    ];
                });
            }),
        ];
    }
}

