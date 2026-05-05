<?php
/* c:\Users\PADSEM\clother-integrateur\UnivEvent\app\Http\Controllers\ForumController.php */
namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\ForumMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ForumController extends Controller
{
    public function store(Request $request, Club $club)
    {
        // Check if user is member or admin
        $isMember = $club->adhesions()->where('user_id', Auth::id())->where('statut', 'approuvee')->exists();
        $isAdmin = Auth::user()->role === 'admin';

        if (!$isMember && !$isAdmin) {
            return back()->with('error', 'Vous devez être membre du club pour participer au forum.');
        }

        $request->validate([
            'contenu' => 'required|string|max:1000',
        ]);

        ForumMessage::create([
            'club_id' => $club->id,
            'user_id' => Auth::id(),
            'contenu' => $request->contenu,
        ]);

        return back()->with('success', 'Message posté !');
    }

    public function destroy(ForumMessage $message)
    {
        // Check if user is author or admin
        if ($message->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return back()->with('error', 'Action non autorisée.');
        }

        $message->delete();

        return back()->with('success', 'Message supprimé.');
    }
}
