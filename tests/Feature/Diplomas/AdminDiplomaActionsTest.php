<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminDiplomaActionsTest extends TestCase
{
    use RefreshDatabase;

    private function scolarite(): User
    {
        Role::findOrCreate('admin');
        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    private function submittedRequestWith(User $owner, int $documents = 1): DiplomaRequest
    {
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        DiplomaDocument::factory()->count($documents)->for($request)->create();

        return $request;
    }

    public function test_scolarite_can_validate_a_document(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);
        $document = $request->documents->first();

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.documents.validate', [$request, $document]))
            ->assertRedirect(route('admin.diplomas.show', $request));

        $document->refresh();
        $this->assertNotNull($document->validated_at);
        $this->assertSame($scolarite->id, $document->validated_by);
    }

    public function test_non_scolarite_cannot_validate_a_document(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);
        $document = $request->documents->first();

        $this->actingAs($user)
            ->post(route('admin.diplomas.documents.validate', [$request, $document]))
            ->assertForbidden();
    }

    public function test_validating_a_document_twice_is_a_no_op(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);
        $document = $request->documents->first();

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.documents.validate', [$request, $document]));

        $firstValidation = $document->refresh()->validated_at;

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.documents.validate', [$request, $document]))
            ->assertForbidden();

        $this->assertTrue($document->refresh()->validated_at->equalTo($firstValidation));
    }

    public function test_scolarite_can_validate_full_dossier_when_all_docs_validated(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner, 2);

        foreach ($request->documents as $document) {
            $document->forceFill([
                'validated_at' => now(),
                'validated_by' => $scolarite->id,
            ])->save();
        }

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.validate', $request))
            ->assertRedirect(route('admin.diplomas.show', $request));

        $this->assertSame(
            DiplomaRequestStatus::DocumentsValidated,
            $request->refresh()->status,
        );
    }

    public function test_cannot_validate_dossier_with_unvalidated_documents(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner, 2);

        $this->actingAs($scolarite)
            ->from(route('admin.diplomas.show', $request))
            ->post(route('admin.diplomas.validate', $request))
            ->assertSessionHasErrors('documents');

        $this->assertSame(DiplomaRequestStatus::Submitted, $request->refresh()->status);
    }

    public function test_scolarite_can_reject_a_submitted_request_with_reason(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.reject', $request), [
                'reason' => 'Pièce manquante — attestation de succès.',
            ])
            ->assertRedirect(route('admin.diplomas.show', $request));

        $request->refresh();
        $this->assertSame(DiplomaRequestStatus::Rejected, $request->status);
        $this->assertSame('Pièce manquante — attestation de succès.', $request->rejected_reason);
    }

    public function test_reject_requires_a_reason(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);

        $this->actingAs($scolarite)
            ->from(route('admin.diplomas.show', $request))
            ->post(route('admin.diplomas.reject', $request), [])
            ->assertSessionHasErrors('reason');

        $this->assertSame(DiplomaRequestStatus::Submitted, $request->refresh()->status);
    }

    public function test_cannot_reject_a_request_past_documents_validated(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.reject', $request), [
                'reason' => 'Trop tard.',
            ])
            ->assertForbidden();
    }

    public function test_scolarite_can_mark_a_validated_dossier_as_ready_for_pickup(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::DocumentsValidated,
            'submitted_at' => now()->subDay(),
        ]);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.mark-ready', $request))
            ->assertRedirect(route('admin.diplomas.show', $request));

        $this->assertSame(
            DiplomaRequestStatus::ReadyForPickup,
            $request->refresh()->status,
        );
    }

    public function test_cannot_mark_ready_if_not_documents_validated(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.mark-ready', $request))
            ->assertForbidden();
    }

    public function test_student_cannot_call_any_admin_transition(): void
    {
        $owner = User::factory()->create();
        $request = $this->submittedRequestWith($owner);
        $document = $request->documents->first();

        $this->actingAs($owner)
            ->post(route('admin.diplomas.documents.validate', [$request, $document]))
            ->assertForbidden();

        $this->actingAs($owner)
            ->post(route('admin.diplomas.validate', $request))
            ->assertForbidden();

        $this->actingAs($owner)
            ->post(route('admin.diplomas.reject', $request), ['reason' => 'x'])
            ->assertForbidden();

        $this->actingAs($owner)
            ->post(route('admin.diplomas.mark-ready', $request))
            ->assertForbidden();
    }
}
