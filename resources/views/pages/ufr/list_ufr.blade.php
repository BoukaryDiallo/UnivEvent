@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Liste des UFR</h2>
                <a href="{{ route('ufr.create') }}" class="btn btn-primary">
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
                                    <th>Code</th>
                                    <th>Nom</th>
                                    <th>Responsable</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="badge bg-primary">UFR-SCI</span></td>
                                    <td>
                                        <strong>Sciences et Technologies</strong>
                                        <br>
                                        <small class="text-muted">Formation scientifique et technologique</small>
                                    </td>
                                    <td>Prof. Jean Kaboré</td>
                                    <td>sciences@univ-event.bf</td>
                                    <td>+226 25 30 45 67</td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('ufr.show', 1) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('ufr.edit', 1) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(1)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-primary">UFR-LET</span></td>
                                    <td>
                                        <strong>Lettres, Langues et Arts</strong>
                                        <br>
                                        <small class="text-muted">Formation en lettres et arts</small>
                                    </td>
                                    <td>Dr. Amina Traoré</td>
                                    <td>lettres@univ-event.bf</td>
                                    <td>+226 25 30 45 68</td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('ufr.show', 2) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('ufr.edit', 2) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(2)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-primary">UFR-DROIT</span></td>
                                    <td>
                                        <strong>Droit et Sciences Politiques</strong>
                                        <br>
                                        <small class="text-muted">Formation juridique et politique</small>
                                    </td>
                                    <td>Prof. Moussa Ouédraogo</td>
                                    <td>droit@univ-event.bf</td>
                                    <td>+226 25 30 45 69</td>
                                    <td><span class="badge bg-warning">Inactif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('ufr.show', 3) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('ufr.edit', 3) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(3)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <nav aria-label="Pagination UFR">
                        <ul class="pagination justify-content-center">
                            <li class="page-item disabled">
                                <a class="page-link" href="#" tabindex="-1">Précédent</a>
                            </li>
                            <li class="page-item active"><a class="page-link" href="#">1</a></li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link" href="#">Suivant</a>
                            </li>
                        </ul>
                    </nav>
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
