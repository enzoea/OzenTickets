<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Tag::orderBy('name','asc')->get());
    }

    public function store(Request $request)
    {
        if (($request->user()?->tipo ?? null) === 'cliente') {
            return response()->json(['message' => 'Apenas colaboradores/admin podem criar tags'], 403);
        }
        $data = $request->validate([
            'name' => ['required','string','max:100','unique:tags,name'],
        ]);
        $slug = Str::slug($data['name']);
        $tag = Tag::create(['name' => $data['name'], 'slug' => $slug]);
        return response()->json($tag, 201);
    }

    public function update(Request $request, Tag $tag)
    {
        $data = $request->validate([
            'name' => ['required','string','max:100','unique:tags,name,' . $tag->id],
        ]);
        $slug = Str::slug($data['name']);
        $tag->update(['name' => $data['name'], 'slug' => $slug]);
        return response()->json($tag);
    }

    public function destroy(Request $request, Tag $tag)
    {
        $tag->delete();
        return response()->json(null, 204);
    }
}
