<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DiplomaAdminDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(DiplomaAdminDashboardService $service): Response
    {
        return Inertia::render('admin/dashboard', $service->snapshot());
    }
}
