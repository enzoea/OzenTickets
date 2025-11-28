<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MetricsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);
    }

    public function test_by_status_metrics_can_be_filtered(): void
    {
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();

        Ticket::create(['titulo' => 'T1', 'status' => 'backlog', 'responsavel_id' => null, 'data_prevista' => '2025-11-25']);
        Ticket::create(['titulo' => 'T2', 'status' => 'a_fazer', 'responsavel_id' => $u1->id, 'data_prevista' => '2025-11-26']);
        Ticket::create(['titulo' => 'T3', 'status' => 'fazendo', 'responsavel_id' => $u2->id, 'data_prevista' => '2025-11-28']);

        $res = $this->getJson('/api/metrics/by-status');
        $res->assertOk();
        $data = $res->json();
        $map = collect($data)->mapWithKeys(fn ($r) => [$r['status'] => $r['total']])->all();
        $this->assertEquals(1, $map['backlog']);
        $this->assertEquals(1, $map['a_fazer']);
        $this->assertEquals(1, $map['fazendo']);

        $res2 = $this->getJson('/api/metrics/by-status?responsavel_id[]=__none__');
        $res2->assertOk();
        $data2 = $res2->json();
        $map2 = collect($data2)->mapWithKeys(fn ($r) => [$r['status'] => $r['total']])->all();
        $this->assertEquals(1, $map2['backlog']);
        $this->assertTrue(!isset($map2['a_fazer']) && !isset($map2['fazendo']));

        $res3 = $this->getJson('/api/metrics/by-status?from=2025-11-26&to=2025-11-27');
        $res3->assertOk();
        $data3 = $res3->json();
        $map3 = collect($data3)->mapWithKeys(fn ($r) => [$r['status'] => $r['total']])->all();
        $this->assertEquals(1, $map3['a_fazer']);
        $this->assertTrue(!isset($map3['backlog']) && !isset($map3['fazendo']));
    }

    public function test_by_user_metrics(): void
    {
        $u1 = User::factory()->create(['name' => 'U1']);
        Ticket::create(['titulo' => 'T1', 'status' => 'backlog', 'responsavel_id' => null]);
        Ticket::create(['titulo' => 'T2', 'status' => 'a_fazer', 'responsavel_id' => $u1->id]);

        $res = $this->getJson('/api/metrics/by-user');
        $res->assertOk();
        $data = $res->json();
        $names = collect($data)->pluck('name')->all();
        $this->assertTrue(in_array('Sem responsável', $names));
        $this->assertTrue(in_array('U1', $names));
    }
}

