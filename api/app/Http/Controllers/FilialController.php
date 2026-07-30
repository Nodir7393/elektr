<?php

namespace App\Http\Controllers;

use App\Models\Filial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FilialController extends Controller
{
    public function index(): JsonResponse
    {
        $filiallar = Filial::withCount('substations')
            ->orderBy('nomi')
            ->get();

        return response()->json($filiallar);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nomi' => 'required|string|max:255|unique:filiallar,nomi',
        ]);

        $filial = Filial::create($validated);

        return response()->json($filial, 201);
    }

    public function update(Request $request, Filial $filial): JsonResponse
    {
        $validated = $request->validate([
            'nomi' => 'required|string|max:255|unique:filiallar,nomi,' . $filial->id,
        ]);

        $filial->update($validated);

        return response()->json($filial);
    }

    public function destroy(Filial $filial): JsonResponse
    {
        $filial->delete();

        return response()->json(null, 204);
    }
}
