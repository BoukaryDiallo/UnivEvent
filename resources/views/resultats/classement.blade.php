<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Classement</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; padding: 32px; }
        h1 { margin-bottom: 4px; }
        p { color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { border-bottom: 1px solid #cbd5e1; padding: 12px; text-align: left; }
        th { background: #e0f2fe; }
    </style>
</head>
<body>
    <h1>Classement - {{ $evenement->titre }}</h1>
    <p>Export genere le {{ now()->format('d/m/Y H:i') }}</p>
    <table>
        <thead>
            <tr>
                <th>Rang</th>
                <th>Participant</th>
                <th>Role</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($resultats as $resultat)
                <tr>
                    <td>{{ $resultat->classement ?? '-' }}</td>
                    <td>{{ $resultat->utilisateur?->name ?? 'Participant' }}</td>
                    <td>{{ $resultat->utilisateur?->role ?? '-' }}</td>
                    <td>{{ $resultat->note }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
