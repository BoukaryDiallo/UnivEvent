<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use App\Models\Evenement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

use App\Services\CertificateGenerator;

class CertificatController extends Controller
{
    public function __construct(private CertificateGenerator $generator)
    {
    }

    public function bulkGenerate(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'evenement_id' => 'required|exists:evenements,id',
        ]);

        $evenement = Evenement::with(['assignments.user', 'inscriptions.utilisateur'])->findOrFail($validated['evenement_id']);

        // Security check
        if ($user->role !== 'admin' && $evenement->cree_par !== $user->id) {
            abort(403);
        }

        if (!$evenement->evenement_certifie) {
            return back()->withErrors(['error' => 'Cet événement n\'est pas configuré comme certifiant.']);
        }

        $count = 0;

        // 1. Issue to Speakers (Intervenants)
        $speakers = $evenement->assignments->where('role', 'intervenant');
        foreach ($speakers as $assignment) {
            if ($assignment->user) {
                $this->generator->generate($evenement, $assignment->user, [], 'attestation_intervenant');
                $count++;
            }
        }

        // 2. Issue to Validated Participants
        $inscriptions = $evenement->inscriptions->where('statut', 'accepte');
        foreach ($inscriptions as $inscription) {
            if ($inscription->utilisateur) {
                $this->generator->generate($evenement, $inscription->utilisateur);
                $count++;
            }
        }

        return back()->with('success', "{$count} certificats ont été délivrés avec succès.");
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $certificats = Certificat::where('utilisateur_id', $user->id)
            ->with('evenement')
            ->latest()
            ->get()
            ->map(fn($cert) => [
                'id' => $cert->id,
                'evenement_titre' => $cert->evenement->titre,
                'date_evenement' => $cert->evenement->date_debut->format('d/m/Y'),
                'type_certificat' => $cert->type_certificat ?? 'participation',
                'numero_serie' => $cert->code_certificat,
                'token_verification' => $cert->code_certificat,
                'created_at' => $cert->created_at->format('d/m/Y'),
            ]);

        return Inertia::render('module5/certificats/Index', [
            'certificats' => $certificats,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function download(Certificat $certificat)
    {
        $user = Auth::user();
        $evenement = $certificat->evenement;

        // Autorisation : Participant lui-même OR Admin OR Créateur de l'événement OR Organisateur assigné
        $isParticipant = $certificat->utilisateur_id === $user->id;
        $isCreator = $evenement->cree_par === $user->id;
        $isAdmin = $user->role === 'admin';
        $isOrganizer = $evenement->assignments()
            ->where('user_id', $user->id)
            ->where('role', 'organisateur')
            ->exists();

        if (!$isParticipant && !$isCreator && !$isAdmin && !$isOrganizer) {
            abort(403, 'Vous n\'avez pas l\'autorisation de télécharger ce certificat.');
        }

        if (!$certificat->fichier || !Storage::disk('public')->exists($certificat->fichier)) {
            abort(404, 'Fichier PDF du certificat non trouvé sur le serveur.');
        }

        $filename = "Certificat_{$evenement->titre}_{$certificat->utilisateur->name}.pdf";

        return response()->download(storage_path('app/public/' . $certificat->fichier), $filename);
    }

    public function verify($token)
    {
        $certificat = Certificat::where('code_certificat', $token)
            ->with(['utilisateur', 'evenement'])
            ->first();

        if (!$certificat) {
            return Inertia::render('module5/certificats/Verify', [
                'certificat' => null,
                'token' => $token,
            ]);
        }

        return Inertia::render('module5/certificats/Verify', [
            'certificat' => [
                'valide' => $certificat->statut !== 'revoque',
                'nom_participant' => $certificat->utilisateur->name,
                'prenom_participant' => '',
                'titre_evenement' => $certificat->evenement->titre,
                'date_evenement' => $certificat->evenement->date_debut->format('d/m/Y'),
                'type_certificat' => $certificat->type_certificat ?? 'participation',
                'numero_serie' => $certificat->code_certificat,
            ],
            'token' => $token,
        ]);
    }
}
