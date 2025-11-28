<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var \App\Models\User|null $user */
        $user = $this->route('user');
        $userId = $user?->id ?? null;

        return [
            'name' => ['required','string','max:255'],
            'email' => ['required','email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable','string','min:6'],
            'setor' => ['nullable','string','max:255'],
            'cargo' => ['nullable','string','max:255'],
            'is_admin' => ['boolean'],
            'tipo' => ['required','string', Rule::in(['colaborador','cliente'])],
        ];
    }
}

