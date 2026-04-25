<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\EvenementMedia;
use App\Services\EventAuthorizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EvenementMediaController extends Controller
{
    public function __construct(private EventAuthorizationService $authorization)
    {
    }

    public function index()
    {
        return EvenementMedia::with('evenement')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'evenement_id' => ['required', 'exists:evenements,id'],
            'fichier' => ['required', 'file', 'max:10240'],
        ]);

        $evenement = Evenement::findOrFail($validated['evenement_id']);
        $this->authorizeAction($request, $evenement);

        $file = $request->file('fichier');
        $path = Storage::disk('public')->put('evenements', $file);

        EvenementMedia::create([
            'evenement_id' => $evenement->id,
            'type' => str_contains((string) $file->getMimeType(), 'pdf') ? 'pdf' : 'image',
            'chemin_fichier' => $path,
            'nom_original' => $file->getClientOriginalName(),
            'taille' => $file->getSize(),
        ]);

        return back();
    }

    public function show(EvenementMedia $evenementMedia)
    {
        return $evenementMedia;
    }

    public function update(Request $request, EvenementMedia $evenementMedia)
    {
        $this->authorizeAction($request, $evenementMedia->evenement);

        $request->validate([
            'fichier' => ['required', 'file', 'max:10240'],
        ]);

        Storage::disk('public')->delete($evenementMedia->chemin_fichier);

        $file = $request->file('fichier');
        $path = Storage::disk('public')->put('evenements', $file);

        $evenementMedia->update([
            'type' => str_contains((string) $file->getMimeType(), 'pdf') ? 'pdf' : 'image',
            'chemin_fichier' => $path,
            'nom_original' => $file->getClientOriginalName(),
            'taille' => $file->getSize(),
        ]);

        return back();
    }

    public function destroy(Request $request, EvenementMedia $evenementMedia)
    {
        $this->authorizeAction($request, $evenementMedia->evenement);

        Storage::disk('public')->delete($evenementMedia->chemin_fichier);
        $evenementMedia->delete();

        return back();
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
