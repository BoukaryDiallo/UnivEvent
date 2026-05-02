<?php

namespace App\Http\Controllers;

use App\Models\Jury;
use App\Models\JuryMembre;
use App\Models\Soutenance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JuryController extends Controller
{
    public function index()
    {
        $jurys = Jury::with(['soutenance', 'president', 'membres.user'])->get();
        return Inertia::render('soutenances/jurys/index', compact('jurys'));
    }

    public function create()
    {
        $soutenances = Soutenance::all();
        $enseignants = User::where('role', 'enseignant')->get();
        return Inertia::render('soutenances/jurys/create', compact('soutenances', 'enseignants'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'soutenance_id' => 'required|exists:soutenances,id',
            'president_id' => 'required|exists:users,id',
            'membres' => 'nullable|array',
            'membres.*' => 'exists:users,id',
        ]);

        $jury = Jury::create($request->only('nom', 'soutenance_id', 'president_id'));

        if ($request->membres) {
            foreach ($request->membres as $membreId) {
                JuryMembre::create([
                    'jury_id' => $jury->id,
                    'user_id' => $membreId,
                    'role' => 'membre'
                ]);
            }
        }

        return redirect()->route('jurys.index')->with('success', 'Jury constitué.');
    }

    public function show(Jury $jury)
    {
        $jury->load(['soutenance', 'president', 'membres.user']);
        return Inertia::render('soutenances/jurys/show', compact('jury'));
    }

    public function edit(Jury $jury)
    {
        $soutenances = Soutenance::all();
        $enseignants = User::where('role', 'enseignant')->get();
        return Inertia::render('soutenances/jurys/edit', compact('jury', 'soutenances', 'enseignants'));
    }

    public function update(Request $request, Jury $jury)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'soutenance_id' => 'required|exists:soutenances,id',
            'president_id' => 'required|exists:users,id',
        ]);
        $jury->update($request->only('nom', 'soutenance_id', 'president_id'));
        return redirect()->route('jurys.index')->with('success', 'Jury modifié.');
    }

    public function destroy(Jury $jury)
    {
        $jury->delete();
        return redirect()->route('jurys.index')->with('success', 'Jury supprimé.');
    }
}