@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold">Détails Étudiant</h2>

        <a href="{{ route('etudiants.index') }}" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Retour
        </a>
    </div>

    <div class="row">

        <!-- INFOS -->
        <div class="col-md-8">

            <div class="card shadow mb-3">
                <div class="card-body">

                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Nom :</strong> {{ $etudiant->user->name }}</p>
                            <p><strong>INE :</strong> {{ $etudiant->INE }}</p>
                            <p><strong>Niveau :</strong>
                                <span class="badge bg-info">
                                    {{ $etudiant->niveau }}
                                </span>
                            </p>
                        </div>

                        <div class="col-md-6">
                            <p><strong>Filière :</strong> {{ $etudiant->filiere->nom ?? 'N/A' }}</p>
                            <p><strong>Département :</strong> {{ $etudiant->departement->nom ?? 'N/A' }}</p>
                            <p><strong>UFR :</strong> {{ $etudiant->ufr->nom ?? 'N/A' }}</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>

        <!-- PHOTO -->
        <div class="col-md-4">
            <div class="card shadow text-center p-3">

                @if($etudiant->photo)
                    <img src="{{ asset('storage/'.$etudiant->photo) }}"
                         class="rounded-circle mx-auto"
                         width="120">
                @else
                    <i class="bi bi-person-circle fs-1"></i>
                @endif

                <h5 class="mt-3">{{ $etudiant->user->name }}</h5>

            </div>
        </div>

    </div>

</div>
@endsection