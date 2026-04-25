<?php

namespace App\Services;

use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\Resultat;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Builder\Builder;
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
        $existing = Certificat::query()
            ->where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->where('type', $type ?? $this->resolveCertificateType($evenement, $user))
            ->first();

        $code = $existing?->code_certificat ?? uniqid('CERT-');
        $urlVerification = route('certificats.verifier', $code);
        $resolvedType = $type ?? $this->resolveCertificateType($evenement, $user);
        $payload = array_merge($this->buildPayload($evenement, $user, $resolvedType), $overrides);
        $template = $evenement->certificate_template_schema ?: $this->defaultTemplate();

        $qr = (new Builder(
            data: $urlVerification,
            size: 220,
            margin: 8,
        ))->build();

        $certificat = $existing ?? Certificat::create([
            'evenement_id' => $evenement->id,
            'utilisateur_id' => $user->id,
            'type' => $resolvedType,
            'code_certificat' => $code,
            'url_verification' => $urlVerification,
            'date_delivrance' => now(),
            'statut' => 'prete',
        ]);

        $pdf = Pdf::loadView('certificats.modele', [
            'certificat' => $certificat->loadMissing(['utilisateur', 'evenement']),
            'qrCode' => base64_encode($qr->getString()),
            'payload' => $payload,
            'template' => $template,
        ]);

        $path = "certificats/{$code}.pdf";

        Storage::disk('public')->put($path, $pdf->output());

        $certificat->update([
            'fichier' => $path,
            'url_verification' => $urlVerification,
            'template_snapshot' => $template,
            'overrides' => $overrides,
            'payload' => $payload,
            'preview_generated_at' => now(),
            'published_at' => now(),
            'date_delivrance' => $certificat->date_delivrance ?? now(),
            'statut' => 'delivre',
        ]);

        return $certificat->fresh(['utilisateur', 'evenement']);
    }

    private function buildPayload(Evenement $evenement, User $user, string $type): array
    {
        $resultat = Resultat::query()
            ->where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->first();

        return [
            'nom' => $user->name,
            'prenom' => null,
            'titre_evenement' => $evenement->titre,
            'date_evenement' => optional($evenement->date_debut)->format('d/m/Y'),
            'rang' => $resultat?->classement,
            'admission' => $resultat?->admission,
            'mention' => $resultat?->mention,
            'type_certificat' => $type,
            'signature' => $evenement->createur?->name,
            'logo' => null,
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
