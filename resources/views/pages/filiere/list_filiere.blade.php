@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Liste des Filières</h2>
                <a href="{{ route('filiere.create') }}" class="btn btn-info">
                    <i class="fas fa-plus me-2"></i>Nouvelle Filière
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
                                <i class="fas fa-graduation-cap me-2"></i>Filières de formation
                            </h5>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Rechercher une filière..." id="searchFiliere">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="filiereTable">
                            <thead class="table-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Nom</th>
                                    <th>Département</th>
                                    <th>UFR</th>
                                    <th>Niveau</th>
                                    <th>Capacité</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="badge bg-info">FIL-GL</span></td>
                                    <td>
                                        <strong>Génie Logiciel</strong>
                                        <br>
                                        <small class="text-muted">Développement et conception logicielle</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-success">DPT-INF</span>
                                        <br>
                                        <small>Informatique</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                    </td>
                                    <td><span class="badge bg-warning">Licence - Master</span></td>
                                    <td><span class="badge bg-secondary">150</span></td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('filiere.show', 1) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('filiere.edit', 1) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(1)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-info">FIL-RS</span></td>
                                    <td>
                                        <strong>Réseaux et Sécurité</strong>
                                        <br>
                                        <small class="text-muted">Administration et sécurité des réseaux</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-success">DPT-INF</span>
                                        <br>
                                        <small>Informatique</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                    </td>
                                    <td><span class="badge bg-warning">Licence - Master</span></td>
                                    <td><span class="badge bg-secondary">120</span></td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('filiere.show', 2) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('filiere.edit', 2) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(2)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-info">FIL-IA</span></td>
                                    <td>
                                        <strong>Intelligence Artificielle</strong>
                                        <br>
                                        <small class="text-muted">Machine Learning et Deep Learning</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-success">DPT-INF</span>
                                        <br>
                                        <small>Informatique</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                    </td>
                                    <td><span class="badge bg-warning">Master</span></td>
                                    <td><span class="badge bg-secondary">80</span></td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('filiere.show', 3) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('filiere.edit', 3) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(3)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-info">FIL-MATH</span></td>
                                    <td>
                                        <strong>Mathématiques Appliquées</strong>
                                        <br>
                                        <small class="text-muted">Modélisation et calcul scientifique</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-success">DPT-MATH</span>
                                        <br>
                                        <small>Mathématiques</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                    </td>
                                    <td><span class="badge bg-warning">Licence - Master</span></td>
                                    <td><span class="badge bg-secondary">100</span></td>
                                    <td><span class="badge bg-warning">Inactif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('filiere.show', 4) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('filiere.edit', 4) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(4)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <nav aria-label="Pagination Filière">
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
<link rel="stylesheet" href="{{ asset('css/filiere.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/filiere.js') }}"></script>
@endpush
