<?php

namespace App\Http\Requests\Diplomas;

use Illuminate\Foundation\Http\FormRequest;

class RejectDiplomaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reject', $this->route('diplomaRequest')) ?? false;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Un motif de rejet est requis.',
            'reason.min' => 'Le motif doit comporter au moins 3 caractères.',
        ];
    }
}
