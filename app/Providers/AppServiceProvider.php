<?php

namespace App\Providers;

use App\Contrats\DispoContrat;
use App\Metiers\DispoMetier;
use App\Policies\NotificationPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use App\Models\Election;
use App\Observers\ElectionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(DispoContrat::class, DispoMetier::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Election::observe(ElectionObserver::class);
        $this->configureDefaults();

        Gate::policy(DatabaseNotification::class, NotificationPolicy::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
