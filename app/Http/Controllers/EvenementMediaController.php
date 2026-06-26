<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\EvenementMedia;
use App\Services\EventAuthorizationService;
use App\Services\MediaService;
use Illuminate\Http\Request;

class EvenementMediaController extends Controller
{
    public function __construct(
        private EventAuthorizationService $authorization,
        private MediaService $mediaService
    ) {}

    public function index()
    {
        return EvenementMedia::with('evenement')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'evenement_id' => ['required', 'exists:evenements,id'],
            'fichier' => ['required', 'file', 'max:51200'], // 50MB
            'description' => ['nullable', 'string', 'max:500'],
            'confidentialite' => ['nullable', 'string'],
            'is_public' => ['nullable', 'boolean'],
            'is_cover' => ['nullable', 'boolean'],
        ]);

        $evenement = Evenement::findOrFail($validated['evenement_id']);
        $this->authorizeAction($request, $evenement);

        try {
            $this->mediaService->uploadMedia($evenement, $request->file('fichier'), [
                'description' => $validated['description'] ?? null,
                'confidentialite' => $validated['confidentialite'] ?? 'public',
                'is_public' => $request->boolean('is_public', true),
                'is_cover' => $request->boolean('is_cover', false),
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['fichier' => $e->getMessage()]);
        }

        return back()->with('success', 'Média ajouté avec succès.');
    }

    public function show(EvenementMedia $evenementMedia)
    {
        return $evenementMedia;
    }

    public function update(Request $request, EvenementMedia $evenementMedia)
    {
        $this->authorizeAction($request, $evenementMedia->evenement);

        $validated = $request->validate([
            'description' => ['nullable', 'string', 'max:500'],
            'is_public' => ['nullable', 'boolean'],
            'is_cover' => ['nullable', 'boolean'],
            'confidentialite' => ['nullable', 'string'],
        ]);

        $this->mediaService->updateMedia($evenementMedia, $validated);

        return back()->with('success', 'Média mis à jour.');
    }

    public function destroy(Request $request, EvenementMedia $evenementMedia)
    {
        $this->authorizeAction($request, $evenementMedia->evenement);

        $this->mediaService->deleteMedia($evenementMedia);

        return back()->with('success', 'Média supprimé.');
    }

    private function authorizeAction(Request $request, Evenement $evenement): void
    {
        $user = $request->user();
        abort_unless($user, 403);

        if ($this->authorization->canEditEvent($evenement, $user)) {
            return;
        }

        abort(403, 'Action non autorisee');
    }
}
