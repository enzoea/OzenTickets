<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'adm'],
            [
                'name'     => 'Administrador',
                'password' => Hash::make('adm'),
                'setor'    => 'Administração',
                'cargo'    => 'Administrador do sistema',
                'is_admin' => true,
                'tipo'     => 'colaborador',
            ]
        );
    }
}
