<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EcartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date'],
            'motif' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'La date de debut est requise.',
            'date.date' => 'La date de debut est invalide.',
            'date_fin.date' => 'La date de fin est invalide.',
            'date_fin.after_or_equal' => 'La date de fin doit etre superieure ou egale a la date de debut.',
            'motif.required' => 'Le motif est requis.',
            'motif.max' => 'Le motif ne doit pas depasser 255 caracteres.',
        ];
    }
}
