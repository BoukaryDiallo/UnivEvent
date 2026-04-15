@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-success fw-bold">Liste des Étudiants</h2>

        <a href="{{ route('etudiants.create') }}" class="btn btn-success">
            <i class="bi bi-plus-circle me-1"></i> Ajouter un étudiant
        </a>
    </div>

    <!-- SEARCH + SORT -->
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="text" id="searchInput" class="form-control"
                   placeholder="Rechercher par nom ou INE...">
        </div>

        <div class="col-md-6">
            <select id="sortSelect" class="form-select">
                <option value="">Trier par...</option>
                <option value="nom">Nom</option>
                <option value="filiere">Filière</option>
                <option value="niveau">Niveau</option>
                <option value="date_naissance">Date de naissance</option>
            </select>
        </div>
    </div>

    <!-- TABLE -->
    <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle shadow-sm">

            <thead class="table-success">
                <tr>
                    <th>INE</th>
                    <th>Nom</th>
                    <th>UFR</th>
                    <th>Département</th>
                    <th>Filière</th>
                    <th>Niveau</th>
                    <th>Date de naissance</th>
                    <th>Photo</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                @forelse($etudiants as $etudiant)
                    <tr>

                        <td class="fw-semibold">{{ $etudiant->INE }}</td>

                        <td>{{ $etudiant->user->name ?? 'N/A' }}</td>

                        <td>{{ $etudiant->ufr->nom ?? 'N/A' }}</td>

                        <td>{{ $etudiant->departement->nom ?? 'N/A' }}</td>

                        <td>{{ $etudiant->filiere->nom ?? 'N/A' }}</td>

                        <td>
                            <span class="badge bg-info text-dark">
                                {{ $etudiant->niveau }}
                            </span>
                        </td>

                        <td>
                            {{ $etudiant->date_naissance
                                ? \Carbon\Carbon::parse($etudiant->date_naissance)->format('d/m/Y')
                                : 'N/A' }}
                        </td>

                        <td>
                            @if($etudiant->photo)
                                <img src="{{ asset('storage/'.$etudiant->photo) }}"
                                     width="45" height="45"
                                     class="rounded-circle border">
                            @endif
                        </td>

                        <!-- ACTIONS -->
                        <td>
                            <div class="d-flex gap-1">

                                <!-- SHOW -->
                                <a href="{{ route('etudiants.show', $etudiant) }}"
                                   class="btn btn-sm btn-outline-success"
                                   title="Voir">
                                    <i class="bi bi-eye"></i>
                                </a>

                                <!-- EDIT -->
                                <a href="{{ route('etudiants.edit', $etudiant) }}"
                                   class="btn btn-sm btn-outline-warning"
                                   title="Modifier">
                                    <i class="bi bi-pencil-square"></i>
                                </a>

                                <!-- DELETE -->
                                <form id="deleteForm-{{ $etudiant->id }}"
                                      action="{{ route('etudiants.destroy', $etudiant) }}"
                                      method="POST">
                                    @csrf
                                    @method('DELETE')

                                    <button type="button"
                                            class="btn btn-sm btn-outline-danger"
                                            title="Supprimer"
                                            onclick="confirmDelete({{ $etudiant->id }})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>

                            </div>
                        </td>

                    </tr>
                @empty
                    <tr>
                        <td colspan="9" class="text-center text-muted py-4">
                            Aucun étudiant trouvé
                        </td>
                    </tr>
                @endforelse
            </tbody>

        </table>
    </div>

</div>
@endsection