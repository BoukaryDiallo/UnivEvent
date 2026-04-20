<?php

namespace App\Http\Controllers;

use App\Metiers\AlerteMetier;
use App\Metiers\DispoMetier;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\Prise;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected AlerteMetier $alertes,
        protected DispoMetier $metier,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user !== null, 401);

        if ($user->role === 'enseignant') {
            return inertia('dashboard', [
                'role' => 'enseignant',
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

        return inertia('dashboard', [
            'role' => $user->role,
            'resume' => [
                'enseignants' => User::query()->where('role', 'enseignant')->count(),
                'dispos' => Dispo::query()->count(),
                'ecarts' => Ecart::query()->count(),
                'reservations' => Prise::query()->whereNull('libere_at')->count(),
            ],
        ]);
    }

    protected function grille(int $userId): array
    {
        return $this->metier->grilleHebdomadaire($userId, false);
    }
}
