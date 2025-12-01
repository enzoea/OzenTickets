<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Garante projeto "Projeto 1"
        $projectId = DB::table('projects')->where('nome', 'Projeto 1')->value('id');
        if (!$projectId) {
            $projectId = DB::table('projects')->insertGetId([
                'nome' => 'Projeto 1',
                'descricao' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Atribui todos os tickets existentes sem projeto ao "Projeto 1"
        DB::table('tickets')->whereNull('project_id')->update(['project_id' => $projectId]);

        // Anexa o projeto a todos os usuários para aparecer no menu
        $userIds = DB::table('users')->pluck('id');
        foreach ($userIds as $uid) {
            DB::table('project_user')->updateOrInsert([
                'project_id' => $projectId,
                'user_id' => $uid,
            ], []);
        }
    }

    public function down(): void
    {
        $projectId = DB::table('projects')->where('nome', 'Projeto 1')->value('id');
        if ($projectId) {
            // Remove vínculos e desassocia tickets
            DB::table('project_user')->where('project_id', $projectId)->delete();
            DB::table('tickets')->where('project_id', $projectId)->update(['project_id' => null]);
            DB::table('projects')->where('id', $projectId)->delete();
        }
    }
};

