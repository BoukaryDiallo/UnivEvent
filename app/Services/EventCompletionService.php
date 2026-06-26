<?php

namespace App\Services;

use App\Models\Evenement;

class EventCompletionService
{
    private const SECTION_WEIGHTS = [
        'general' => 25,
        'program' => 20,
        'actors' => 20,
        'media' => 10,
        'permissions' => 10,
        'interactions' => 5,
        'certificates' => 10,
    ];

    public function summarize(Evenement $event): array
    {
        $event->loadMissing(['roles', 'assignments', 'medias', 'programmes', 'juryPanel.criteria']);

        $sections = [
            $this->generalSection($event),
            $this->programSection($event),
            $this->actorsSection($event),
            $this->mediaSection($event),
            $this->permissionsSection($event),
            $this->interactionsSection($event),
            $this->certificatesSection($event),
        ];

        $weightedScore = collect($sections)->sum(fn (array $section) => $section['score']);
        $totalWeight = array_sum(self::SECTION_WEIGHTS);

        return [
            'percentage' => (int) round(($weightedScore / max($totalWeight, 1)) * 100),
            'sections' => array_map(function (array $section) {
                unset($section['score']);

                return $section;
            }, $sections),
        ];
    }

    private function generalSection(Evenement $event): array
    {
        $checks = [
            filled($event->titre),
            filled($event->description),
            filled($event->date_debut),
            filled($event->lieu),
        ];

        return $this->buildSection(
            'general',
            'Informations generales',
            self::SECTION_WEIGHTS['general'],
            $checks,
            [
                'Ajoutez une description claire',
                'Confirmez la date et le lieu',
            ],
        );
    }

    private function programSection(Evenement $event): array
    {
        if ($event->type === 'concours') {
            $criteriaCount = $event->juryPanel?->criteria?->where('actif', true)->count() ?? 0;

            return $this->buildSection(
                'program',
                'Criteres et evaluation',
                self::SECTION_WEIGHTS['program'],
                [$criteriaCount > 0, $criteriaCount > 1],
                [
                    'Ajoutez au moins un critere de selection',
                    'Precisez un bareme ou un coefficient',
                ],
            );
        }

        $sessionCount = $event->programmes->filter(fn ($session) => filled($session->titre))->count();

        return $this->buildSection(
            'program',
            'Programme et sessions',
            self::SECTION_WEIGHTS['program'],
            [$sessionCount > 0, $sessionCount > 1],
            [
                'Ajoutez au moins une session',
                'Structurez le programme avec des horaires ou intervenants',
            ],
        );
    }

    private function actorsSection(Evenement $event): array
    {
        $organizers = $event->assignments->where('role', 'organisateur')->count();
        $jury = $event->assignments->where('role', 'jury')->count();
        $speakers = $event->assignments->where('role', 'intervenant')->count();
        $participants = $event->assignments->where('role', 'participant')->count();

        if ($event->type === 'concours') {
            $checks = [
                $organizers > 0,
                $jury > 0,
                $jury > 1,
            ];
            $missing = [];
            if ($organizers === 0) {
                $missing[] = 'Ajoutez au moins un organisateur';
            }
            if ($jury === 0) {
                $missing[] = 'Ajoutez au moins un jury';
            }
            if ($jury < 2) {
                $missing[] = 'Idéalement 3 à 5 jurés';
            }
        } else {
            $checks = [
                $organizers > 0,
                $speakers > 0,
            ];
            $missing = [];
            if ($organizers === 0) {
                $missing[] = 'Ajoutez au least un organisateur';
            }
            if ($speakers === 0) {
                $missing[] = 'Ajoutez au moins un intervenant';
            }
        }

        return $this->buildSection(
            'actors',
            'Acteurs',
            self::SECTION_WEIGHTS['actors'],
            $checks,
            $missing,
        );
    }

    private function mediaSection(Evenement $event): array
    {
        $count = $event->medias->count();
        $hasCover = $event->medias->where('is_cover', true)->isNotEmpty();
        $publicMedias = $event->medias->where('is_public', true)->count();

        return $this->buildSection(
            'media',
            'Medias',
            self::SECTION_WEIGHTS['media'],
            [$count > 0, $hasCover],
            [
                $count === 0 ? 'Ajoutez au moins une image ou document' : 'Définissez une image de couverture',
                $publicMedias === 0 ? 'Rendez au moins un média public' : '',
            ],
        );
    }

    private function permissionsSection(Evenement $event): array
    {
        return $this->buildSection(
            'permissions',
            'Permissions et visibilite',
            self::SECTION_WEIGHTS['permissions'],
            [filled($event->visibilite), filled($event->public_cible)],
            [
                'Choisissez une visibilite',
                'Definissez le public cible',
            ],
        );
    }

    private function interactionsSection(Evenement $event): array
    {
        return $this->buildSection(
            'interactions',
            'Commentaires et interactions',
            self::SECTION_WEIGHTS['interactions'],
            [! is_null($event->comments_enabled), ! is_null($event->messages_enabled)],
            [
                'Choisissez si les commentaires sont autorises',
                'Choisissez si les messages sont autorises',
            ],
        );
    }

    private function certificatesSection(Evenement $event): array
    {
        if (! $event->evenement_certifie) {
            return $this->buildSection(
                'certificates',
                'Certificats',
                self::SECTION_WEIGHTS['certificates'],
                [true],
                [],
            );
        }

        return $this->buildSection(
            'certificates',
            'Certificats',
            self::SECTION_WEIGHTS['certificates'],
            [filled($event->certificate_template_version)],
            ['Configurez un modele de certificat'],
        );
    }

    private function buildSection(string $key, string $label, int $weight, array $checks, array $missing): array
    {
        $completedChecks = collect($checks)->filter()->count();
        $totalChecks = max(count($checks), 1);
        $ratio = $completedChecks / $totalChecks;
        $score = $weight * $ratio;

        return [
            'key' => $key,
            'label' => $label,
            'weight' => $weight,
            'percentage' => (int) round($ratio * 100),
            'status' => $ratio >= 1 ? 'complete' : ($ratio > 0 ? 'partial' : 'empty'),
            'missing' => $ratio >= 1 ? [] : $missing,
            'score' => $score,
        ];
    }
}
