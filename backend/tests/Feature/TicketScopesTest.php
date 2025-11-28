<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketScopesTest extends TestCase
{
    use RefreshDatabase;

    public function test_ofUsers_scope_filters_by_ids_and_none(): void
    {
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();

        Ticket::create(['titulo' => 'T1', 'status' => 'backlog', 'responsavel_id' => null, 'data_prevista' => '2025-11-25']);
        Ticket::create(['titulo' => 'T2', 'status' => 'a_fazer', 'responsavel_id' => $u1->id, 'data_prevista' => '2025-11-26']);
        Ticket::create(['titulo' => 'T3', 'status' => 'fazendo', 'responsavel_id' => $u2->id, 'data_prevista' => '2025-11-28']);

        $this->assertEquals(1, Ticket::query()->ofUsers(['__none__'])->count());
        $this->assertEquals(1, Ticket::query()->ofUsers([$u1->id])->count());
        $this->assertEquals(2, Ticket::query()->ofUsers(['__none__', $u2->id])->count());
    }

    public function test_inDateRange_and_byStatus_scopes(): void
    {
        $u1 = User::factory()->create();
        Ticket::create(['titulo' => 'T2', 'status' => 'a_fazer', 'responsavel_id' => $u1->id, 'data_prevista' => '2025-11-26']);
        Ticket::create(['titulo' => 'T3', 'status' => 'fazendo', 'responsavel_id' => null, 'data_prevista' => '2025-11-28']);

        $this->assertEquals(1, Ticket::query()->inDateRange('2025-11-26', '2025-11-27')->count());
        $this->assertEquals(1, Ticket::query()->byStatus('fazendo')->count());
    }
}

