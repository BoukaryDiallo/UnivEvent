<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\EvenementActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    /**
     * Get activities for the current user (related to their events) or global for admin.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = EvenementActivity::with(['user:id,name', 'evenement:id,titre,cree_par'])
            ->latest();

        if (!$user || $user->role !== 'admin') {
            $query->where(function ($q) use ($user) {
                // 1. I see my own activities (what I did)
                $q->where('user_id', $user->id)
                
                  // 2. OR I am the creator/organizer of the event (I see everything for it)
                  ->orWhereHas('evenement', function($eq) use ($user) {
                      $eq->where('cree_par', $user->id)
                         ->orWhereHas('assignments', fn($aq) => $aq->where('user_id', $user->id)->where('role', 'organisateur'));
                  })
                  
                  // 3. OR I am a participant/stakeholder and it's a PUBLIC activity
                  ->orWhere(function($sq) use ($user) {
                      $sq->whereIn('type', [
                          'commentaire_ajoute', 
                          'message_envoye', 
                          'programme_ajoute', 
                          'resultat_publie', 
                          'publication', 
                          'evenement_aime', 
                          'cloture'
                      ])->where(function($evQ) use ($user) {
                          $evQ->whereHas('evenement.inscriptions', fn($iq) => $iq->where('utilisateur_id', $user->id))
                              ->orWhereHas('evenement.assignments', fn($aq) => $aq->where('user_id', $user->id));
                      });
                  });
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('evenement', fn($eq) => $eq->where('titre', 'like', "%{$search}%"));
            });
        }

        return $query->paginate(20)->withQueryString();
    }

    public function markAsRead(EvenementActivity $activity)
    {
        // Simple permission check: must be owner of event or admin
        if (Auth::id() !== $activity->evenement->cree_par && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $activity->update(['read_at' => now()]);

        return redirect()->back()->with('success', 'Marqué comme lu.');
    }

    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $query = EvenementActivity::whereNull('read_at');

        if (!$user || $user->role !== 'admin') {
            $query->whereHas('evenement', fn($q) => $q->where('cree_par', $user->id));
        }

        $query->update(['read_at' => now()]);

        return redirect()->back()->with('success', 'Tout est marqué comme lu.');
    }

    public function destroy(EvenementActivity $activity)
    {
        if (Auth::id() !== $activity->evenement->cree_par && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $activity->delete();

        return redirect()->back()->with('success', 'Notification supprimée.');
    }

    public function clearAll()
    {
        $user = Auth::user();
        $query = EvenementActivity::query();

        if (!$user || $user->role !== 'admin') {
            $query->whereHas('evenement', fn($q) => $q->where('cree_par', $user->id));
        }

        $query->delete();

        return redirect()->back()->with('success', 'Historique vidé.');
    }
}
