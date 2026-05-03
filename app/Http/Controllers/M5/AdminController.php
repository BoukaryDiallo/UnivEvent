<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('m5/admin/Index', [
            'event_types' => EventType::all(),
        ]);
    }

    public function storeType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'features' => 'required|array',
        ]);

        EventType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'features' => $validated['features'],
        ]);

        return redirect()->back()->with('success', 'Type d\'événement créé.');
    }

    public function updateType(Request $request, EventType $eventType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'features' => 'required|array',
            'is_active' => 'boolean',
        ]);

        $eventType->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'features' => $validated['features'],
            'is_active' => $validated['is_active'] ?? $eventType->is_active,
        ]);

        return redirect()->back()->with('success', 'Type d\'événement mis à jour.');
    }

    public function deleteType(EventType $eventType)
    {
        $eventType->delete();
        return redirect()->back()->with('success', 'Type d\'événement supprimé.');
    }
}
