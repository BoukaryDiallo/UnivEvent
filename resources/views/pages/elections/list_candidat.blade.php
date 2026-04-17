@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <h3 class="text-success mb-4 fw-bold">
        {{ $election->titre }}
    </h3>

    <a href="{{ route('votes.elections') }}" class="btn btn-secondary mb-4">
        ← Retour aux élections
    </a>

    {{-- 🔔 MESSAGES FLASH (IMPORTANT) --}}
    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger">
            {{ session('error') }}
        </div>
    @endif

    {{-- BANDEAU TITRE --}}
    <div class="mb-3">
        <div class="bg-success text-white fw-bold px-3 py-2 rounded">
            {{ $election->titre }}
        </div>
    </div>

    {{-- LISTE CANDIDATS --}}
    @foreach($candidatures as $c)
        <div class="candidat-item mb-3 d-flex align-items-center justify-content-between">

            {{-- PHOTO + INFOS --}}
            <div class="d-flex align-items-center">
                <img src="{{ $c->user->photo ?? 'https://ui-avatars.com/api/?name=Candidate&background=0D8ABC&color=fff&size=128' }}"
                     class="candidat-photo me-3">

                <div>
                    <div class="fw-bold fs-5 text-dark">
                        {{ $c->user->name }}
                    </div>
                    <div class="text-muted small">
                        {{ Str::limit($c->programme ?? 'Programme non disponible', 80) }}
                    </div>
                </div>
            </div>

            {{-- ACTIONS --}}
            <div class="d-flex gap-2">
                <a href="{{ route('votes.candidat.show', $c) }}"
                   class="btn btn-profil">
                    Voir Profil
                </a>

                <form method="POST" action="{{ route('votes.store') }}">
                    @csrf
                    <input type="hidden" name="id_election" value="{{ $election->id_election }}">
                    <input type="hidden" name="id_candidature" value="{{ $c->id_candidature }}">

                    <button class="btn btn-voter">
                        Voter
                    </button>
                </form>
            </div>

        </div>
    @endforeach

</div>

@push('styles')
<link rel="stylesheet" href="{{ asset('css/vote.css') }}">
@endpush

@endsection