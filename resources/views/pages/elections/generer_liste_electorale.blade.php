@extends('layouts.app')

@section('content')
<div class="container mt-5">

    <div class="card shadow p-4">

        <h4 class="text-success mb-3">
            {{ $election->titre }}
        </h4>

        <p class="text-muted">
            Configuration de la liste électorale
        </p>

        <hr>

        <form method="POST" action="{{ route('elections.genererListe', $election) }}">
            @csrf

            {{-- ================= UFR ================= --}}
            @if($election->type === 'ufr')

                <div class="mb-3">
                    <label class="form-label">UFR</label>
                    <select name="id_ufr" class="form-select" required>
                        <option value="">-- Choisir UFR --</option>
                        @foreach($ufrs as $ufr)
                            <option value="{{ $ufr->id_ufr }}">
                                {{ $ufr->nom }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label">Département</label>
                    <select name="id_departement" class="form-select" required>
                        <option value="">-- Choisir département --</option>
                        @foreach($departements as $dep)
                            <option value="{{ $dep->id_departement }}">
                                {{ $dep->nom }}
                            </option>
                        @endforeach
                    </select>
                </div>

            @endif

            {{-- ================= PROMOTION ================= --}}
            @if($election->type === 'promotion')

                <div class="mb-3">
                    <label class="form-label">Filière</label>
                    <select name="id_filiere" class="form-select" required>
                        <option value="">-- Choisir filière --</option>
                        @foreach($filieres as $filiere)
                            <option value="{{ $filiere->id_filiere }}">
                                {{ $filiere->nom }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label">Niveau</label>
                    <select name="niveau" class="form-select" required>
                        <option value="">-- Choisir niveau --</option>
                        @foreach($niveaux as $key => $label)
                            <option value="{{ $key }}">
                                {{ $label }}
                            </option>
                        @endforeach
                    </select>
                </div>

            @endif

            <div class="text-end">
                <button type="submit" class="btn btn-success">
                    Générer la liste électorale
                </button>
            </div>

        </form>

    </div>
</div>
@endsection