<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$users = \App\Models\User::all()->pluck('email');
echo 'Users: ' . $users->toJson() . PHP_EOL;
