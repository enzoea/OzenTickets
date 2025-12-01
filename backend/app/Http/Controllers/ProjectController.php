<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $projects = $user
            ? $user->projects()->select('id', 'nome')->get()
            : Project::query()->select('id', 'nome')->get();
        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => ['required','string','max:255'],
            'descricao' => ['nullable','string'],
        ]);
        $project = Project::create($data);
        $request->user()?->projects()->syncWithoutDetaching([$project->id]);
        return response()->json($project, 201);
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'nome' => ['required','string','max:255'],
            'descricao' => ['nullable','string'],
        ]);
        $project->update($data);
        return response()->json($project);
    }

    public function destroy(Request $request, Project $project)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($project) {
            // Remove todos os tickets do projeto (updates são removidas por cascade)
            $project->tickets()->delete();
            // Remover o projeto (pivot project_user é cascade)
            $project->delete();
        });
        return response()->json(['deleted' => true]);
    }

    public function members(Project $project)
    {
        return response()->json($project->users()->select('id','name','email')->get());
    }

    public function addMember(Request $request, Project $project)
    {
        $data = $request->validate([
            'user_id' => ['nullable','exists:users,id'],
            'email' => ['nullable','string','max:255'],
        ]);
        $userId = $data['user_id'] ?? null;
        if (!$userId && !empty($data['email'])) {
            $userId = \App\Models\User::where('email', $data['email'])->value('id');
        }
        if (!$userId) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }
        $project->users()->syncWithoutDetaching([$userId]);
        return response()->json(['linked' => true]);
    }

    public function removeMember(Project $project, \App\Models\User $user)
    {
        $project->users()->detach($user->id);
        return response()->json(['unlinked' => true]);
    }
}
