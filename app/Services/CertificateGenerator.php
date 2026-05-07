<?php

namespace App\Services;

use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\Resultat;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;

class CertificateGenerator
{
    public function preview(Evenement $evenement, User $user, array $overrides = [], ?string $type = null): array
    {
        $code = uniqid('CERT-PREVIEW-');
        $payload = $this->buildPayload($evenement, $user, $type ?? $this->resolveCertificateType($evenement, $user));
        $template = $evenement->certificate_template_schema ?: $this->defaultTemplate();

        return [
            'code' => $code,
            'template' => $template,
            'payload' => array_merge($payload, $overrides),
            'html' => view('certificats.modele', [
                'certificat' => (object) [
                    'utilisateur' => $user,
                    'evenement' => $evenement,
                    'date_delivrance' => now(),
                    'code_certificat' => $code,
                    'url_verification' => route('certificats.verifier', $code),
                    'payload' => array_merge($payload, $overrides),
                    'template_snapshot' => $template,
                ],
                'qrCode' => null,
            ])->render(),
        ];
    }

    public function generate(Evenement $evenement, User $user, array $overrides = [], ?string $type = null): Certificat
    {
        $resolvedType = $type ?? $this->resolveCertificateType($evenement, $user);
        
        $existing = Certificat::query()
            ->where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->where('type', $resolvedType)
            ->first();

        $code = $existing?->code_certificat ?? uniqid('CERT-');
        $urlVerification = route('module5.verify', $code);
        $payload = array_merge($this->buildPayload($evenement, $user, $resolvedType), $overrides);
        $template = $evenement->certificate_template_schema ?: $this->defaultTemplate();

        // 1. Verification QR (The certificate itself)
        $verifyQr = (new Builder(
            writer: new PngWriter(),
            data: $urlVerification,
            size: 150,
            margin: 5,
        ))->build();

        // 2. Registration QR (The original ticket)
        $inscription = InscriptionEvenement::where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->first();
        
        $registrationQrData = $inscription && $inscription->access_token 
            ? route('acces.scan', $inscription->access_token)
            : 'N/A';

        $regQr = (new Builder(
            writer: new PngWriter(),
            data: $registrationQrData,
            size: 150,
            margin: 5,
        ))->build();

        $certificat = $existing ?? Certificat::create([
            'evenement_id' => $evenement->id,
            'utilisateur_id' => $user->id,
            'type' => $resolvedType,
            'code_certificat' => $code,
            'url_verification' => $urlVerification,
            'date_delivrance' => now(),
            'statut' => 'delivre',
        ]);

        $pdf = Pdf::loadView('certificats.modele', [
            'certificat' => $certificat->loadMissing(['utilisateur', 'evenement']),
            'qrCode' => base64_encode($verifyQr->getString()),
            'registrationQr' => base64_encode($regQr->getString()),
            'payload' => $payload,
            'template' => $template,
        ]);

        $path = "certificats/{$code}.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        $certificat->update([
            'fichier' => $path,
            'payload' => $payload,
            'template_snapshot' => $template,
        ]);

        return $certificat->fresh(['utilisateur', 'evenement']);
    }

    private function buildPayload(Evenement $evenement, User $user, string $type): array
    {
        $resultat = Resultat::query()
            ->where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->first();

        $label = match($type) {
            'attestation_intervenant' => 'Attestation de Conférencier',
            'certificat_admission' => 'Certificat de Réussite',
            default => 'Attestation de Participation',
        };

        return [
            'nom_complet' => $user->name,
            'titre_evenement' => $evenement->titre,
            'date_evenement' => optional($evenement->date_debut)->format('d/m/Y'),
            'lieu' => $evenement->lieu ?: 'Plateforme UnivEvent',
            'label_certificat' => $label,
            'rang' => $resultat?->classement,
            'mention' => $resultat?->mention,
            'organisateur' => $evenement->createur?->name,
        ];
    }

    private function resolveCertificateType(Evenement $evenement, User $user): string
    {
        if ($evenement->type === 'conference') {
            return 'attestation_presence';
        }

        $resultat = Resultat::query()
            ->where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->first();

        return match ($resultat?->admission) {
            'admis' => 'certificat_admission',
            'liste_attente' => 'encouragement',
            default => 'attestation_participation',
        };
    }

    private function defaultTemplate(): array
    {
        return [
            'background' => '#fffdf7',
            'accent' => '#0f172a',
            'title' => 'Certificat',
            'layout' => 'canvas_v1',
        ];
    }
}
