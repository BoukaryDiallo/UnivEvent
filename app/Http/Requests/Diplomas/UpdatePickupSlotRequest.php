<?php

namespace App\Http\Requests\Diplomas;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePickupSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('pickupSlot')) ?? false;
    }

    public function rules(): array
    {
        return [
            'location' => ['required', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'capacity' => ['required', 'integer', 'min:1', 'max:200'],
        ];
    }
}
