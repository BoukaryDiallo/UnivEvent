<?php

namespace App\Http\Controllers;

use App\Contrats\DispoContrat;
use App\Http\Requests\PriseRequest;
use App\Models\Prise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriseController extends Controller
{
    public function __construct(
        protected DispoContrat $metier
    ) {}

    public function etat(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'date' => ['required', 'date'],
            'debut' => ['required', 'date_format:H:i'],
            'fin' => ['required', 'date_format:H:i'],
        ]);

        return response()->json(
            $this->metier->etat(
                (int) $request->integer('user_id'),
                (string) $request->string('date'),
                (string) $request->string('debut').':00',
                (string) $request->string('fin').':00',
            )
        );
    }

    public function store(PriseRequest $request): JsonResponse
    {
        $data = $request->validated();

        $prise = $this->metier->prendre(
            $data['user_id'],
            $data['date'],
            $data['debut'].':00',
            $data['fin'].':00',
            $data['source'],
            $data['ref'] ?? null,
            $data['motif'] ?? null,
        );

        return response()->json([
            'ok' => true,
            'id' => $prise->id,
        ], 201);
    }

    public function destroy(Prise $prise): JsonResponse
    {
        $prise = $this->metier->liberer($prise);

        return response()->json([
            'ok' => true,
            'libere_at' => $prise->libere_at?->toDateTimeString(),
        ]);
    }
}
