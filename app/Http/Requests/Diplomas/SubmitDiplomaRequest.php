<?php

namespace App\Http\Requests\Diplomas;

use Illuminate\Foundation\Http\FormRequest;

class SubmitDiplomaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('submit', $this->route('diplomaRequest')) ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
