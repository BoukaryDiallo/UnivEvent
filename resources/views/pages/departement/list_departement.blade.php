@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Liste des Départements</h2>

        <a href="{{ route('departement.create') }}" class="btn btn-success">
            <i class="fas fa-plus me-2"></i>Nouveau Département
        </a>
    </div>

    <div class="card shadow">

        <div class="card-header bg-white">
            <div class="row align-items-center">

                <div class="col-md-6">
                    <h5 class="mb-0">
                        <i class="fas fa-building me-2 text-success"></i>
                        Départements
                    </h5>
                </div>

                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text"
                               class="form-control"
                               placeholder="Rechercher un département..."
                               id="searchDepartement">

                        <button class="btn btn-outline-success" type="button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <div class="card-body">

            <div class="table-responsive">
                <table class="table table-hover align-middle" id="departementTable">

                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>UFR</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                    @forelse($departements as $departement)

                        <tr>

                            <td>
                                <span class="badge bg-success">
                                    {{ $departement->id_departement }}
                                </span>
                            </td>

                            <td>
                                <strong>{{ $departement->nom }}</strong>
                            </td>
                            <td>
                                <span class="badge bg-success">
                                    {{ $departement->ufr?->nom ?? 'N/A' }}
                                </span>
                            </td>

                            <td>
                                <div class="btn-group" role="group">

                                    {{-- VIEW --}}
                                    <a href="{{ route('departement.show', $departement) }}"
                                       class="btn btn-sm btn-outline-success"
                                       title="Voir">
                                        <i class="fas fa-eye"></i>
                                    </a>

                                    {{-- EDIT --}}
                                    <a href="{{ route('departement.edit', $departement) }}"
                                       class="btn btn-sm btn-outline-warning"
                                       title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>

                                    {{-- DELETE --}}
                                    <form id="deleteForm-{{ $departement->id }}"
                                          action="{{ route('departement.destroy', $departement) }}"
                                          method="POST"
                                          class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>

                                    <button class="btn btn-sm btn-outline-danger"
                                            title="Supprimer"
                                            onclick="confirmDelete({{ $departement->id_departement }})">
                                        <i class="fas fa-trash"></i>
                                    </button>

                                </div>
                            </td>

                        </tr>

                    @empty

                        <tr>
                            <td colspan="4" class="text-center py-4">
                                <i class="fas fa-building fa-3x text-muted mb-3"></i>
                                <p class="text-muted mb-0">Aucun département trouvé.</p>
                            </td>
                        </tr>

                    @endforelse

                    </tbody>

                </table>
            </div>

        </div>
    </div>

</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/departement.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/departement.js') }}"></script>
@endpush