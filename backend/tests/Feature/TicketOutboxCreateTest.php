<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Project;
use App\Models\OutboxEvent;
use App\Services\TicketService;

class TicketOutboxCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_create_emits_outbox_event(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $project = Project::create(['nome' => 'P', 'descricao' => null]);
        $svc = new TicketService();
        $ticket = $svc->create([
            'project_id' => $project->id,
            'titulo' => 'Novo Ticket',
            'status' => 'a_fazer',
        ]);
        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('ticket.created', $evt->type);
        $this->assertIsArray($evt->payload);
        $this->assertSame($ticket->id, $evt->payload['ticket_id']);
        $this->assertSame($project->id, $evt->payload['project_id']);
        $this->assertSame('a_fazer', $evt->payload['status']);
        $this->assertSame('Novo Ticket', $evt->payload['titulo']);
    }
}
