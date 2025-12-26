<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Autentica um usuário e retorna token e dados básicos.
     * Rota: POST /api/login (pública, throttle 10/min)
     * Body: { email, password }
     * Resposta: { token, user }
     */
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

    /**
     * Retorna dados do usuário autenticado.
     * Rota: GET /api/me (auth:sanctum)
     */
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

    /**
     * Revoga tokens do usuário atual (logout).
     * Rota: POST /api/logout (auth:sanctum)
     */
    public function logout(\Illuminate\Http\Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->tokens()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    /**
     * Registra novo usuário colaborador (não admin) e autentica.
     * Rota: POST /api/register (pública, throttle 10/min)
     * Body: { name, email, password }
     * Resposta: { token, user }
     */
    public function register(\Illuminate\Http\Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','string','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_admin' => false,
            'tipo' => 'colaborador',
        ]);

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
        ], 201);
    }

    /**
     * Solicita código de recuperação de senha via e-mail.
     * Rota: POST /api/forgot-password (pública, throttle 10/min)
     * Body: { email }
     * Resposta: { message }
     * Observação: Em ambiente local, o conteúdo do e-mail é gravado em storage/logs/laravel.log.
     */
    public function forgotPassword(\Illuminate\Http\Request $request)
    {
        $data = $request->validate([
            'email' => ['required','string','email','max:255'],
        ]);
        $email = strtolower($data['email']);
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $key = 'pwd_reset:' . sha1($email);
        if ($user) {
            Cache::put($key, [
                'hash' => hash('sha256', $code),
                'ts' => time(),
            ], now()->addMinutes(15));
            try {
                Mail::raw('Seu código de recuperação: ' . $code, function ($m) use ($email) {
                    $m->to($email)->subject('Recuperação de senha');
                });
            } catch (\Throwable $e) {
                \Log::error('Falha ao enviar e-mail de recuperação', [
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
            if (app()->isLocal()) {
                Log::info('Dev password reset code generated', ['email' => $email, 'code' => $code]);
            }
        }
        return response()->json([
            'message' => 'Se existir conta, um código foi enviado para o e-mail informado.',
        ]);
    }

    /**
     * Redefine a senha usando código enviado por e-mail.
     * Rota: POST /api/reset-password (pública, throttle 10/min)
     * Body: { email, code, password }
     * Resposta: { message }
     */
    public function resetPassword(\Illuminate\Http\Request $request)
    {
        $data = $request->validate([
            'email' => ['required','string','email','max:255'],
            'code' => ['required','string','size:6'],
            'password' => ['required','string','min:6'],
        ]);
        $email = strtolower($data['email']);
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        if (!$user) {
            return response()->json(['message' => 'Código inválido'], 422);
        }
        $key = 'pwd_reset:' . sha1($email);
        $stored = Cache::get($key);
        if (!$stored || !is_array($stored) || empty($stored['hash'])) {
            return response()->json(['message' => 'Código inválido ou expirado'], 422);
        }
        $ok = hash_equals($stored['hash'], hash('sha256', $data['code']));
        if (!$ok) {
            return response()->json(['message' => 'Código inválido'], 422);
        }
        $user->password = Hash::make($data['password']);
        $user->save();
        Cache::forget($key);
        return response()->json(['message' => 'Senha redefinida com sucesso']);
    }
}
