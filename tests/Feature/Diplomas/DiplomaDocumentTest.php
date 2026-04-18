<?php

namespace Tests\Feature\Diplomas;

use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DiplomaDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
    }

    public function test_owner_can_upload_a_document_on_a_draft(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->post(route('diplomas.documents.store', $request), [
                'type' => 'cni',
                'file' => UploadedFile::fake()->create('cni.pdf', 200, 'application/pdf'),
            ])
            ->assertRedirect(route('diplomas.show', $request));

        $this->assertDatabaseCount('diploma_documents', 1);

        $document = DiplomaDocument::first();
        $this->assertSame($request->id, $document->diploma_request_id);
        $this->assertSame('cni', $document->type->value);
        $this->assertSame('cni.pdf', $document->original_name);
        Storage::disk('local')->assertExists($document->path);
    }

    public function test_upload_rejects_oversize_file(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->post(route('diplomas.documents.store', $request), [
                'type' => 'cni',
                'file' => UploadedFile::fake()->create('big.pdf', 6000, 'application/pdf'),
            ])
            ->assertSessionHasErrors('file');

        $this->assertDatabaseCount('diploma_documents', 0);
    }

    public function test_upload_rejects_disallowed_mime(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->post(route('diplomas.documents.store', $request), [
                'type' => 'cni',
                'file' => UploadedFile::fake()->create('virus.exe', 100, 'application/octet-stream'),
            ])
            ->assertSessionHasErrors('file');
    }

    public function test_upload_rejects_unknown_document_type(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->post(route('diplomas.documents.store', $request), [
                'type' => 'passport',
                'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('type');
    }

    public function test_upload_forbidden_once_request_is_submitted(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->submitted()->create();

        $this->actingAs($user)
            ->post(route('diplomas.documents.store', $request), [
                'type' => 'cni',
                'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
            ])
            ->assertForbidden();
    }

    public function test_non_owner_cannot_upload(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($intruder)
            ->post(route('diplomas.documents.store', $request), [
                'type' => 'cni',
                'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
            ])
            ->assertForbidden();
    }

    public function test_owner_can_delete_a_document_on_a_draft(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)->post(route('diplomas.documents.store', $request), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $document = DiplomaDocument::first();

        $this->actingAs($user)
            ->delete(route('diplomas.documents.destroy', [$request, $document]))
            ->assertRedirect(route('diplomas.show', $request));

        $this->assertDatabaseCount('diploma_documents', 0);
        Storage::disk('local')->assertMissing($document->path);
    }

    public function test_cannot_delete_document_after_submission(): void
    {
        $owner = User::factory()->create();
        $draft = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)->post(route('diplomas.documents.store', $draft), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $document = DiplomaDocument::first();
        $draft->update([
            'status' => \App\Enums\DiplomaRequestStatus::Submitted,
            'submitted_at' => now(),
        ]);

        $this->actingAs($owner)
            ->delete(route('diplomas.documents.destroy', [$draft, $document]))
            ->assertForbidden();
    }

    public function test_owner_can_download_their_document(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)->post(route('diplomas.documents.store', $request), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $document = DiplomaDocument::first();

        $response = $this->actingAs($user)
            ->get(route('diplomas.documents.download', [$request, $document]));

        $response->assertOk();
        $this->assertSame(
            'attachment; filename=cni.pdf',
            $response->headers->get('content-disposition'),
        );
    }

    public function test_non_owner_cannot_download_document(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)->post(route('diplomas.documents.store', $request), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $document = DiplomaDocument::first();

        $this->actingAs($intruder)
            ->get(route('diplomas.documents.download', [$request, $document]))
            ->assertForbidden();
    }

    public function test_document_from_another_request_returns_404(): void
    {
        $user = User::factory()->create();
        $requestA = DiplomaRequest::factory()->for($user, 'owner')->create();
        $requestB = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)->post(route('diplomas.documents.store', $requestA), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $documentOfA = DiplomaDocument::first();

        $this->actingAs($user)
            ->get(route('diplomas.documents.download', [$requestB, $documentOfA]))
            ->assertNotFound();
    }
}
