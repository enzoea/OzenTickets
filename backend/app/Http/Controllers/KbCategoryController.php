<?php

namespace App\Http\Controllers;

use App\Models\KbCategory;
use App\Http\Resources\KbCategoryResource;
use Illuminate\Http\Request;

class KbCategoryController extends Controller
{
    public function index()
    {
        $categories = KbCategory::orderBy('nome')->get();
        return KbCategoryResource::collection($categories);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
        ]);
        $category = KbCategory::create($data);
        return new KbCategoryResource($category);
    }

    public function update(Request $request, KbCategory $category)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
        ]);
        $category->update($data);
        return new KbCategoryResource($category);
    }

    public function destroy(KbCategory $category)
    {
        $category->delete();
        return response()->noContent();
    }
}

