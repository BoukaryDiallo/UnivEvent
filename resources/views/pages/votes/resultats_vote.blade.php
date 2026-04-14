@extends('layouts.app')

@section('content')
<div class="container mt-5">
    <h2 class="text-center text-success mb-4">Résultats en Temps Réel</h2>
    <canvas id="resultatsChart" height="100"></canvas>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/vote.css') }}">
@endpush

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/resultats.js') }}"></script>
@endpush
