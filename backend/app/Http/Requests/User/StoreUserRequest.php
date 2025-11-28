<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'email' => ['required','email','unique:users,email'],
            'password' => ['required','string','min:6'],
            'setor' => ['nullable','string','max:255'],
            'cargo' => ['nullable','string','max:255'],
            'is_admin' => ['boolean'],
            'tipo' => ['required', 'string', Rule::in(['colaborador','cliente'])],
        ];
    }
}
