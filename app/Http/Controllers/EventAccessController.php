<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use Endroid\QrCode\Builder\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventAccessController extends Controller
{
    public function adminScanner(Request $request)
    {
        $user = $request->user();

        abort_unless($user, 403);
        abort_unless(
            $user->isAdmin() || Evenement::query()->where('cree_par', $user->id)->exists(),
            403,
            'Action non autorisee',
        );

        return Inertia::render('evenements/AdminScanner', [
            'scanTarget' => $request->string('target')->value(),
        ]);
    }

    public function scan(string $token)
    {
        $inscription = InscriptionEvenement::query()
            ->with(['utilisateur:id,name,email,role', 'evenement:id,titre,cree_par'])
            ->where('access_token', $token)
            ->firstOrFail();

        $user = request()->user();
        $canManage = $user && (
            $user->isAdmin() || $inscription->evenement?->cree_par === $user->id
        );

        // Sécurité : Seul l'admin, l'organisateur ou le propriétaire du ticket peut voir les infos
        abort_unless($canManage || ($user && $user->id === $inscription->utilisateur_id), 403);

        return Inertia::render('acces/Scan', [
            'inscription' => [
                'id' => $inscription->id,
                'utilisateur' => $inscription->utilisateur,
                'evenement' => $inscription->evenement,
                'checked_in_at' => $inscription->checked_in_at,
                'statut' => $inscription->statut,
            ],
            'canManage' => $canManage,
        ]);
    }

    public function checkIn(Request $request, string $token)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $inscription = InscriptionEvenement::query()
            ->with('evenement')
            ->where('access_token', $token)
            ->firstOrFail();

        abort_unless($user->isAdmin() || $inscription->evenement?->cree_par === $user->id, 403);
        abort_if(! $inscription->evenement?->checkin_active, 403, 'Le check-in n est pas active pour cet evenement.');
        abort_if($inscription->statut !== 'accepte', 403, 'Seules les inscriptions validees peuvent etre scannees.');

        if ($inscription->checked_in_at) {
            return back()->with('status', 'already-checked-in');
        }

        $inscription->update([
            'checked_in_at' => now(),
        ]);

        return back()->with('status', 'checked-in');
    }

    public function qr(InscriptionEvenement $inscription)
    {
        $token = $inscription->access_token;
        $user = request()->user();

        abort_unless($token, 404);
        abort_unless($user, 403);
        abort_unless(
            $user->isAdmin()
            || $inscription->utilisateur_id === $user->id
            || $inscription->evenement?->cree_par === $user->id,
            403,
            'Action non autorisee',
        );

        $qr = new Builder(
            data: route('acces.scan', $token),
            size: 260,
            margin: 8,
        );

        $result = $qr->build();

        return response($result->getString(), 200, [
            'Content-Type' => $result->getMimeType(),
        ]);
    }
}
