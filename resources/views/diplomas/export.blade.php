@php
    /** @var \App\Models\DiplomaRequest $request */
@endphp
<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Dossier {{ $request->tracking_code }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 16px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
        .muted { color: #666; }
        .meta { margin-bottom: 16px; }
        .meta div { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e5e5; }
        th { background: #f3f3f3; font-size: 11px; text-transform: uppercase; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #eee; font-size: 11px; }
        .footer { margin-top: 24px; font-size: 10px; color: #888; }
    </style>
</head>
<body>
    <h1>Dossier de retrait — {{ $request->tracking_code }}</h1>
    <div class="muted">Université Joseph KI–ZERBO · Service de la scolarité</div>

    <div class="meta">
        <div><strong>Étudiant :</strong> {{ $request->owner->name }} ({{ $request->owner->email }})</div>
        <div><strong>Diplôme :</strong> {{ ucfirst($request->diploma_type) }} · Année {{ $request->academic_year }}</div>
        <div>
            <strong>Statut :</strong>
            <span class="status">{{ $request->status->label() }}</span>
        </div>
        @if ($request->submitted_at)
            <div><strong>Date de soumission :</strong> {{ $request->submitted_at->format('d/m/Y H:i') }}</div>
        @endif
        @if ($request->status === \App\Enums\DiplomaRequestStatus::Rejected && $request->rejected_reason)
            <div><strong>Motif de rejet :</strong> {{ $request->rejected_reason }}</div>
        @endif
        @if ($request->archived_at)
            <div><strong>Archivé le :</strong> {{ $request->archived_at->format('d/m/Y H:i') }}</div>
        @endif
    </div>

    <h2>Pièces du dossier</h2>
    @if ($request->documents->isEmpty())
        <p class="muted">Aucune pièce.</p>
    @else
        <table>
            <thead>
                <tr><th>Type</th><th>Fichier</th><th>Validation</th></tr>
            </thead>
            <tbody>
                @foreach ($request->documents as $doc)
                    <tr>
                        <td>{{ $doc->type->label() }}</td>
                        <td>{{ $doc->original_name }}</td>
                        <td>
                            @if ($doc->validated_at)
                                Validée le {{ $doc->validated_at->format('d/m/Y') }}
                            @else
                                En attente
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if ($request->appointment)
        <h2>Rendez-vous de retrait</h2>
        <div>
            <strong>{{ $request->appointment->pickupSlot->starts_at->format('l d F Y H\hi') }}</strong>
            — {{ $request->appointment->pickupSlot->location }}
        </div>
        @if ($request->appointment->delivered_at)
            <div class="muted">
                Diplôme remis le {{ $request->appointment->delivered_at->format('d/m/Y H:i') }}.
            </div>
        @endif
    @endif

    <h2>Historique</h2>
    @if ($request->events->isEmpty())
        <p class="muted">Aucun évènement.</p>
    @else
        <table>
            <thead>
                <tr><th>Date</th><th>Statut</th><th>Acteur</th><th>Note</th></tr>
            </thead>
            <tbody>
                @foreach ($request->events->sortBy('occurred_at') as $event)
                    <tr>
                        <td>{{ $event->occurred_at->format('d/m/Y H:i') }}</td>
                        <td>{{ $event->to_status->label() }}</td>
                        <td>{{ $event->actor?->name ?? '—' }}</td>
                        <td>{{ $event->note ?? '' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        Document généré le {{ now()->format('d/m/Y H:i') }} — UnivEvent · Module Retraits de diplômes.
    </div>
</body>
</html>
