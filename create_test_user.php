<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$user = \App\Models\User::create([
    'name' => 'Test User',
    'email' => 'test2@example.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);

echo 'User created with ID: ' . $user->id . PHP_EOL;
