<?php

namespace App\Http\Requests\Diplomas;

use Illuminate\Foundation\Http\FormRequest;

class DeliverDiplomaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('deliver', $this->route('diplomaRequest')) ?? false;
    }

    public function rules(): array
    {
        return [
            'receipt' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'receipt.mimes' => 'Le reçu doit être au format PDF, JPG ou PNG.',
            'receipt.max' => 'Le reçu ne doit pas dépasser 5 Mo.',
        ];
    }
}
