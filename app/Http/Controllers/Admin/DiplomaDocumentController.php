<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Services\DiplomaRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DiplomaDocumentController extends Controller
{
    public function validateDocument(
        Request $request,
        DiplomaRequest $diplomaRequest,
        DiplomaDocument $document,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $this->authorize('validate', $document);

        $service->validateDocument($document, $request->user());

        return to_route('admin.diplomas.show', $diplomaRequest)
            ->with('success', 'Pièce validée.');
    }
}
