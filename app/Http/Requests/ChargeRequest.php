<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ChargeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'charge_id' => ['nullable', 'integer', 'exists:charges,id'],
            'semestre' => ['required', 'array', 'min:1'],
            'semestre.*' => ['in:semestre_1,semestre_2,semestre_3,tous_les_semestres'],
            'annee_academique' => ['required', 'regex:/^\d{4}-\d{4}$/'],
            'max_jour' => ['nullable', 'integer', 'min:1', 'max:24'],
            'max_semaine' => ['nullable', 'integer', 'min:1', 'max:168'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $anneeAcademique = (string) $this->input('annee_academique');

            if (! preg_match('/^(\d{4})-(\d{4})$/', $anneeAcademique, $correspondances)) {
                return;
            }

            $debut = (int) $correspondances[1];
            $fin = (int) $correspondances[2];

            if ($fin !== $debut + 1) {
                $validator->errors()->add('annee_academique', 'Le format doit respecter l annee N-N+1.');
            }

            $anneeActuelle = now()->year;
            $options = [
                sprintf('%d-%d', $anneeActuelle - 1, $anneeActuelle),
                sprintf('%d-%d', $anneeActuelle, $anneeActuelle + 1),
                sprintf('%d-%d', $anneeActuelle + 1, $anneeActuelle + 2),
            ];

            if (! in_array($anneeAcademique, $options, true)) {
                $validator->errors()->add('annee_academique', 'L annee academique selectionnee n est pas autorisee.');
            }

            // Normalisation logique métier semestres
            $semestres = $this->input('semestre', []);
            if (is_array($semestres)) {
                $normalized = app('App\Metiers\DispoMetier')->normalizeSemestre($semestres);
                $this->merge(['semestre' => $normalized]);
            }
        });
    }
}
