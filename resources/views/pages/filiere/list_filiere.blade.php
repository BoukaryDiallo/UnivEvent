@extends('layouts.app')

@section('content')
<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Liste des Filières</h2>

        <a href="{{ route('filiere.create') }}" class="btn btn-info">
            <i class="fas fa-plus me-2"></i>Nouvelle Filière
        </a>
    </div>

    <div class="card shadow">

        <div class="card-header bg-white">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h5 class="mb-0">
                        <i class="fas fa-graduation-cap me-2 text-info"></i>
                        Filières de formation
                    </h5>
                </div>

                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text"
                               class="form-control"
                               placeholder="Rechercher une filière..."
                               id="searchFiliere">

                        <button class="btn btn-outline-info" type="button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-body">

            <div class="table-responsive">
                <table class="table table-hover align-middle" id="filiereTable">

                    <thead class="table-light">
                        <tr>
                            <th>Code</th>
                            <th>Nom</th>
                            <th>Département</th>
                            <th>UFR</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                    @forelse($filieres as $filiere)

                        <tr>

                            <td>
                                <span class="badge bg-info">
                                    {{ $filiere->code ?? $filiere->getKey() }}
                                </span>
                            </td>

                            <td>
                                <strong>{{ $filiere->nom }}</strong>
                                <br>
                                <small class="text-muted">
                                    {{ $filiere->description ?? 'Filière de formation' }}
                                </small>
                            </td>

                            <td>
                                <span class="badge bg-success">
                                    {{ $filiere->departement->code ?? 'N/A' }}
                                </span>
                                <br>
                                <small>
                                    {{ $filiere->departement->nom ?? 'N/A' }}
                                </small>
                            </td>

                            <td>
                                <span class="badge bg-primary">
                                    {{ $filiere->departement->ufr->code ?? 'N/A' }}
                                </span>
                            </td>

                            <td>
                                <div class="btn-group" role="group">

                                    {{-- VOIR --}}
                                    <a href="{{ route('filiere.show', $filiere) }}"
                                       class="btn btn-sm btn-outline-primary"
                                       title="Voir">
                                        <i class="fas fa-eye"></i>
                                    </a>

                                    {{-- MODIFIER --}}
                                    <a href="{{ route('filiere.edit', $filiere) }}"
                                       class="btn btn-sm btn-outline-warning"
                                       title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>

                                    {{-- SUPPRIMER --}}
                                    <form id="deleteForm-{{ $filiere->getKey() }}"
                                          action="{{ route('filiere.destroy', $filiere) }}"
                                          method="POST"
                                          class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>

                                    <button class="btn btn-sm btn-outline-danger"
                                            title="Supprimer"
                                            onclick="confirmDelete({{ $filiere->getKey() }})">
                                        <i class="fas fa-trash"></i>
                                    </button>

                                </div>
                            </td>

                        </tr>

                    @empty

                        <tr>
                            <td colspan="5" class="text-center py-4">
                                <i class="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
                                <p class="text-muted mb-0">Aucune filière trouvée.</p>
                            </td>
                        </tr>

                    @endforelse

                    </tbody>

                </table>
            </div>

            <div class="mt-3">
                {{ $filieres->links() }}
            </div>

        </div>
    </div>

</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/filiere.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/filiere.js') }}"></script>
@endpush