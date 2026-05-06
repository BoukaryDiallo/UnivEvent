<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispoRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->isMethod('post') && ! $this->has('creneaux')) {
            $this->merge([
                'creneaux' => [[
                    'jour' => $this->input('jour'),
                    'debut' => $this->input('debut'),
                    'fin' => $this->input('fin'),
                    'niveau' => $this->input('niveau'),
                    'motif' => $this->input('motif'),
                ]],
            ]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'creneaux' => ['required', 'array', 'min:1'],
                'creneaux.*.jour' => ['required', 'integer', 'between:1,7'],
                'creneaux.*.debut' => ['required', 'date_format:H:i'],
                'creneaux.*.fin' => ['required', 'date_format:H:i'],
                'creneaux.*.niveau' => ['required', 'in:prefere'],
                'creneaux.*.motif' => ['nullable', 'string', 'max:255'],
            ];
        }

        return [
            'jour' => ['required', 'integer', 'between:1,7'],
            'debut' => ['required', 'date_format:H:i'],
            'fin' => ['required', 'date_format:H:i'],
            'niveau' => ['required', 'in:prefere'],
            'motif' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'creneaux.required' => 'Ajoutez au moins un creneau.',
            'creneaux.array' => 'La liste des creneaux est invalide.',
            'creneaux.min' => 'Ajoutez au moins un creneau.',
            'creneaux.*.jour.required' => 'Le jour est requis.',
            'creneaux.*.jour.between' => 'Le jour selectionne est invalide.',
            'creneaux.*.debut.required' => 'L heure de debut est requise.',
            'creneaux.*.debut.date_format' => 'L heure de debut est invalide.',
            'creneaux.*.fin.required' => 'L heure de fin est requise.',
            'creneaux.*.fin.date_format' => 'L heure de fin est invalide.',
            'creneaux.*.niveau.required' => 'Le niveau est requis.',
            'creneaux.*.niveau.in' => 'Le niveau selectionne est invalide.',
            'creneaux.*.motif.max' => 'Le motif ne doit pas depasser 255 caracteres.',
            'jour.required' => 'Le jour est requis.',
            'jour.between' => 'Le jour selectionne est invalide.',
            'debut.required' => 'L heure de debut est requise.',
            'debut.date_format' => 'L heure de debut est invalide.',
            'fin.required' => 'L heure de fin est requise.',
            'fin.date_format' => 'L heure de fin est invalide.',
            'niveau.required' => 'Le niveau est requis.',
            'niveau.in' => 'Le niveau selectionne est invalide.',
            'motif.max' => 'Le motif ne doit pas depasser 255 caracteres.',
        ];
    }
}
