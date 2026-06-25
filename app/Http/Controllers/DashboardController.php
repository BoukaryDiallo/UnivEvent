<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\Club;
use App\Models\Adhesion;
use App\Services\DiplomaStudentDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request, DiplomaStudentDashboardService $service): Response
    {
        $activites = Activite::whereHas('club', function($query) {
            if (!Auth::user()->isAdmin()) {
                $query->where('statut', '!=', 'dissous');
            }
        })
        ->with('club')
        ->where('statut', 'publié')
        ->orderBy('date_debut', 'asc')
        ->get();

        $stats = [
            'clubsCount' => Club::when(!Auth::user()->isAdmin(), function($q) {
                return $q->where('statut', '!=', 'dissous');
            })->count(),
            'activitiesCount' => Activite::where('statut', 'publié')->count(),
            'membersCount' => Adhesion::where('statut', 'approuvee')->distinct('user_id')->count()
        ];

        $diplomaData = $service->snapshot($request->user());

        return Inertia::render('dashboard', array_merge([
            'activites' => $activites,
            'stats' => $stats
        ], $diplomaData));
    }
}
