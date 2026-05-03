<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->seedDefaultRoles();
    }

    private function seedDefaultRoles(): void
    {
        if (! \Schema::hasTable(config('permission.table_names.roles'))) {
            return;
        }

        $this->seed(\Database\Seeders\RbacSeeder::class);
    }

    protected function skipUnlessFortifyFeature(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
