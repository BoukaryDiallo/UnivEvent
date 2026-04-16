@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/candidature.css') }}">
@endpush

@section('content')
<div class="container mt-5 d-flex justify-content-center align-items-center" style="min-height:85vh;">

    <div class="card candidat-card shadow-sm" style="width:550px;">

        {{-- IMAGE / ICON --}}
        @if($candidature->user->photo)
            <img src="{{ $candidature->user->photo }}"
                 class="card-img-top rounded-circle mx-auto mt-4"
                 style="width:150px;height:150px;">
        @else
            <div class="text-center mt-4">
                <i class="bi bi-person-circle" style="font-size:120px;color:#6c757d;"></i>
            </div>
        @endif

        <div class="card-body text-center">

            {{-- NOM --}}
            <h5 class="card-title">
                {{ $candidature->user->name }}
            </h5>

            <hr>

            {{-- PROGRAMME --}}
            <p class="candidat-programme p-3">
                {{ $candidature->programme ?? 'Aucun programme renseigné.' }}
            </p>

            {{-- ACTIONS --}}
            <div class="d-flex justify-content-between mt-4">

                <a href="{{ route('votes.candidats', $candidature->id_election) }}"
                   class="btn btn-secondary"
                   style="width:200px;height:50px;">
                    Retour
                </a>

                <form method="POST" action="{{ route('votes.store') }}">
                    @csrf
                    <input type="hidden" name="id_election" value="{{ $candidature->id_election }}">
                    <input type="hidden" name="id_candidature" value="{{ $candidature->id_candidature }}">

                    <button class="btn btn-success"
                            style="width:200px;height:50px;">
                        Voter
                    </button>
                </form>

            </div>

        </div>
    </div>

</div>
@endsection