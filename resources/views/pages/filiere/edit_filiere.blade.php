@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h3">Modifier la Filière</h2>
                <a href="{{ route('filiere.show', $filiere->id) }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Retour
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8 mx-auto">
            <div class="card shadow">
                <div class="card-header bg-warning text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-edit me-2"></i>Modifier les informations de la Filière
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST" action="{{ route('filiere.update', $filiere->id) }}">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="nom" class="form-label">Nom de la Filière <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('nom') is-invalid @enderror" 
                                       id="nom" name="nom" value="Génie Logiciel" required>
                                @error('nom')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="code" class="form-label">Code Filière <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('code') is-invalid @enderror" 
                                       id="code" name="code" value="FIL-GL" required>
                                @error('code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="ufr_id" class="form-label">UFR <span class="text-danger">*</span></label>
                                <select class="form-select @error('ufr_id') is-invalid @enderror" id="ufr_id" name="ufr_id" required>
                                    <option value="">Sélectionner un UFR</option>
                                    <option value="1" selected>UFR-SCI - Sciences et Technologies</option>
                                    <option value="2">UFR-LET - Lettres, Langues et Arts</option>
                                    <option value="3">UFR-DROIT - Droit et Sciences Politiques</option>
                                </select>
                                @error('ufr_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="departement_id" class="form-label">Département <span class="text-danger">*</span></label>
                                <select class="form-select @error('departement_id') is-invalid @enderror" id="departement_id" name="departement_id" required>
                                    <option value="">Sélectionner un département</option>
                                    <option value="1" selected>DPT-INF - Informatique</option>
                                    <option value="2">DPT-MATH - Mathématiques</option>
                                    <option value="3">DPT-PHYS - Physique-Chimie</option>
                                </select>
                                @error('departement_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" 
                                      id="description" name="description" rows="4">La filière Génie Logiciel forme des experts en conception, développement et maintenance de systèmes logiciels complexes. Le programme couvre l'analyse des besoins, l'architecture logicielle, les méthodes agiles, le test et la qualité logicielle.</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="niveau" class="form-label">Niveau <span class="text-danger">*</span></label>
                                <select class="form-select @error('niveau') is-invalid @enderror" id="niveau" name="niveau" required>
                                    <option value="">Sélectionner un niveau</option>
                                    <option value="licence">Licence</option>
                                    <option value="master">Master</option>
                                    <option value="doctorat">Doctorat</option>
                                    <option value="licence_master" selected>Licence - Master</option>
                                </select>
                                @error('niveau')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="responsable" class="form-label">Responsable de filière</label>
                                <input type="text" class="form-control @error('responsable') is-invalid @enderror" 
                                       id="responsable" name="responsable" value="Dr. Aminata Bamba">
                                @error('responsable')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="duree" class="form-label">Durée (années)</label>
                                <input type="number" class="form-control @error('duree') is-invalid @enderror" 
                                       id="duree" name="duree" value="5" min="1" max="10">
                                @error('duree')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="capacite" class="form-label">Capacité d'accueil</label>
                                <input type="number" class="form-control @error('capacite') is-invalid @enderror" 
                                       id="capacite" name="capacite" value="150" min="1">
                                @error('capacite')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="conditions_admission" class="form-label">Conditions d'admission</label>
                            <textarea class="form-control @error('conditions_admission') is-invalid @enderror" 
                                      id="conditions_admission" name="conditions_admission" rows="3">Baccalauréat série S ou équivalent
Bonne maîtrise des mathématiques
Connaissances de base en programmation
Test d'aptitude et entretien</textarea>
                            @error('conditions_admission')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="actif" name="actif" value="1" checked>
                                <label class="form-check-label" for="actif">
                                    Filière active
                                </label>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ route('filiere.show', $filiere->id) }}" class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>Annuler
                            </a>
                            <button type="submit" class="btn btn-warning">
                                <i class="fas fa-save me-2"></i>Mettre à jour
                            </button>
                        </div>
                    </form>
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
