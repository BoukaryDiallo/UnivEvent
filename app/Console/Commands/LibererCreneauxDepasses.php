<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\EmploiDuTemps;
use App\Models\Seance;
use Carbon\Carbon;

#[Signature('app:liberer-creneaux-depasses')]
#[Description('Command description')]
class LibererCreneauxDepasses extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        $now = Carbon::now();
        $jourActuel = $now->locale('fr')->dayName;
        
        
        $jourActuel = ucfirst($jourActuel);

        
        $emplois = EmploiDuTemps::where('statut', 'Publié')
            ->where('date_debut', '<=', $now->toDateString())
            ->where('date_fin', '>=', $now->toDateString())
            ->get();

        foreach ($emplois as $edt) {
            
            $seances = Seance::where('emploi_du_temps_id', $edt->id)
                ->where('jour_semaine', $jourActuel)
                ->whereNotNull('prise_id')
                ->with(['prise', 'creneau'])
                ->get();

            foreach ($seances as $seance) {
                if (!$seance->creneau || !$seance->prise) continue;

                
                $heureFin = Carbon::createFromFormat(
                    'H:i', 
                    $seance->creneau->heure_fin
                )->setDateFrom($now);

                
                if ($now->greaterThan($heureFin)) {
                    if (is_null($seance->prise->libere_at)) {
                        $seance->prise->update(['libere_at' => now()]);
                    }
                    $seance->update(['prise_id' => null]);

                    $this->info("Séance #{$seance->id} libérée ({$jourActuel} - {$seance->creneau->heure_fin})");
                }
            }
        }

        $this->info('Vérification terminée.');
    
    }
}
