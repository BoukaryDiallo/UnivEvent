<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClubRequest;
use App\Models\Club;
use App\Models\NotificationClub;
use App\Models\User;
use App\Notifications\ClubCreationFailedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClubController extends Controller
{
    /**
     * Afficher la liste des ressources.
     */
    public function index()
    {
        $userId = Auth::id();
        $user = Auth::user();

        $query = Club::with(['responsable', 'adhesions' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        }]);

        // Masquer les clubs 'en attente' (sauf si on est le responsable)
        $query->where(function ($q) use ($userId) {
            $q->where('statut', '!=', 'en_attente')
                ->orWhere('responsable_id', $userId);
        });

        // Masquer les clubs 'dissous' pour les non-admins
        if (! $user->isAdmin()) {
            $query->where('statut', '!=', 'dissous');
        }

        $clubs = $query->get();

        return Inertia::render('Clubs/Index', ['clubs' => $clubs]);
    }

    public function enAttente()
    {
        $clubs = Club::with('responsable')->where('statut', 'en_attente')->get();

        return Inertia::render('Admin/ClubsEnAttente', ['clubs' => $clubs]);
    }

    /**
     * Afficher le formulaire de création d'une nouvelle ressource.
     */
    public function create()
    {
        return Inertia::render('Clubs/Create');
    }

    /**
     * Stocker une nouvelle ressource créée dans le stockage.
     */
    public function store(StoreClubRequest $request)
    {
        \Log::info('Club creation attempt', ['user' => Auth::id(), 'is_admin' => Auth::user()->isAdmin()]);

        $data = $request->validated();
        \Log::info('Validated data', $data);

        // Si l'administrateur crée le club, valider et trouver l'utilisateur par nom et prénom
        if (Auth::user()->isAdmin()) {
            \Log::info('Admin creating club', ['president_nom' => $data['president_nom'] ?? null, 'president_prenom' => $data['president_prenom'] ?? null]);

            if (empty($data['president_nom']) || empty($data['president_prenom'])) {
                \Log::warning('President name missing for admin');

                return redirect()->back()->with('error', 'Le nom et prénom du président sont requis pour les administrateurs.');
            }
            $president = User::where('name', $data['president_nom'].' '.$data['president_prenom'])->first();
            \Log::info('President search result', ['found' => ! is_null($president), 'name' => $data['president_nom'].' '.$data['president_prenom']]);

            if (! $president) {
                return redirect()->back()->with('error', 'Étudiant non trouvé. Vérifiez le nom et prénom.');
            }
            if (! $president->est_actif) {
                \Log::warning('President not active', ['president' => $president->id]);
                // Envoyer une notification à l'administrateur en utilisant le système de notification de Laravel
                Auth::user()->notify(new ClubCreationFailedNotification($president->name));

                return redirect()->back()->with('error', 'Cet étudiant n\'est pas inscrit ou son compte est désactivé. Une notification a été envoyée.');
            }
            $data['responsable_id'] = $president->id;
            \Log::info('President assigned', ['president_id' => $president->id]);
        } else {
            $data['responsable_id'] = Auth::id();
        }

        $data['statut'] = 'en_attente';
        $club = Club::create($data);
        \Log::info('Club created', ['club_id' => $club->id]);

        // Rejoindre automatiquement le créateur en tant que membre (ou le président si l'administrateur l'a créé)
        $club->adhesions()->create([
            'user_id' => $data['responsable_id'],
            'statut' => 'approuvee',
            'role_dans_club' => 'membre',
            'date_adhesion' => now(),
        ]);

        return redirect()->route('clubs.index')->with('success', 'Club créé avec succès. En attente de validation par l\'administration.');
    }

    /**
     * Afficher la ressource spécifiée.
     */
    public function show(string $id)
    {
        $club = Club::with(['responsable', 'membres', 'activites', 'adhesions' => function ($query) {
            $query->with('user');
        }, 'demandesLocal', 'demandesBudget', 'forumMessages' => function ($query) {
            $query->with('user');
        }])->findOrFail($id);

        return Inertia::render('Clubs/Show', [
            'club' => $club,
        ]);
    }

    /**
     * Afficher le formulaire d'édition de la ressource spécifiée.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Mettre à jour la ressource spécifiée dans le stockage.
     */
    public function update(Request $request, string $id)
    {
        $club = Club::findOrFail($id);
        $club->update($request->all());

        return redirect()->route('clubs.index')->with('success', 'Club mis à jour avec succès');
    }

    /**
     * Supprimer la ressource spécifiée du stockage.
     */
    public function destroy(string $id)
    {
        $club = Club::findOrFail($id);
        $club->delete();

        return redirect()->route('clubs.index')->with('success', 'Club supprimé avec succès');
    }

    // Méthodes d'administration pour la gestion du statut des clubs
    public function valider(string $id)
    {
        $club = Club::findOrFail($id);
        $club->update(['statut' => 'actif']);

        // Notifier le responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Votre club '.$club->nom.' a été validé et est maintenant actif',
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Club validé avec succès');
    }

    public function rejeter(string $id, Request $request)
    {
        $club = Club::findOrFail($id);
        $club->update(['statut' => 'dissous']);

        // Notifier le responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Votre club '.$club->nom.' a été rejeté. Motif: '.$request->commentaire,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Club rejeté');
    }

    public function suspendre(string $id, Request $request)
    {
        $club = Club::findOrFail($id);
        $club->update(['statut' => 'suspendu']);

        $motif = $request->input('motif', 'Aucun motif spécifié');

        // Notifier le responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Votre club '.$club->nom.' a été suspendu. Motif: '.$motif,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Club suspendu');
    }

    public function dissoudre(string $id, Request $request)
    {
        $club = Club::findOrFail($id);
        $club->update(['statut' => 'dissous']);

        $motif = $request->input('motif', 'Aucun motif spécifié');

        // Notifier le responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Votre club '.$club->nom.' a été dissous. Motif: '.$motif,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Club dissous');
    }

    public function reactiver(string $id)
    {
        $club = Club::findOrFail($id);
        $club->update(['statut' => 'actif']);

        // Notifier le responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Votre club '.$club->nom.' a été réactivé et est maintenant actif',
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Club réactivé avec succès');
    }

    public function transfererResponsabilite(Request $request, string $id)
    {
        $club = Club::findOrFail($id);
        $newResponsableId = $request->input('user_id');

        // Vérifier que l'utilisateur actuel est le responsable
        if ($club->responsable_id !== Auth::id()) {
            abort(403, 'Seul le responsable actuel peut transférer la responsabilité.');
        }

        // Vérifier que le nouveau responsable est un membre
        $newResponsable = $club->adhesions()->where('user_id', $newResponsableId)
            ->where('statut', 'approuvee')
            ->first();

        if (! $newResponsable) {
            return redirect()->back()->with('error', 'L\'utilisateur sélectionné n\'est pas un membre du club.');
        }

        // Transférer la responsabilité
        $club->update(['responsable_id' => $newResponsableId]);

        // Notifier le nouveau responsable
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Vous êtes maintenant le responsable du club '.$club->nom,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Responsabilité transférée avec succès');
    }
}
