<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\Programme;
use Illuminate\Http\Request;

class ProgrammeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $this->validateProgramme($request, true);
        $evenement = Evenement::findOrFail($validated['evenement_id']);

        $this->authorizeAction($request, $evenement);
        $this->ensureNoRoomConflict($validated, $evenement->id);

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('programmes/documents', 'public');
            $validated['chemin_pdf'] = $path;
        }

        Programme::create($validated);

        $evenement->activities()->create([
            'user_id' => $request->user()->id,
            'type' => 'programme_ajoute',
            'label' => 'Mise à jour du planning',
            'description' => "Une nouvelle session \"{$validated['titre']}\" a été ajoutée au programme.",
        ]);

        return back();
    }

    public function update(Request $request, Programme $programme)
    {
        $validated = $this->validateProgramme($request, false);

        $this->authorizeAction($request, $programme->evenement);
        $this->ensureNoRoomConflict($validated, $programme->evenement_id, $programme->id);

        $programme->update($validated);

        return back();
    }

    public function destroy(Request $request, Programme $programme)
    {
        $this->authorizeAction($request, $programme->evenement);

        $programme->delete();

        return back();
    }

    public function byEvenement(Evenement $evenement)
    {
        return Programme::where('evenement_id', $evenement->id)
            ->orderBy('date_programme')
            ->orderBy('heure_debut')
            ->orderBy('ordre')
            ->get();
    }

    private function validateProgramme(Request $request, bool $requiresEventId): array
    {
        $rules = [
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'intervenant' => ['nullable', 'string', 'max:255'],
            'date_programme' => ['nullable', 'date'],
            'heure_debut' => ['nullable'],
            'heure_fin' => ['nullable'],
            'salle' => ['nullable', 'string', 'max:255'],
            'type_section' => ['nullable', 'string', 'max:255'],
            'ordre' => ['nullable', 'integer'],
            'document' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ];

        if ($requiresEventId) {
            $rules['evenement_id'] = ['required', 'exists:evenements,id'];
        }

        return $request->validate($rules);
    }

    private function authorizeAction(Request $request, Evenement $evenement): void
    {
        $user = $request->user();
        abort_unless($user, 403);

        if ($user->isAdmin() || $evenement->cree_par === $user->id) {
            return;
        }

        abort(403, 'Action non autorisee');
    }

    private function ensureNoRoomConflict(array $validated, int $eventId, ?int $ignoreProgrammeId = null): void
    {
        if (blank($validated['salle'] ?? null) || blank($validated['date_programme'] ?? null)) {
            return;
        }

        $heureDebut = $validated['heure_debut'] ?? '00:00:00';
        $heureFin = $validated['heure_fin'] ?? $heureDebut;

        // Performance : On ne fait la requête que si la salle est renseignée
        if ($validated['salle'] === 'En ligne' || $validated['salle'] === 'Externe') {
            return;
        }

        $conflict = Programme::query()
            ->where('evenement_id', $eventId)
            ->when($ignoreProgrammeId, fn ($builder) => $builder->where('id', '!=', $ignoreProgrammeId))
            ->where('salle', $validated['salle'])
            ->where('date_programme', $validated['date_programme'])
            ->where(function ($query) use ($heureDebut, $heureFin) {
                $query
                    ->whereBetween('heure_debut', [$heureDebut, $heureFin])
                    ->orWhereBetween('heure_fin', [$heureDebut, $heureFin])
                    ->orWhere(function ($nested) use ($heureDebut, $heureFin) {
                        $nested->where('heure_debut', '<=', $heureDebut)
                            ->where('heure_fin', '>=', $heureFin);
                    });
            })
            ->first();

        if (! $conflict) {
            return;
        }

        abort(422, 'Cette salle est deja utilisee a cette heure.');
    }
}
