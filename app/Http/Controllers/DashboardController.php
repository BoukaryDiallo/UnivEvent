<?php

namespace App\Http\Controllers;

use App\Metiers\AlerteMetier;
use App\Metiers\DispoMetier;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\Prise;
use App\Services\DiplomaStudentDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected AlerteMetier $alertes,
        protected DispoMetier $metier,
    ) {
    }

    public function index(Request $request, DiplomaStudentDashboardService $service): Response
    {
        $user = $request->user();

        abort_unless($user !== null, 401);

        if ($user->role === 'enseignant') {
            return Inertia::render('mon-planning', [
                'resume' => [
                    'dispos' => Dispo::query()->where('user_id', $user->id)->count(),
                    'ecarts' => Ecart::query()->where('user_id', $user->id)->count(),
                    'reservations' => Prise::query()->where('user_id', $user->id)->whereNull('libere_at')->count(),
                    'notifications' => count($this->alertes->pour($user)),
                ],
                'reservations' => Prise::query()
                    ->where('user_id', $user->id)
                    ->latest('date')
                    ->limit(5)
                    ->get()
                    ->map(fn (Prise $prise) => [
                        'id' => $prise->id,
                        'date' => $prise->date?->toDateString(),
                        'debut' => substr($prise->debut, 0, 5),
                        'fin' => substr($prise->fin, 0, 5),
                        'source' => $prise->source,
                        'niveau' => $prise->niveau,
                        'libere_at' => $prise->libere_at?->toDateTimeString(),
                    ]),
                'grille' => $this->grille($user->id),
            ]);
        }

        return Inertia::render('dashboard', $service->snapshot($user));
    }

    protected function grille(int $userId): array
    {
        return $this->metier->grilleHebdomadaire($userId, false);
    }
}
