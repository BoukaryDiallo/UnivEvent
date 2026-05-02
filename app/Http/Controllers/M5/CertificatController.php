<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use App\Models\Evenement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CertificatController extends Controller
{
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

        return Inertia::render('m5/certificats/Index', [
            'certificats' => $certificats,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function download(Certificat $certificat)
    {
        if ($certificat->utilisateur_id !== Auth::id()) {
            abort(403);
        }

        if (!$certificat->fichier || !Storage::disk('public')->exists($certificat->fichier)) {
            abort(404, 'Fichier non trouvé');
        }

        return Storage::disk('public')->download($certificat->fichier);
    }

    public function verify($token)
    {
        $certificat = Certificat::where('code_certificat', $token)
            ->with(['utilisateur', 'evenement'])
            ->first();

        if (!$certificat) {
            return Inertia::render('m5/certificats/Verify', [
                'certificat' => null,
                'token' => $token,
            ]);
        }

        return Inertia::render('m5/certificats/Verify', [
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
