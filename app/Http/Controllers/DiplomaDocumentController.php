<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Http\Requests\Diplomas\UploadDocumentRequest;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Services\DiplomaRequestService;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DiplomaDocumentController extends Controller
{
    public function store(
        UploadDocumentRequest $request,
        DiplomaRequest $diplomaRequest,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $service->attachDocument(
            $diplomaRequest,
            $request->file('file'),
            DocumentType::from($request->validated('type')),
        );

        return to_route('diplomas.show', $diplomaRequest)
            ->with('success', 'Pièce téléversée.');
    }

    public function destroy(
        DiplomaRequest $diplomaRequest,
        DiplomaDocument $document,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $this->authorize('delete', $document);

        $service->removeDocument($document);

        return to_route('diplomas.show', $diplomaRequest)
            ->with('success', 'Pièce supprimée.');
    }

    public function download(
        DiplomaRequest $diplomaRequest,
        DiplomaDocument $document,
        DiplomaRequestService $service,
    ): StreamedResponse {
        $this->authorize('download', $document);

        return $service->streamDocument($document);
    }
}
