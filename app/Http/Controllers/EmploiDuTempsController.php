<?php

namespace App\Http\Controllers;

use App\Contrats\DispoContrat;
use App\Mail\EmploiDuTempsEmail;
use App\Models\EmploiDuTemps;
use App\Models\AnneeAcademique;
use App\Models\Creneau;
use App\Models\Filiere;
use App\Models\Niveau;
use App\Models\Enseignant;
use App\Models\Matiere;
use App\Models\Salle;
use App\Models\Seance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class EmploiDuTempsController extends Controller
{
    public function __construct(
        protected DispoContrat $metier
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function adminVue()
    {
        $emplois = EmploiDuTemps::with(['anneeAcademique', 'filiere', 'niveau'])
                    ->latest()
                    ->paginate(10);

        $matieres = Matiere::count();
        $niveaux = Niveau::count();
        $fillieres = Filiere::count();
        $salles = Salle::count();
        $totalCreneau = Creneau::count();

        $anneesData = AnneeAcademique::orderBy('libelle', 'desc')->get();
        $filieresData = Filiere::all();
        $niveauxData = Niveau::orderBy('ordre')->get();

        // $edt = EmploiDuTemps::with('filiere', 'niveau')->findOrFail($id);
        // $enseignants = Enseignant::all();
        $matieresSeance = Matiere::all();
        $sallesSeance = Salle::all();
        $creneaux = Creneau::all();

        $userEnseignants = User::role('enseignant')
            ->with('enseignant')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'enseignant_id' => $u->enseignant?->id,
                'name' => $u->name,
            ]);

        foreach ($emplois as $edt) {
            if ($edt->date_fin && Carbon::parse($edt->date_fin)->isPast() && $edt->statut !== 'Archivé') {
                $edt->update(['statut' => 'Archivé']);
            }
        }

        return Inertia::render('EmploiDuTemps/Admin/edt', [
            'emplois' => $emplois,
            'matieres' => $matieres,
            'niveaux' => $niveaux,
            'filieres' => $fillieres,
            'salles' => $salles,
            'totalCreneau' => $totalCreneau,

            'niveauxData' => $niveauxData,
            'filieresData' => $filieresData,
            'anneesData' => $anneesData,

            'userEnseignants' => $userEnseignants,
            'creneaux' => $creneaux,
            'sallesSeance' => $sallesSeance,
            'matieresSeance' => $matieresSeance
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // faut que je revois ca apres

    

    /**
     * Store a newly created resource in storage.
     */
    // 



    public function creerEmploiDuTemps(Request $request)
    {
        $data = $request->validate([
            'titre'               => 'required|string|max:150',
            'semestre'            => 'required|in:S1,S2,S3,S4,S5,S6,S7,S8,S9,S10',
            'annee_academique_id' => 'required|integer|exists:annee_academiques,id',
            'filiere_id'          => 'required|integer|exists:filieres,id_filiere',
            'niveau_id'           => 'required|integer|exists:niveaux,id',
            'groupe'              => 'nullable|string|max:10',
            'date_debut'          => 'nullable|date',
            'date_fin'            => 'nullable|date|after_or_equal:date_debut',
        ]);
        $query = EmploiDuTemps::where('filiere_id', $data['filiere_id'])
            ->where('niveau_id', $data['niveau_id'])
            ->whereDate('date_debut', $data['date_debut'])
            ->whereDate('date_fin', $data['date_fin']);

        if (is_null($data['groupe']) || $data['groupe'] === '') {
            $query->whereNull('groupe');
        } else {
            $query->where('groupe', $data['groupe']);
        }

        if ($query->exists()) {
            return back()->withErrors([
                'conflit' => (is_null($data['groupe']) || $data['groupe'] === '')
                    ? "Un emploi du temps existe déjà pour cette filière, ce niveau et ces dates."
                    : "Un emploi du temps existe déjà pour ce groupe, cette filière, ce niveau et ces dates."
            ]);
        }

        EmploiDuTemps::create([
            ...$data,
            'statut'  => 'Brouillon',
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Emploi du temps créé avec succès.');
    }



    public function modifierEdt(Request $request, string $id)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:150',
            'semestre' => 'required|in:S1,S2,S3,S4,S5,S6,S7,S8,S9,S10',
            'annee_academique_id' => 'required|integer|exists:annee_academiques,id',
            'filiere_id' => 'required|integer|exists:filieres,id_filiere',
            'niveau_id' => 'required|integer|exists:niveaux,id',
            'groupe' => 'nullable|string|max:10',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
        ]);

        $edt = EmploiDuTemps::findOrFail($id);

        $query = EmploiDuTemps::where('filiere_id', $data['filiere_id'])
            ->where('niveau_id', $data['niveau_id'])
            ->whereDate('date_debut', $data['date_debut'])
            ->whereDate('date_fin', $data['date_fin'])
            ->where('id', '!=', $id);

        if (is_null($data['groupe']) || $data['groupe'] === '') {
            $query->whereNull('groupe');
        } else {
            $query->where('groupe', $data['groupe']);
        }

        if ($query->exists()) {
            return back()->withErrors([
                'conflit' => (is_null($data['groupe']) || $data['groupe'] === '')
                    ? "Un emploi du temps existe déjà pour cette filière, ce niveau et ces dates."
                    : "Un emploi du temps existe déjà pour ce groupe, cette filière, ce niveau et ces dates."
            ]);
        }

        $edt->update($data);

        return back()->with('success', 'Emploi du temps mis à jour');
    }

    public function vueAjoutSeance(string $id)
    {
        $edt = EmploiDuTemps::with('filiere', 'niveau')->findOrFail($id);
        // $enseignants = Enseignant::all();
        $matieres = Matiere::all();
        $salles = Salle::all();
        $creneaux = Creneau::all();
        $userEnseignants = User::role('enseignant')->get();

        return Inertia::render('EmploiDuTemps/Admin/seance', [
            'edt' => $edt,
            // 'enseignants' => $enseignants,
            'userEnseignants' => $userEnseignants,
            'creneaux' => $creneaux,
            'salles' => $salles,
            'matieres' => $matieres
        ]);
    }


    public function publierEdt(string $id)
    {
        $edt = EmploiDuTemps::findOrFail($id);
        $edt->update(['statut' => 'Publié']);
        return back()->with('success', 'Emploi du temps publié.');
    }



    public function ajouterSeance(Request $request, $id)
    {
        $data = $request->validate([
            'jour_semaine'  => 'required|string',
            'type_seance'   => 'required|in:CM,TD,TP,Examen',
            'creneau_id'    => 'required|integer|exists:creneaux,id',
            'enseignant_id' => 'required|integer|exists:users,id',
            'salle_id'      => 'required|integer|exists:salles,id',
            'matiere_id'    => 'required|integer|exists:matieres,id',
            'description'   => 'nullable|string',
            'user_id'       => 'required|integer|exists:users,id', 
            'check_date'    => 'required|date',
            'check_debut'   => 'required|string',
            'check_fin'     => 'required|string',
            'niveau'        => 'nullable|string',
        ]);

        $enseignant = Enseignant::where('user_id', $data['enseignant_id'])->firstOrFail();
        $data['enseignant_id'] = $enseignant->id;

        $edtCourant = EmploiDuTemps::findOrFail($id);

   
    $conflitJour = Seance::where('emploi_du_temps_id', $id)
        ->where('jour_semaine', $data['jour_semaine'])
        ->exists();

    if ($conflitJour) {
        return back()->withErrors([
            'conflit' => "Une séance existe déjà le {$data['jour_semaine']} dans cet emploi du temps."
        ]);
    }

    
    $edtEnConflit = EmploiDuTemps::where('id', '!=', $id)
        ->where(function ($q) use ($edtCourant) {
            $q->where('date_debut', '<=', $edtCourant->date_fin)
              ->where('date_fin', '>=', $edtCourant->date_debut);
        })
        ->pluck('id');

    
    $edtConcernes = $edtEnConflit->push($id);

   
    $conflitSalle = Seance::whereIn('emploi_du_temps_id', $edtConcernes)
        ->where('salle_id', $data['salle_id'])
        ->where('jour_semaine', $data['jour_semaine'])
        ->where('creneau_id', $data['creneau_id'])
        ->exists();

    if ($conflitSalle) {
        return back()->withErrors([
            'conflit' => "Cette salle est déjà occupée le {$data['jour_semaine']} sur ce créneau pendant cette période."
        ]);
    }

    
    $conflitEnseignant = Seance::whereIn('emploi_du_temps_id', $edtConcernes)
        ->where('enseignant_id', $data['enseignant_id'])
        ->where('jour_semaine', $data['jour_semaine'])
        ->where('creneau_id', $data['creneau_id'])
        ->exists();

    if ($conflitEnseignant) {
        return back()->withErrors([
            'conflit' => "Cet enseignant a déjà une séance le {$data['jour_semaine']} sur ce créneau pendant cette période."
        ]);
    }

    
    return DB::transaction(function () use ($data, $id) {
        $prise = $this->metier->prendre(
            $data['user_id'],
            $data['check_date'],
            $data['check_debut'] . ':00',
            $data['check_fin'] . ':00',
            'emploi du temps',
            "seance-edt-{$id}",
            '',
        );

        Seance::create([
            'jour_semaine'       => $data['jour_semaine'],
            'type_seance'        => $data['type_seance'],
            'creneau_id'         => $data['creneau_id'],
            'salle_id'           => $data['salle_id'],
            'matiere_id'         => $data['matiere_id'],
            'enseignant_id'      => $data['enseignant_id'],
            'description'        => $data['description'] ?? null,
            'emploi_du_temps_id' => $id,
            'prise_id'           => $prise->id,
        ]);

        return back()->with('success', 'Séance ajoutée avec succès.');
    });
    }

     public function adminSeanceEdt(string $id)
    {
        $matieresSeance = Matiere::all();
        $creneaux = Creneau::all();
        $sallesSeance = Salle::all();
        $emplois = EmploiDuTemps::with('anneeAcademique')->findOrFail($id);
        $userEnseignants = User::role('enseignant')
            ->with('enseignant')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'enseignant_id' => $u->enseignant?->id,
                'name' => $u->name,
            ]);

        $seances = Seance::where('emploi_du_temps_id', $id)
            ->with([
                'creneau',
                'salle',
                'matiere',
                'enseignant',
                'emploiDuTemps'
            ])
            ->orderByRaw("
                CASE jour_semaine
                    WHEN 'Lundi' THEN 1
                    WHEN 'Mardi' THEN 2
                    WHEN 'Mercredi' THEN 3
                    WHEN 'Jeudi' THEN 4
                    WHEN 'Vendredi' THEN 5
                    WHEN 'Samedi' THEN 6
                END
            ")
            ->get();

        return Inertia::render('EmploiDuTemps/Admin/seance-edt', [
            'seances' => $seances,
            'emplois' => $emplois,
            'matieresSeance' => $matieresSeance,
            'sallesSeance' => $sallesSeance,
            'userEnseignants' => $userEnseignants,
            'creneaux' => $creneaux
        ]);
    }


    public function modifierSeance(Request $request, $id)
    {
        $data = $request->validate([
            'jour_semaine'    => 'required|string',
            'type_seance'     => 'required|in:CM,TD,TP,Examen',
            'creneau_id'      => 'required|integer|exists:creneaux,id',
            'enseignant_id'   => 'required|integer|exists:users,id',
            'salle_id'        => 'required|integer|exists:salles,id',
            'matiere_id'      => 'required|integer|exists:matieres,id',
            'description'     => 'nullable|string',
            'user_id'         => 'required|integer|exists:users,id',
            'check_date'      => 'nullable|date',
            'check_debut'     => 'nullable|string',
            'check_fin'       => 'nullable|string',
            'niveau'          => 'nullable|string',
            'champs_modifies' => 'nullable|boolean',
        ]);

        $seance = Seance::with('prise')->findOrFail($id);
        $edtCourant = EmploiDuTemps::findOrFail($seance->emploi_du_temps_id);

        $enseignant = Enseignant::where('user_id', $data['enseignant_id'])->firstOrFail();
        $nouvelEnseignantId = $enseignant->id;
        $champsModifies = $data['champs_modifies'] ?? false;

        
        $edtEnConflit = EmploiDuTemps::where('id', '!=', $seance->emploi_du_temps_id)
            ->where(function ($q) use ($edtCourant) {
                $q->where('date_debut', '<=', $edtCourant->date_fin)
                ->where('date_fin', '>=', $edtCourant->date_debut);
            })
            ->pluck('id');

        $edtConcernes = $edtEnConflit->push($seance->emploi_du_temps_id);

        
        $conflitJour = Seance::where('emploi_du_temps_id', $seance->emploi_du_temps_id)
            ->where('jour_semaine', $data['jour_semaine'])
            ->where('id', '!=', $id)
            ->exists();

        if ($conflitJour) {
            return back()->withErrors([
                'conflit' => "Une séance existe déjà le {$data['jour_semaine']} dans cet emploi du temps."
            ]);
        }

        
        $conflitSalle = Seance::whereIn('emploi_du_temps_id', $edtConcernes)
            ->where('salle_id', $data['salle_id'])
            ->where('jour_semaine', $data['jour_semaine'])
            ->where('creneau_id', $data['creneau_id'])
            ->where('id', '!=', $id)
            ->exists();

        if ($conflitSalle) {
            return back()->withErrors([
                'conflit' => "Cette salle est déjà occupée le {$data['jour_semaine']} sur ce créneau pendant cette période."
            ]);
        }

        
        $conflitEnseignant = Seance::whereIn('emploi_du_temps_id', $edtConcernes)
            ->where('enseignant_id', $nouvelEnseignantId)
            ->where('jour_semaine', $data['jour_semaine'])
            ->where('creneau_id', $data['creneau_id'])
            ->where('id', '!=', $id)
            ->exists();

        if ($conflitEnseignant) {
            return back()->withErrors([
                'conflit' => "Cet enseignant a déjà une séance le {$data['jour_semaine']} sur ce créneau pendant cette période."
            ]);
        }

        return DB::transaction(function () use ($data, $seance, $id, $nouvelEnseignantId, $champsModifies) {

            $prise_id = $seance->prise_id; 

            
            if ($champsModifies) {

                
                if ($seance->prise_id && $seance->prise && is_null($seance->prise->libere_at)) {
                    $seance->prise->update(['libere_at' => now()]);
                }

                
                $prise = $this->metier->prendre(
                    $data['user_id'],
                    $data['check_date'],
                    $data['check_debut'] . ':00',
                    $data['check_fin'] . ':00',
                    'emploi du temps',
                    "seance-edt-{$seance->emploi_du_temps_id}",
                    '',
                );

                $prise_id = $prise->id;
            }

            $seance->update([
                'jour_semaine'  => $data['jour_semaine'],
                'type_seance'   => $data['type_seance'],
                'creneau_id'    => $data['creneau_id'],
                'salle_id'      => $data['salle_id'],
                'matiere_id'    => $data['matiere_id'],
                'enseignant_id' => $nouvelEnseignantId,
                'description'   => $data['description'] ?? null,
                'prise_id'      => $prise_id,
            ]);

            return back()->with('success', 'Séance modifiée avec succès.');
        });
    }



    /**
     * Display the specified resource.
     */
    public function supprimerSeance($id)
    {
        $seance = Seance::findOrFail($id);
        
        $prise_id = $seance->prise_id; 
        
        $seance->delete();
        
        return response()->json([
            'message' => 'Séance supprimée avec succès',
            'prise_id' => $prise_id 
        ]);
    }


    public function enseignantSeance()
    {
        $seances = Seance::where('enseignant_id', Auth::user()->enseignant?->id)
            ->whereNotNull('prise_id')
            ->with(['creneau', 'salle', 'matiere', 'emploiDuTemps'])
            ->orderByRaw("
                CASE jour_semaine
                    WHEN 'Lundi' THEN 1
                    WHEN 'Mardi' THEN 2
                    WHEN 'Mercredi' THEN 3
                    WHEN 'Jeudi' THEN 4
                    WHEN 'Vendredi' THEN 5
                    WHEN 'Samedi' THEN 6
                END
            ")
            ->get();

        return Inertia::render('EmploiDuTemps/Enseignant/edt', [
            'seances' => $seances,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function libererEnseignant($id)
    {
        $seance = Seance::with('prise')->findOrFail($id);

        if (!$seance->prise_id) {
            return back()->withErrors(['conflit' => 'Cet enseignant est déjà libéré.']);
        }

        
        if ($seance->prise && is_null($seance->prise->libere_at)) {
            $seance->prise->update(['libere_at' => now()]);
        }

        $seance->update(['prise_id' => null]);

        return back()->with('success', 'Enseignant libéré avec succès.');
    }


    public function edtEnseignantPdf($id)
    {
        $user = Auth::user();

        $edt = EmploiDuTemps::with([
            'filiere',
            'niveau',
            'seances.creneau',
            'seances.matiere',
            'seances.salle',
            'seances.enseignant.user'
        ])->findOrFail($id);

        $jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

        $ordreJours = [
            'Lundi'=>1,'Mardi'=>2,'Mercredi'=>3,
            'Jeudi'=>4,'Vendredi'=>5,'Samedi'=>6
        ];

        $sesSeances = $edt->seances
            ->whereNotNull('prise_id')
            ->filter(fn($s) =>
                optional($s->enseignant->user)->id === $user->id
            )
            ->sortBy(fn($s) =>
                ($ordreJours[$s->jour_semaine] ?? 99)
                . ($s->creneau->heure_debut ?? '')
            )
            ->map(fn($s) => [
                'jour' => $s->jour_semaine,
                'module' => $s->matiere->intitule ?? '-',
                'salle' => $s->salle->nom ?? '-',
                'type' => $s->type_seance,
                'debut' => $s->creneau->heure_debut ?? null,
                'fin' => $s->creneau->heure_fin ?? null,
            ]);

        $pdf = Pdf::loadView('pdf.edt-enseignant-pdf', compact('edt', 'jours', 'sesSeances', 'user'));

        return $pdf->download("EDT-{$edt->titre}.pdf");
    }


    public function envoyerEdtParEmail($id)
    {
        $edt = EmploiDuTemps::with([
            'filiere',
            'niveau',
            'seances.creneau',
            'seances.matiere',
            'seances.salle',
            'seances.enseignant.user'
        ])->findOrFail($id);

        $jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

        $ordreJours = [
            'Lundi'=>1,'Mardi'=>2,'Mercredi'=>3,
            'Jeudi'=>4,'Vendredi'=>5,'Samedi'=>6
        ];

        $seancesValides = $edt->seances->whereNotNull('prise_id');

        $enseignants = $seancesValides
            ->pluck('enseignant.user')
            ->filter()
            ->unique('id');

        $count = 0;

        foreach ($enseignants as $userEnseignant) {

            
            $sesSeances = $seancesValides
                ->where('enseignant.user.id', $userEnseignant->id)
                // ->sortBy(fn($s) => $s->creneau->heure_debut)
                ->sortBy(function ($s) use ($ordreJours) {
                    return ($ordreJours[$s->jour_semaine] ?? 99)
                        . ($s->creneau->heure_debut ?? '');
                })
                ->map(function ($s) {
                    return [
                        'jour' => $s->jour_semaine,
                        'module' => $s->matiere->intitule ?? '-',
                        'salle' => $s->salle->nom ?? '-',
                        'type' => $s->type_seance,
                        'debut' => $s->creneau->heure_debut ?? null,
                        'fin' => $s->creneau->heure_fin ?? null,
                    ];
                });

           
            $pdf = Pdf::loadView('pdf.edt-enseignant', [
                'edt' => $edt,
                'jours' => $jours,
                'seances' => $sesSeances,
                'enseignant' => $userEnseignant
            ]);

            $dir = storage_path('app/temp');
            if (!file_exists($dir)) {
                mkdir($dir, 0777, true);
            }

            $pdfPath = $dir . "/EDT-{$edt->id}-{$userEnseignant->id}.pdf";
            file_put_contents($pdfPath, $pdf->output());

            
            Mail::to($userEnseignant->email)
                ->send(new EmploiDuTempsEmail(
                    $edt,
                    $userEnseignant,
                    $pdfPath
                ));

            @unlink($pdfPath);

            $count++;
        }

        return back()->with('success', "Emplooi du temps envoyé à {$count} enseignant(s).");
    }


    public function etudiantSeance(Request $request)
    {
        $query = EmploiDuTemps::query()
            ->where('statut', 'Publié')
            ->with(['filiere', 'niveau']);

        if ($request->filled('id_filiere') && $request->id_filiere !== 'choisir') {
            $query->where('filiere_id', $request->id_filiere);
        }

        $emplois = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('EmploiDuTemps/Etudiant/edt', [
            'emplois' => $emplois,
            'filieres' => Filiere::select('id_filiere', 'nom', 'code')->get(),
            'filters' => $request->only(['id_filiere']),
        ]);
    }


    public function etudiantSeanceEdt(string $id)
    {
        $emplois = EmploiDuTemps::with('anneeAcademique')->findOrFail($id);
        
        $seances = Seance::where('emploi_du_temps_id', $id)
            ->with([
                'creneau',
                'salle',
                'matiere',
                'enseignant',
            ])
            ->orderByRaw("
                CASE jour_semaine
                    WHEN 'Lundi' THEN 1
                    WHEN 'Mardi' THEN 2
                    WHEN 'Mercredi' THEN 3
                    WHEN 'Jeudi' THEN 4
                    WHEN 'Vendredi' THEN 5
                    WHEN 'Samedi' THEN 6
                END
            ")
            ->get();

        return Inertia::render('EmploiDuTemps/Etudiant/seance-edt', [
            'seances' => $seances,
            'emplois' => $emplois
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    // public function vueFiliere()
    // {
    //     $filieres = Filiere::with('departement')->get();

    //     return Inertia::render('EmploiDuTemps/Etudiant/f', [
    //         'filieres' => $filieres
    //     ]);
    // }


    public function configurerAnne(Request $request)
    {
        $data = $request->validate([
            'date_debut' => 'required|string|max:4',
            'date_fin' => 'required|string|max:4'
        ]);

        $libelleEntrant = $data['date_debut'].'-'.$data['date_fin'];

        
        if (AnneeAcademique::where('libelle', $libelleEntrant)->exists()) {
            return back()->withErrors([
                'conflit' => 'Cette année académique existe déjà'
            ]);
        }

        AnneeAcademique::where('est_courante', true)
            ->update(['est_courante' => false]);

        
        AnneeAcademique::create([
            ...$data,
            'libelle' => $libelleEntrant,
            'est_courante' => true
        ]);

        return back()->with('success', 'Configuration de l\'année réussie');
    }



     public function telechargerPdf($id)
    {
        $edt = EmploiDuTemps::with([
            'filiere',
            'niveau',
            'seances.creneau',
            'seances.matiere',
            'seances.enseignant.user'
        ])->findOrFail($id);

        $jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

        $ordreJours = [
            'Lundi'=>1,'Mardi'=>2,'Mercredi'=>3,
            'Jeudi'=>4,'Vendredi'=>5,'Samedi'=>6
        ];

        $seances = $edt->seances
            ->sortBy(function ($s) use ($ordreJours) {
                return ($ordreJours[$s->jour_semaine] ?? 99)
                    . ($s->creneau->heure_debut ?? '');
            })
            ->map(function ($s) {
                return [
                    'jour' => $s->jour_semaine,
                    'module' => $s->matiere->intitule ?? '-',
                    'description' => $s->description ?? '-',
                    'salle' => $s->salle->nom ?? '-',
                    'type' => $s->type_seance,
                    'enseignant' => $s->enseignant->user->name ?? '-',
                    'specialite' => $s->enseignant->specialite ?? '-',
                    'debut' => $s->creneau->heure_debut ?? null,
                    'fin' => $s->creneau->heure_fin ?? null,
                    'prise' => $s->prise_id ?? null,
                ];
            });

        
        $pdf = Pdf::loadView('pdf.edt-etudiant', compact('edt', 'jours', 'seances'));

        return $pdf->download("EDT-{$edt->titre}.pdf");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function supprimerEdt(string $id)
    {
        $edt = EmploiDuTemps::with(['seances.prise'])->findOrFail($id);

        DB::transaction(function () use ($edt) {

            foreach ($edt->seances as $seance) {
                if ($seance->prise_id && $seance->prise) {
                    if (is_null($seance->prise->libere_at)) {
                        $seance->prise->update(['libere_at' => now()]);
                    }
                    $seance->update(['prise_id' => null]);
                }
            }

            $edt->seances()->delete();
            $edt->delete();
        });

        return back()->with('success', 'Emploi du temps supprimé avec succès.');
    }
}
