<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Project;
use App\Models\OutboxEvent;

class ProjectMemberOutboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_member_creates_outbox_event(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin);
        $project = Project::create(['nome' => 'P', 'descricao' => null]);
        $user = User::factory()->create();

        $this->postJson("/api/projects/{$project->id}/members", ['user_id' => $user->id])
            ->assertStatus(200);

        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('project.member_added', $evt->type);
        $this->assertSame($project->id, $evt->payload['project_id']);
        $this->assertSame($user->id, $evt->payload['user_id']);
        $this->assertSame($admin->id, $evt->payload['by_user_id']);
    }

    public function test_remove_member_creates_outbox_event(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin);
        $project = Project::create(['nome' => 'P', 'descricao' => null]);
        $user = User::factory()->create();
        $project->users()->syncWithoutDetaching([$user->id]);

        $this->deleteJson("/api/projects/{$project->id}/members/{$user->id}")
            ->assertStatus(200);

        $evt = OutboxEvent::latest('id')->first();
        $this->assertNotNull($evt);
        $this->assertSame('project.member_removed', $evt->type);
        $this->assertSame($project->id, $evt->payload['project_id']);
        $this->assertSame($user->id, $evt->payload['user_id']);
        $this->assertSame($admin->id, $evt->payload['by_user_id']);
    }
}
