<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VerifySession
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            // Verify session is still valid
            if (! Auth::user()->est_actif) {
                Auth::logout();

                return redirect()->route('login')->with('error', 'Votre compte a été désactivé');
            }
        }

        return $next($request);
    }
}
