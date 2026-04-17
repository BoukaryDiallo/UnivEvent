@extends('layouts.app')

@section('content')
<div class="container mt-4">

    <div class="card shadow-sm">
        <div class="card-header bg-dark text-white">
            <h5>Résultats officiels - {{ $election->title }}</h5>
        </div>

        <div class="card-body">

            @if($finalResults)

                @foreach($finalResults as $result)
                    <div class="mb-3 p-2 border rounded
                        {{ $result->isWinner ? 'border-success bg-light' : '' }}">

                        <div class="d-flex align-items-center">

                            <img src="{{ asset('storage/' . $result->photo) }}"
                                 class="rounded-circle me-2"
                                 width="40" height="40">

                            <div class="flex-grow-1">

                                <strong>
                                    {{ $result->name }}
                                </strong>

                                @if($result->isWinner)
                                    <span class="badge bg-success ms-2">
                                        GAGNANT
                                    </span>
                                @endif

                                <div class="progress mt-2">
                                    <div class="progress-bar bg-success"
                                         style="width: {{ $result->percentage }}%">
                                        {{ $result->votes }} votes
                                        ({{ $result->percentage }}%)
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                @endforeach

                <div class="text-center mt-4">
                    <p>Total votes : <strong>{{ $election->votes_count }}</strong></p>
                    <span class="badge bg-secondary">Vote terminé</span>
                </div>

            @else
                <p class="text-muted">
                    Résultats disponibles après dépouillement.
                </p>
            @endif

        </div>
    </div>

</div>
@endsection