<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Project;
use App\Models\Ticket;
use App\Models\OutboxEvent;

class TicketCommentOutboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_comment_creates_outbox_event(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $project = Project::create(['nome' => 'P', 'descricao' => null]);
        $user->projects()->syncWithoutDetaching([$project->id]);
        $ticket = Ticket::create(['project_id' => $project->id, 'titulo' => 'T', 'status' => 'a_fazer']);

        $this->postJson("/api/tickets/{$ticket->id}/updates", ['conteudo' => 'Comentario'])
            ->assertStatus(201);

        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('ticket.comment_added', $evt->type);
        $this->assertSame($ticket->id, $evt->payload['ticket_id']);
        $this->assertSame($user->id, $evt->payload['user_id']);
        $this->assertIsInt($evt->payload['update_id']);
    }
}
