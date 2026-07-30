<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('filial')->orderBy('created_at', 'desc')->get();

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,filial',
            'filial_id' => 'nullable|integer|exists:filiallar,id|required_if:role,filial',
        ]);

        // Admin uchun filial bog'lanmaydi
        if ($validated['role'] === 'admin') {
            $validated['filial_id'] = null;
        }

        $user = User::create($validated);

        return response()->json($user->load('filial'), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|string|in:admin,filial',
            'filial_id' => 'nullable|integer|exists:filiallar,id',
        ]);

        // Bo'sh parol yuborilsa — o'zgartirmaymiz
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $role = $validated['role'] ?? $user->role;
        if ($role === 'admin') {
            $validated['filial_id'] = null;
        } elseif ($role === 'filial' && empty($validated['filial_id']) && ! $user->filial_id) {
            return response()->json(['message' => 'Filial foydalanuvchisi uchun filial tanlanishi shart.'], 422);
        }

        $user->update($validated);

        return response()->json($user->load('filial'));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        // O'zini o'zi o'chira olmasin
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'O\'zingizni o\'chira olmaysiz.'], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
