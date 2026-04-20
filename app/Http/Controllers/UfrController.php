<?php

namespace App\Http\Controllers;
use App\Models\Ufr;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UfrController extends Controller
{
    /**
     * LISTE DES UFR (INERTIA)
     */
    public function index()
    {
        $ufrs = Ufr::withCount('departements')
            ->orderBy('nom')
            ->paginate(10);

        return Inertia::render('ufr/UfrList', [
            'ufrs' => $ufrs
        ]);
    }

    
    //  * FORMULAIRE CRÉATION
   
    public function create()
    {
        return Inertia::render('ufr/UfrCreate');
    }

    // /**
    //  * ENREGISTRER
    //  */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255|unique:ufrs,nom',
        ]);

        Ufr::create($request->only('nom'));

        return redirect()->route('ufr.index');
    }

    // /**
    //  * AFFICHER UNE UFR
    //  */
    public function show(Ufr $ufr)
    {
        $ufr->load(['departements.filieres']);

        return Inertia::render('ufr/UfrShow', [
            'ufr' => $ufr
        ]);
    }

    // /**
    //  * EDIT
    //  */
    public function edit(Ufr $ufr)
    {
        return Inertia::render('Ufr/Edit', [
            'ufr' => $ufr
        ]);
    }

    // /**
    //  * UPDATE
    //  */
    public function update(Request $request, Ufr $ufr)
    {
        $request->validate([
            'nom' => 'required|string|max:255|unique:ufrs,nom,' . $ufr->id_ufr . ',id_ufr',
        ]);

        $ufr->update($request->only('nom'));

        return redirect()->route('ufr.index');
    }

    // /**
    //  * DELETE
    //  */
    public function destroy(Ufr $ufr)
    {
        $ufr->delete();

        return redirect()->route('ufr.index');
    }
}
// namespace App\Http\Controllers;

// use App\Models\Ufr;
// use Illuminate\Http\Request;

// class UfrController extends Controller
// {
//     /**
//      * LISTE DES UFR
//      */
//     public function index()
//     {
//         $ufrs = Ufr::withCount('departements')
//             ->orderBy('nom')
//             ->paginate(10);

//         return view('pages.ufr.list_ufr', compact('ufrs'));
//     }

//     /**
//      * FORMULAIRE CRÉATION
//      */
//     public function create()
//     {
//         return view('pages.ufr.create_ufr');
//     }

// //     /**
// //      * ENREGISTRER
// //      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'nom' => 'required|string|max:255|unique:ufrs,nom',
//         ]);

//         Ufr::create($request->only('nom'));

//         return redirect()->route('ufr.index')
//             ->with('success', 'UFR créé avec succès.');
//     }

// //     /**
// //      * AFFICHER UNE UFR (MODEL BINDING)
// //      */
//     public function show(Ufr $ufr)
//     {
//         $ufr->load(['departements.filieres']);

//         return view('pages.ufr.show_ufr', compact('ufr'));
//     }

// //     /**
// //      * FORMULAIRE MODIFICATION (MODEL BINDING)
// //      */
//     public function edit(Ufr $ufr)
//     {
//         return view('pages.ufr.edit_ufr', compact('ufr'));
//     }

// //     /**
// //      * METTRE À JOUR (MODEL BINDING)
// //      */
//     public function update(Request $request, Ufr $ufr)
//     {
//         $request->validate([
//             'nom' => 'required|string|max:255|unique:ufrs,nom,' . $ufr->id_ufr . ',id_ufr',
//         ]);

//         $ufr->update($request->only('nom'));

//         return redirect()->route('ufr.index')
//             ->with('success', 'UFR mise à jour.');
//     }

// //     /**
// //      * SUPPRIMER (MODEL BINDING)
// //      */
//     public function destroy(Ufr $ufr)
//     {
//         $ufr->delete();

//         return redirect()->route('ufr.index')
//             ->with('success', 'UFR supprimée.');
//     }
// }