<?php

namespace Database\Seeders;

use App\Enums\DiplomaRequestStatus;
use App\Enums\DocumentType;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DiplomaModuleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first()
            ?? User::factory()->create([
                'name' => 'Test Admin',
                'email' => 'admin@example.com',
            ]);

        $slots = $this->createPickupSlots($admin);

        $scenarios = [
            ['Awa Diallo', 'awa.diallo@example.com', DiplomaRequestStatus::Draft, 'licence'],
            ['Boris Sanou', 'boris.sanou@example.com', DiplomaRequestStatus::Submitted, 'licence'],
            ['Clémence Ouédraogo', 'clemence.o@example.com', DiplomaRequestStatus::DocumentsValidated, 'master'],
            ['Daouda Tiendrébéogo', 'daouda.t@example.com', DiplomaRequestStatus::ReadyForPickup, 'master'],
            ['Élise Compaoré', 'elise.c@example.com', DiplomaRequestStatus::AppointmentScheduled, 'doctorat'],
            ['Fatou Coulibaly', 'fatou.c@example.com', DiplomaRequestStatus::Delivered, 'licence'],
            ['Gérard Konaté', 'gerard.k@example.com', DiplomaRequestStatus::Archived, 'licence'],
            ['Habibou Traoré', 'habibou.t@example.com', DiplomaRequestStatus::Rejected, 'master'],
        ];

        foreach ($scenarios as $i => [$name, $email, $target, $diplomaType]) {
            $owner = User::where('email', $email)->first()
                ?? User::factory()->create(['name' => $name, 'email' => $email]);

            if (! $owner->hasRole('etudiant')) {
                $owner->assignRole('etudiant');
            }

            $this->seedRequest(
                $owner,
                $admin,
                $target,
                $diplomaType,
                $slots->get($i % $slots->count()),
            );
        }
    }

    private function createPickupSlots(User $admin): Collection
    {
        return collect([
            ['Salle 201, Bâtiment Scolarité', now()->addDays(2)->setTime(9, 0), 5],
            ['Salle 201, Bâtiment Scolarité', now()->addDays(2)->setTime(14, 0), 5],
            ['Salle 304, Bâtiment Scolarité', now()->addDays(3)->setTime(10, 0), 8],
        ])->map(fn (array $attrs) => PickupSlot::create([
            'location' => $attrs[0],
            'starts_at' => $attrs[1],
            'ends_at' => $attrs[1]->copy()->addHours(2),
            'capacity' => $attrs[2],
            'created_by' => $admin->id,
        ]));
    }

    private function seedRequest(
        User $owner,
        User $admin,
        DiplomaRequestStatus $target,
        string $diplomaType,
        PickupSlot $slot,
    ): void {
        $request = DiplomaRequest::create([
            'owner_id' => $owner->id,
            'tracking_code' => sprintf('DIP-%s-%s', now()->format('Y'), Str::upper(Str::random(8))),
            'diploma_type' => $diplomaType,
            'academic_year' => '2024-2025',
            'status' => DiplomaRequestStatus::Draft,
        ]);

        $this->recordEvent($request, null, DiplomaRequestStatus::Draft, $owner, 'Brouillon créé', now()->subDays(8));

        if ($target === DiplomaRequestStatus::Draft) {
            return;
        }

        $this->seedDocuments($request);

        $request->forceFill([
            'status' => DiplomaRequestStatus::Submitted,
            'submitted_at' => now()->subDays(6),
        ])->save();
        $this->recordEvent($request, DiplomaRequestStatus::Draft, DiplomaRequestStatus::Submitted, $owner, 'Demande soumise', now()->subDays(6));

        if ($target === DiplomaRequestStatus::Submitted) {
            return;
        }

        if ($target === DiplomaRequestStatus::Rejected) {
            $request->forceFill([
                'status' => DiplomaRequestStatus::Rejected,
                'rejected_reason' => "Pièce manquante — photo d'identité non conforme.",
            ])->save();
            $this->recordEvent($request, DiplomaRequestStatus::Submitted, DiplomaRequestStatus::Rejected, $admin, "Pièce manquante — photo d'identité non conforme.", now()->subDays(5));

            return;
        }

        foreach ($request->documents as $doc) {
            $doc->forceFill([
                'validated_at' => now()->subDays(4),
                'validated_by' => $admin->id,
            ])->save();
        }

        $request->forceFill(['status' => DiplomaRequestStatus::DocumentsValidated])->save();
        $this->recordEvent($request, DiplomaRequestStatus::Submitted, DiplomaRequestStatus::DocumentsValidated, $admin, 'Dossier validé', now()->subDays(4));

        if ($target === DiplomaRequestStatus::DocumentsValidated) {
            return;
        }

        $request->forceFill(['status' => DiplomaRequestStatus::ReadyForPickup])->save();
        $this->recordEvent($request, DiplomaRequestStatus::DocumentsValidated, DiplomaRequestStatus::ReadyForPickup, $admin, 'Prêt à retirer', now()->subDays(3));

        if ($target === DiplomaRequestStatus::ReadyForPickup) {
            return;
        }

        $appointment = PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now()->subDays(2),
        ]);
        $request->forceFill(['status' => DiplomaRequestStatus::AppointmentScheduled])->save();
        $this->recordEvent(
            $request,
            DiplomaRequestStatus::ReadyForPickup,
            DiplomaRequestStatus::AppointmentScheduled,
            $owner,
            sprintf('RDV confirmé pour le %s à %s', $slot->starts_at->format('d/m/Y H:i'), $slot->location),
            now()->subDays(2),
        );

        if ($target === DiplomaRequestStatus::AppointmentScheduled) {
            return;
        }

        $appointment->forceFill([
            'delivered_at' => now()->subDay(),
            'delivered_by' => $admin->id,
        ])->save();
        $request->forceFill(['status' => DiplomaRequestStatus::Delivered])->save();
        $this->recordEvent($request, DiplomaRequestStatus::AppointmentScheduled, DiplomaRequestStatus::Delivered, $admin, 'Diplôme remis', now()->subDay());

        if ($target === DiplomaRequestStatus::Delivered) {
            return;
        }

        $request->forceFill([
            'status' => DiplomaRequestStatus::Archived,
            'archived_at' => now(),
        ])->save();
        $this->recordEvent($request, DiplomaRequestStatus::Delivered, DiplomaRequestStatus::Archived, $admin, 'Dossier archivé', now());
    }

    private function seedDocuments(DiplomaRequest $request): void
    {
        $types = [
            DocumentType::NationalId,
            DocumentType::TranscriptOfRecords,
            DocumentType::SuccessAttestation,
        ];

        foreach ($types as $type) {
            $path = sprintf('diplomas/%d/%s.pdf', $request->id, Str::uuid());
            Storage::disk('local')->put($path, '%PDF-1.4 placeholder demo file.');

            DiplomaDocument::create([
                'diploma_request_id' => $request->id,
                'type' => $type,
                'path' => $path,
                'original_name' => $type->value.'.pdf',
                'mime' => 'application/pdf',
                'size' => 32,
            ]);
        }
    }

    private function recordEvent(
        DiplomaRequest $request,
        ?DiplomaRequestStatus $from,
        DiplomaRequestStatus $to,
        User $actor,
        string $note,
        CarbonInterface $occurredAt,
    ): void {
        DiplomaRequestEvent::withoutEvents(function () use ($request, $from, $to, $actor, $note, $occurredAt) {
            DiplomaRequestEvent::create([
                'diploma_request_id' => $request->id,
                'from_status' => $from,
                'to_status' => $to,
                'actor_id' => $actor->id,
                'note' => $note,
                'occurred_at' => $occurredAt,
            ]);
        });
    }
}
