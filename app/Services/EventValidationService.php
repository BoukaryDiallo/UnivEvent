<?php

namespace App\Services;

use App\Events\EventSubmitted;
use App\Events\EventValidated;
use App\Models\Evenement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EventValidationService
{
    public function __construct(
        private EventNotificationService $notifications,
        private EventService $eventService,
    ) {}

    public function submitForValidation(Evenement $event, User $user): void
    {
        $errors = $this->eventService->submissionErrors($event->fresh());

        if ($errors !== []) {
            throw new \InvalidArgumentException(json_encode($errors, JSON_UNESCAPED_UNICODE));
        }

        DB::transaction(function () use ($event, $user) {
            $event->update([
                'validation_status' => 'pending',
                'submitted_at' => now(),
                'approved_at' => null,
                'approved_by' => null,
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
            ]);

            $this->logValidationActivity($event, $user, 'submitted', 'Soumis pour validation', "L'evenement a ete soumis aux administrateurs pour validation.");
            $this->notifyAdmins($event, 'submitted');
        });

        EventSubmitted::dispatch($event->fresh(), $user);
    }

    public function approve(Evenement $event, User $admin, ?string $reason = null): void
    {
        DB::transaction(function () use ($event, $admin, $reason) {
            $event->update([
                'validation_status' => 'approved',
                'statut' => 'publie',
                'approved_at' => now(),
                'approved_by' => $admin->id,
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
            ]);

            $this->logValidationActivity($event, $admin, 'approved', 'Approuve', $reason ?? "L'evenement a ete approuve par un administrateur.");
            $this->notifyCreator($event, 'approved', $reason);
        });

        EventValidated::dispatch($event->fresh(), $admin, 'approved');
    }

    public function reject(Evenement $event, User $admin, string $reason): void
    {
        DB::transaction(function () use ($event, $admin, $reason) {
            $event->update([
                'validation_status' => 'rejected',
                'rejected_at' => now(),
                'rejected_by' => $admin->id,
                'rejection_reason' => $reason,
            ]);

            $this->logValidationActivity($event, $admin, 'rejected', 'Rejete', $reason);
            $this->notifyCreator($event, 'rejected', $reason);
        });

        EventValidated::dispatch($event->fresh(), $admin, 'rejected');
    }

    public function resetToPending(Evenement $event, User $user): void
    {
        DB::transaction(function () use ($event, $user) {
            $event->update([
                'validation_status' => 'pending',
                'submitted_at' => now(),
                'approved_at' => null,
                'approved_by' => null,
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
            ]);

            $this->logValidationActivity($event, $user, 'modified', 'Modifie apres validation', "L'evenement a ete modifie et necessite une nouvelle validation.");
            $this->notifyAdmins($event, 'resubmitted');
            $this->notifyCreator($event, 'resubmitted');
        });
    }

    private function logValidationActivity(Evenement $event, User $user, string $action, string $title, string $description): void
    {
        $event->activities()->create([
            'user_id' => $user->id,
            'type' => 'validation',
            'action' => $action,
            'title' => $title,
            'description' => $description,
            'metadata' => [
                'admin_id' => $user->isAdmin() ? $user->id : null,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    private function notifyAdmins(Evenement $event, string $action): void
    {
        $admins = User::where('role', 'admin')->get();
        $title = match ($action) {
            'submitted' => "Validation d'evenement : nouvelle soumission",
            'resubmitted' => "Validation d'evenement : nouvelle version a revoir",
            default => "Validation d'evenement : action requise",
        };

        foreach ($admins as $admin) {
            $this->notifications->notify(
                $admin,
                'event_validation_admin',
                $title,
                "L'evenement '{$event->titre}' necessite votre attention.",
                $event->id,
                ['action' => $action]
            );
        }
    }

    private function notifyCreator(Evenement $event, string $action, ?string $reason = null): void
    {
        if (! $event->createur) {
            return;
        }

        $statusLabel = match ($action) {
            'approved' => 'approuve',
            'rejected' => 'rejete',
            'resubmitted' => 'remis en attente de validation',
            default => 'mis a jour',
        };

        $message = "Resultat de validation pour '{$event->titre}' : {$statusLabel}.";

        if ($reason) {
            $message .= " Motif: {$reason}";
        }

        $this->notifications->notify(
            $event->createur,
            'event_validation_creator',
            "Votre evenement a ete {$statusLabel}",
            $message,
            $event->id,
            ['action' => $action, 'reason' => $reason]
        );
    }

    public function canModify(Evenement $event, User $user): bool
    {
        return $event->cree_par === $user->id || $user->isAdmin();
    }

    public function requiresRevalidation(Evenement $event): bool
    {
        return $event->validation_status === 'approved' && $event->updated_at->gt($event->approved_at ?? now()->subYears(10));
    }
}
