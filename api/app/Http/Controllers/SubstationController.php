<?php

namespace App\Http\Controllers;

use App\Models\Substation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SubstationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Substation::orderBy('created_at', 'asc');

        // Filial foydalanuvchisi faqat o'z filiali podstansiyalarini ko'radi
        $user = $request->user();
        if (! $user->isAdmin()) {
            $query->where('met_filiali_nomi', $this->filialNomi($user));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'met_filiali_nomi' => 'required|string|max:255',
            'podstansiya_nomi' => 'required|string|max:255',
            'tarmoq_nomi' => 'nullable|string|max:255',
            'kuchlanishi' => 'required|integer',
            'hisoblagich_rusumi' => 'required|string|max:255',
            'elektr_hisoblagich_zavod_raqami' => 'nullable|string|max:255',
            'nominal_tok' => 'nullable|string|max:255',
            'nominal_kuchlanish' => 'nullable|string|max:255',
            'sim_karta_raqami' => 'nullable|string|max:255',
            'tt' => 'nullable|string|max:255',
            'kt' => 'nullable|string|max:255',
            'xisob_koef' => 'nullable|string|max:255',
            'muhr_raqami' => 'nullable|string|max:255',
            'oqim_yonalishi' => 'nullable|string|max:255',
            'hisoblagich_matish_naryad' => 'nullable|string|max:255',
            'voltage_category' => 'required|string|in:220-500kV,35-110kV',
        ]);

        // Filial foydalanuvchisi faqat o'z filialiga qo'sha oladi
        if (! $user->isAdmin()) {
            $validated['met_filiali_nomi'] = $this->filialNomi($user);
        }

        $substation = Substation::create($validated);

        return response()->json($substation, 201);
    }

    public function show(Request $request, Substation $substation): JsonResponse
    {
        $this->authorizeFilial($request->user(), $substation);

        return response()->json($substation);
    }

    public function update(Request $request, Substation $substation): JsonResponse
    {
        $user = $request->user();
        $this->authorizeFilial($user, $substation);

        $validated = $request->validate([
            'met_filiali_nomi' => 'sometimes|required|string|max:255',
            'podstansiya_nomi' => 'sometimes|required|string|max:255',
            'tarmoq_nomi' => 'nullable|string|max:255',
            'kuchlanishi' => 'sometimes|required|integer',
            'hisoblagich_rusumi' => 'sometimes|required|string|max:255',
            'elektr_hisoblagich_zavod_raqami' => 'nullable|string|max:255',
            'nominal_tok' => 'nullable|string|max:255',
            'nominal_kuchlanish' => 'nullable|string|max:255',
            'sim_karta_raqami' => 'nullable|string|max:255',
            'tt' => 'nullable|string|max:255',
            'kt' => 'nullable|string|max:255',
            'xisob_koef' => 'nullable|string|max:255',
            'muhr_raqami' => 'nullable|string|max:255',
            'oqim_yonalishi' => 'nullable|string|max:255',
            'hisoblagich_matish_naryad' => 'nullable|string|max:255',
            'voltage_category' => 'sometimes|required|string|in:220-500kV,35-110kV',
        ]);

        // Filial foydalanuvchisi podstansiyani boshqa filialga o'tkaza olmaydi
        if (! $user->isAdmin()) {
            $validated['met_filiali_nomi'] = $this->filialNomi($user);
        }

        $substation->update($validated);

        return response()->json($substation);
    }

    public function destroy(Request $request, Substation $substation): JsonResponse
    {
        $this->authorizeFilial($request->user(), $substation);

        $substation->delete();

        return response()->json(null, 204);
    }

    /**
     * Bir nechta podstansiyani (yoki kategoriyadagi hammasini) o'chirish.
     * `ids` — belgilangan qatorlar, `all` — filtrga mos hamma qator.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'ids' => 'required_without:all|array|min:1',
            'ids.*' => 'required|uuid',
            'all' => 'required_without:ids|boolean',
            'voltage_category' => 'nullable|string|in:220-500kV,35-110kV',
        ]);

        // `all: false` bilan hamma narsani o'chirib yubormaslik uchun
        if (empty($validated['ids']) && empty($validated['all'])) {
            abort(422, 'O\'chirish uchun qatorlarni belgilang yoki `all` ni yoqing.');
        }

        $query = Substation::query();

        // Filial foydalanuvchisi faqat o'z filiali qatorlarini o'chira oladi
        if (! $user->isAdmin()) {
            $query->where('met_filiali_nomi', $this->filialNomi($user));
        }

        if (! empty($validated['ids'])) {
            $query->whereIn('id', $validated['ids']);
        } elseif (! empty($validated['voltage_category'])) {
            $query->where('voltage_category', $validated['voltage_category']);
        }

        $deleted = $query->delete();

        return response()->json(['deleted' => $deleted]);
    }

    /**
     * Foydalanuvchining filial nomi (met_filiali_nomi bilan solishtiriladi).
     */
    private function filialNomi($user): ?string
    {
        return $user->filial?->nomi;
    }

    /**
     * Filial foydalanuvchisi faqat o'z filiali podstansiyasiga tegishi mumkin.
     */
    private function authorizeFilial($user, Substation $substation): void
    {
        if (! $user->isAdmin() && $substation->met_filiali_nomi !== $this->filialNomi($user)) {
            abort(403, 'Bu podstansiya sizning filialingizga tegishli emas.');
        }
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'voltage_category' => 'required|string|in:220-500kV,35-110kV',
        ]);

        $file = $request->file('file');
        $voltageCategory = $request->input('voltage_category');

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);

            $imported = 0;
            $errors = [];
            $headerSkipped = false;

            foreach ($rows as $rowIndex => $row) {
                // Birinchi qatorni (header) o'tkazib yuboramiz
                if (!$headerSkipped) {
                    $headerSkipped = true;
                    continue;
                }

                // Bo'sh qatorni o'tkazib yuboramiz
                $firstCol = trim((string)($row['A'] ?? $row['B'] ?? ''));
                if (empty($firstCol) && empty(trim((string)($row['C'] ?? '')))) {
                    continue;
                }

                try {
                    // Excel ustunlarini bazaga moslashtirish
                    // A = № (tartib raqami - o'tkazib yuboramiz)
                    // B = MET filiali nomi
                    // C = Podstansiya nomi
                    // D = Tarmoq nomi
                    // E = Kuchlanishi
                    // F = Hisoblagich rusumi
                    // G = Elektr hisoblagich zavod raqami
                    // H = Nominal tok
                    // I = Nominal kuchlanish
                    // J = Sim karta raqami
                    // K = TT
                    // L = KT
                    // M = Xisob koef
                    // N = Muhr raqami
                    // O = Oqim yonalishi
                    // P = Hisoblagich o'rnatish naryad

                    $metFiliali = trim((string)($row['B'] ?? ''));
                    $podstansiya = trim((string)($row['C'] ?? ''));
                    $kuchlanishi = (int)($row['E'] ?? 0);
                    $hisoblagichRusumi = trim((string)($row['F'] ?? ''));

                    // Majburiy maydonlarni tekshirish
                    if (empty($metFiliali) || empty($podstansiya) || empty($hisoblagichRusumi) || $kuchlanishi <= 0) {
                        $errors[] = "Qator {$rowIndex}: Majburiy maydonlar to'ldirilmagan (MET filiali, Podstansiya nomi, Kuchlanishi, Hisoblagich rusumi)";
                        continue;
                    }

                    Substation::create([
                        'met_filiali_nomi' => $metFiliali,
                        'podstansiya_nomi' => $podstansiya,
                        'tarmoq_nomi' => trim((string)($row['D'] ?? '')) ?: null,
                        'kuchlanishi' => $kuchlanishi,
                        'hisoblagich_rusumi' => $hisoblagichRusumi,
                        'elektr_hisoblagich_zavod_raqami' => trim((string)($row['G'] ?? '')) ?: null,
                        'nominal_tok' => trim((string)($row['H'] ?? '')) ?: null,
                        'nominal_kuchlanish' => trim((string)($row['I'] ?? '')) ?: null,
                        'sim_karta_raqami' => trim((string)($row['J'] ?? '')) ?: null,
                        'tt' => trim((string)($row['K'] ?? '')) ?: null,
                        'kt' => trim((string)($row['L'] ?? '')) ?: null,
                        'xisob_koef' => trim((string)($row['M'] ?? '')) ?: null,
                        'muhr_raqami' => trim((string)($row['N'] ?? '')) ?: null,
                        'oqim_yonalishi' => trim((string)($row['O'] ?? '')) ?: null,
                        'hisoblagich_matish_naryad' => trim((string)($row['P'] ?? '')) ?: null,
                        'voltage_category' => $voltageCategory,
                    ]);

                    $imported++;
                }
                catch (\Exception $e) {
                    $errors[] = "Qator {$rowIndex}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'errors' => $errors,
                'total_errors' => count($errors),
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Excel faylni o\'qishda xatolik: ' . $e->getMessage(),
            ], 422);
        }
    }
}