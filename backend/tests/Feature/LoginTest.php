<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_seeded_admin(): void
    {
        // seed admin credentials
        User::updateOrCreate(
            ['email' => 'adm'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('adm'),
                'is_admin' => true,
                'tipo' => 'colaborador',
            ]
        );

        $res = $this->postJson('/api/login', [
            'email' => 'adm',
            'password' => 'adm',
        ]);

        $res->assertOk();
        $data = $res->json();
        $this->assertIsString($data['token'] ?? null);
        $this->assertSame('adm', $data['user']['email']);
    }
}
