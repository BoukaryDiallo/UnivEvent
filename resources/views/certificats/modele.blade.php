<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Certificat</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: {{ data_get($template ?? $certificat->template_snapshot, 'accent', '#0f172a') }}; margin: 0; }
        .page { padding: 44px; border: 16px solid {{ data_get($template ?? $certificat->template_snapshot, 'accent', '#0ea5e9') }}; min-height: 92vh; background: {{ data_get($template ?? $certificat->template_snapshot, 'background', '#fffdf7') }}; }
        .eyebrow { text-transform: uppercase; letter-spacing: 0.3em; color: #0369a1; font-size: 12px; }
        h1 { font-size: 40px; margin: 18px 0 8px; }
        .name { font-size: 32px; font-weight: 700; margin: 28px 0 12px; }
        .event { font-size: 24px; color: #0f766e; font-weight: 700; }
        .meta { margin-top: 28px; font-size: 14px; color: #475569; }
        .footer { margin-top: 40px; }
        .qr { width: 140px; height: 140px; }
    </style>
</head>
<body>
    @php($payloadData = $payload ?? ($certificat->payload ?? []))
    <div class="page">
        <div class="eyebrow">UnivEvent</div>
        <h1>{{ ucfirst(str_replace('_', ' ', $payloadData['type_certificat'] ?? 'certificat')) }}</h1>
        <p>Ce document atteste la participation de :</p>
        <div class="name">{{ $payloadData['nom'] ?? $certificat->utilisateur->name }}</div>
        <p>a l evenement</p>
        <div class="event">{{ $payloadData['titre_evenement'] ?? $certificat->evenement->titre }}</div>
        <div class="meta">
            Delivre le {{ optional($certificat->date_delivrance)->format('d/m/Y H:i') }}<br>
            Code: {{ $certificat->code_certificat }}<br>
            @if(!empty($payloadData['rang']))
                Rang: {{ $payloadData['rang'] }}<br>
            @endif
            @if(!empty($payloadData['admission']))
                Admission: {{ $payloadData['admission'] }}<br>
            @endif
            @if(!empty($payloadData['mention']))
                Mention: {{ $payloadData['mention'] }}
            @endif
        </div>
        <div class="footer">
            @if(!empty($qrCode))
                <img class="qr" src="data:image/png;base64,{{ $qrCode }}" alt="QR verification">
            @endif
            <p>Verification publique: {{ $certificat->url_verification }}</p>
        </div>
    </div>
</body>
</html>
