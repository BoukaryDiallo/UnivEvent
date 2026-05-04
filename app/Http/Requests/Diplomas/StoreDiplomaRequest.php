<?php

namespace App\Http\Requests\Diplomas;

use App\Models\DiplomaRequest;
use App\Support\AcademicYear;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDiplomaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', DiplomaRequest::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'diploma_type' => ['required', 'string', 'in:licence,master,doctorat'],
            'academic_year' => ['required', 'string', Rule::in(AcademicYear::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'diploma_type.in' => 'Le type de diplôme doit être licence, master ou doctorat.',
            'academic_year.in' => "L'année académique sélectionnée n'est pas autorisée.",
        ];
    }
}
