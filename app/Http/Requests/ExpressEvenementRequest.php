<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpressEvenementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titre' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:conference,concours'],
            'date_debut' => ['required', 'date'],
            'lieu' => ['required', 'string', 'max:255'],
        ];
    }
}
