<?php

namespace App\Http\Requests\Diplomas;

use App\Enums\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('addDocument', $this->route('diplomaRequest')) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(DocumentType::class)],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'Le fichier doit être au format PDF, JPG ou PNG.',
            'file.max' => 'Le fichier ne doit pas dépasser 5 Mo.',
        ];
    }
}
