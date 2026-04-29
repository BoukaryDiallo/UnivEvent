<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClubRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isAdmin = auth()->user()?->isAdmin() ?? false;
        
        return [
            'nom' => 'required|string|max:255',
            'type' => 'required|string|in:sportif,culturel,scientifique,humanitaire,autre',
            'description' => 'required|string',
            'president_nom' => $isAdmin ? 'required|string' : 'nullable|string',
            'president_prenom' => $isAdmin ? 'required|string' : 'nullable|string',
        ];
    }
}
