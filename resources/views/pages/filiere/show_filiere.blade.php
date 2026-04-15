@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Détails de la Filière</h2>
        <div>
            <a href="{{ route('filiere.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>Retour
            </a>
            <a href="{{ route('filiere.edit', $filiere) }}" class="btn btn-warning">
                <i class="fas fa-edit me-2"></i>Modifier
            </a>
        </div>
    </div>

    <div class="card shadow">
        <div class="card-header bg-info text-white">
            <h5 class="mb-0">Informations générales</h5>
        </div>

        <div class="card-body">

            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Nom :</strong>
                    {{ $filiere->nom }}
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Département :</strong><br>
                    {{ $filiere->departement->nom }}
                </div>

                <div class="col-md-6">
                    <strong>UFR :</strong><br>
                    {{ $filiere->departement->ufr->nom }}
                </div>
            </div>

        </div>
    </div>
</div>
@endsection