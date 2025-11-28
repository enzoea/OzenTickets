<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserBasicResource;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'setor', 'cargo', 'is_admin', 'tipo')->get();
        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $newUser = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'setor'    => $data['setor'] ?? null,
            'cargo'    => $data['cargo'] ?? null,
            'is_admin' => $data['is_admin'] ?? false,
            'tipo'     => $data['tipo'] ?? 'colaborador',
        ]);

        return (new UserResource($newUser))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request, User $user)
    {
        $current = $request->user();
        if ($current->id === $user->id) {
            return response()->json(['message' => 'Você não pode remover a si mesmo'], 400);
        }

        $user->delete();

        return response()->noContent();
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        $payload = [
            'name'     => $data['name'],
            'email'    => $data['email'],
            'setor'    => $data['setor'] ?? null,
            'cargo'    => $data['cargo'] ?? null,
            'is_admin' => $data['is_admin'] ?? false,
            'tipo'     => $data['tipo'] ?? 'colaborador',
        ];

        if (isset($data['password']) && $data['password']) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return new UserResource($user);
    }

    public function listBasic()
    {
        $users = User::select('id', 'name', 'email')->get();
        return UserBasicResource::collection($users);
    }
}
