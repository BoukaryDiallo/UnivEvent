<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Verification certificat</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 32px; }
        .card { max-width: 720px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(15, 23, 42, .08); }
        .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 8px 12px; border-radius: 999px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">Certificat verifie</div>
        <h1>{{ $certificat->utilisateur->name }}</h1>
        <p>Ce certificat est associe a l evenement <strong>{{ $certificat->evenement->titre }}</strong>.</p>
        <p>Code: {{ $certificat->code_certificat }}</p>
        <p>Statut: {{ $certificat->statut }}</p>
        <p>Date de delivrance: {{ optional($certificat->date_delivrance)->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>
