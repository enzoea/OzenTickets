<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciais inválidas',
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // apaga tokens antigos se quiser garantir 1 por vez
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'setor'    => $user->setor,
                'cargo'    => $user->cargo,
                'is_admin' => $user->is_admin,
                'tipo'     => $user->tipo,
            ],
        ]);
    }

    public function me(\Illuminate\Http\Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'setor'    => $user->setor,
            'cargo'    => $user->cargo,
            'is_admin' => $user->is_admin,
            'tipo'     => $user->tipo,
        ]);
    }

    public function logout(\Illuminate\Http\Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->tokens()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }
}
