@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Liste des Départements</h2>
                <a href="{{ route('departement.create') }}" class="btn btn-success">
                    <i class="fas fa-plus me-2"></i>Nouveau Département
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
                                <i class="fas fa-building me-2"></i>Départements
                            </h5>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Rechercher un département..." id="searchDepartement">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="departementTable">
                            <thead class="table-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Nom</th>
                                    <th>UFR</th>
                                    <th>Chef de département</th>
                                    <th>Email</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="badge bg-success">DPT-INF</span></td>
                                    <td>
                                        <strong>Informatique</strong>
                                        <br>
                                        <small class="text-muted">Technologies de l'information</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                        <br>
                                        <small>Sciences et Technologies</small>
                                    </td>
                                    <td>Dr. Paul Ouattara</td>
                                    <td>informatique@univ-event.bf</td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('departement.show', 1) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('departement.edit', 1) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(1)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-success">DPT-MATH</span></td>
                                    <td>
                                        <strong>Mathématiques</strong>
                                        <br>
                                        <small class="text-muted">Sciences mathématiques</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                        <br>
                                        <small>Sciences et Technologies</small>
                                    </td>
                                    <td>Prof. Marie Konaté</td>
                                    <td>mathematiques@univ-event.bf</td>
                                    <td><span class="badge bg-success">Actif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('departement.show', 2) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('departement.edit', 2) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-danger" title="Supprimer" onclick="confirmDelete(2)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><span class="badge bg-success">DPT-PHYS</span></td>
                                    <td>
                                        <strong>Physique-Chimie</strong>
                                        <br>
                                        <small class="text-muted">Sciences physiques</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">UFR-SCI</span>
                                        <br>
                                        <small>Sciences et Technologies</small>
                                    </td>
                                    <td>Dr. Boubacar Diallo</td>
                                    <td>physique@univ-event.bf</td>
                                    <td><span class="badge bg-warning">Inactif</span></td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('departement.show', 3) }}" class="btn btn-sm btn-outline-primary" title="Voir">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('departement.edit', 3) }}" class="btn btn-sm btn-outline-warning" title="Modifier">
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
                    
                    <nav aria-label="Pagination Département">
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
<link rel="stylesheet" href="{{ asset('css/departement.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/departement.js') }}"></script>
@endpush
