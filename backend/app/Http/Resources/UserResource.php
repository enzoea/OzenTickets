<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'setor' => $this->setor,
            'cargo' => $this->cargo,
            'is_admin' => (bool) $this->is_admin,
            'tipo' => $this->tipo,
        ];
    }
}
