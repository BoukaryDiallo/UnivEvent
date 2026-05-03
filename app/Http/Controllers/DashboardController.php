<?php

namespace App\Http\Controllers;

use App\Services\DiplomaStudentDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DiplomaStudentDashboardService $service): Response
    {
        return Inertia::render('dashboard', $service->snapshot($request->user()));
    }
}
