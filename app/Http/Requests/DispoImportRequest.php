<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispoImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fichier' => [
                'required',
                'file',
                'mimes:xlsx,csv,txt',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'fichier.required' => 'Selectionnez un fichier Excel a importer.',
            'fichier.file' => 'Le fichier envoye est invalide.',
            'fichier.mimes' => 'Le fichier doit etre au format .xlsx ou .csv.',
            'fichier.max' => 'Le fichier ne doit pas depasser 5 Mo.',
        ];
    }
}
