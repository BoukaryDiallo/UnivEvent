<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudent
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $isStudent = in_array($user->role, ['student', 'etudiant'], true)
            || $user->hasRole('student')
            || $user->hasRole('etudiant');

        if (! $isStudent) {
            abort(403);
        }

        return $next($request);
    }
}
