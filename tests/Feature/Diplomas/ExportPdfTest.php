<?php

namespace Tests\Feature\Diplomas;

use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_export_pdf(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        DiplomaDocument::factory()->for($request)->create();

        $response = $this->actingAs($owner)->get(route('diplomas.export', $request));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
        $this->assertStringContainsString(
            'dossier-'.$request->tracking_code.'.pdf',
            $response->headers->get('content-disposition'),
        );
    }

    public function test_non_owner_cannot_export(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $this->actingAs($intruder)
            ->get(route('diplomas.export', $request))
            ->assertForbidden();
    }

    public function test_guest_is_redirected(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $this->get(route('diplomas.export', $request))
            ->assertRedirect(route('login'));
    }
}
