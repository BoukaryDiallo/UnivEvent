<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
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

        return Inertia::render('module5/admin/Scanner', [
            'scanTarget' => $request->string('target')->value(),
        ]);
    }

    public function scan(Request $request, string $token)
    {
        $inscription = InscriptionEvenement::query()
            ->with(['utilisateur:id,name,email,role', 'evenement:id,titre,cree_par'])
            ->where('access_token', $token)
            ->firstOrFail();

        $user = $request->user();
        $targetEventId = $request->query('target');
        
        $canManage = $user && (
            $user->isAdmin() || $inscription->evenement?->cree_par === $user->id
        );

        // Security : Seul l'admin, l'organisateur ou le propriétaire du ticket peut voir les infos
        abort_unless($canManage || ($user && $user->id === $inscription->utilisateur_id), 403);

        $isWrongEvent = $targetEventId && (int)$targetEventId !== $inscription->evenement_id;

        return Inertia::render('module5/admin/ScannerResult', [
            'inscription' => [
                'id' => $inscription->id,
                'utilisateur' => $inscription->utilisateur,
                'evenement' => $inscription->evenement,
                'checked_in_at' => $inscription->checked_in_at,
                'statut' => $inscription->statut,
            ],
            'canManage' => $canManage,
            'isWrongEvent' => $isWrongEvent,
            'targetEventId' => $targetEventId,
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

        $targetEventId = $request->input('target_event_id');
        if ($targetEventId && (int)$targetEventId !== $inscription->evenement_id) {
            return back()->withErrors(['target' => 'Ce ticket n\'appartient pas à l\'événement actuel.']);
        }

        abort_unless($user->isAdmin() || $inscription->evenement?->cree_par === $user->id, 403);
        abort_if(! $inscription->evenement?->checkin_active, 403, 'Le check-in n\'est pas activé pour cet événement.');
        abort_if($inscription->statut !== 'accepte', 403, 'Seules les inscriptions validées peuvent être scannées.');

        if ($inscription->checked_in_at) {
            return back()->with('status', 'already-checked-in');
        }

        $inscription->update([
            'checked_in_at' => now(),
        ]);

        return back()->with('status', 'checked-in');
    }

    public function downloadTicket(InscriptionEvenement $inscription)
    {
        $user = Auth::user();
        abort_unless($user, 401);
        
        // Security check
        if (!$user->isAdmin() && $inscription->utilisateur_id !== $user->id && $inscription->evenement->cree_par !== $user->id) {
            abort(403);
        }

        $inscription->load(['utilisateur', 'evenement']);
        $token = $inscription->access_token;
        
        if (!$token) {
            $token = bin2hex(random_bytes(16));
            $inscription->update(['access_token' => $token]);
        }

        $qr = (new Builder(
            writer: new PngWriter(),
            data: route('acces.scan', $token),
            size: 260,
            margin: 8,
        ))->build();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('evenements.ticket', [
            'inscription' => $inscription,
            'qrCode' => base64_encode($qr->getString()),
        ]);

        return $pdf->download("ticket-{$inscription->evenement->titre}.pdf");
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
            writer: new PngWriter(),
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
