@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Liste des UFR</h2>
                <a href="{{ route('ufr.create') }}" class="btn btn-success">
                    <i class="fas fa-plus me-2"></i>Nouvel UFR
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card shadow">
                <div class="card-header bg-white">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h5 class="mb-0">
                                <i class="fas fa-university me-2"></i>Unités de Formation et de Recherche
                            </h5>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Rechercher un UFR..." id="searchUfr">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="ufrTable">
                            <thead class="table-light">
                                <tr>
                                    <th>Nom</th>
                                    <th>Nb Départements</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
<tbody>
@forelse($ufrs as $ufr)
    <tr>
        <td>
            <strong>{{ $ufr->nom }}</strong>
        </td>
        <td>
            <span class="badge bg-success">{{ $ufr->departements_count ?? 0 }}</span>
        </td>
        <td>
            <div class="btn-group" role="group">
                <a href="{{ route('ufr.show', $ufr) }}" class="btn btn-sm btn-outline-success" title="Voir">
                    <i class="fas fa-eye"></i>
                </a>
                <a href="{{ route('ufr.edit', $ufr) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                    <i class="fas fa-edit"></i>
                </a>
                <form id="deleteForm-{{ $ufr->id_ufr }}" action="{{ route('ufr.destroy', $ufr) }}" method="POST" class="d-none">
                    @csrf
                    @method('DELETE')
                </form>
                <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete({{ $ufr->id_ufr }})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
@empty
    <tr>
        <td colspan="7" class="text-center py-4">
            <i class="fas fa-university fa-3x text-muted mb-3"></i>
            <p class="text-muted mb-0">Aucun UFR trouvé.</p>
        </td>
    </tr>
@endforelse
</tbody>
                        </table>
                    </div>
                    
                    {{ $ufrs->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/ufr.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/ufr.js') }}"></script>
@endpush
