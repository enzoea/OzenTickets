<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Project;
use App\Models\Ticket;
use App\Models\OutboxEvent;
use App\Services\TicketService;

class TicketOutboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_change_creates_outbox_event(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $project = Project::create(['nome' => 'X', 'descricao' => null]);
        $ticket = Ticket::create([
            'project_id' => $project->id,
            'titulo' => 'T',
            'status' => 'a_fazer',
        ]);
        $this->assertDatabaseCount('outbox_events', 0);
        $svc = new TicketService();
        $svc->update($ticket, ['status' => 'fazendo']);
        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('ticket.status_changed', $evt->type);
        $this->assertIsArray($evt->payload);
        $this->assertSame($ticket->id, $evt->payload['ticket_id']);
        $this->assertSame('a_fazer', $evt->payload['from']);
        $this->assertSame('fazendo', $evt->payload['to']);
    }
}
