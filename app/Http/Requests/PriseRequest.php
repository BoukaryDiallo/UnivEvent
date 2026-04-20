<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PriseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'date' => ['required', 'date'],
            'debut' => ['required', 'date_format:H:i'],
            'fin' => ['required', 'date_format:H:i'],
            'periode' => ['nullable', 'in:semestre_1,semestre_2,semestre_3,annee'],
            'source' => ['required', 'string', 'max:100'],
            'ref' => ['nullable', 'string', 'max:100'],
            'motif' => ['nullable', 'string', 'max:255'],
        ];
    }
}
