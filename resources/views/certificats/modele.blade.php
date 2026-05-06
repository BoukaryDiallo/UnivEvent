<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificat de Réussite</title>
    <style>
        @page { margin: 0; size: A4 landscape; }
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 0; background: {{ $template['background'] ?? '#fff' }}; }
        .border-outer { border: 15px solid {{ $template['accent'] ?? '#0f172a' }}; height: 100vh; padding: 30px; box-sizing: border-box; position: relative; }
        .border-inner { border: 2px solid {{ $template['accent'] ?? '#0f172a' }}; height: 100%; padding: 40px; box-sizing: border-box; position: relative; text-align: center; }
        
        .header { margin-top: 20px; }
        .certificate-title { font-size: 48px; font-weight: 900; color: {{ $template['accent'] ?? '#0f172a' }}; text-transform: uppercase; letter-spacing: 0.1em; }
        .label { font-size: 14px; text-transform: uppercase; color: #64748b; margin: 30px 0 10px; font-weight: bold; letter-spacing: 0.2em; }
        .name { font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 5px; }
        .description { font-size: 16px; color: #475569; max-width: 600px; margin: 20px auto; line-height: 1.6; }
        
        .event-details { margin-top: 40px; display: table; width: 100%; }
        .detail-box { display: table-cell; width: 33%; text-align: center; vertical-align: top; }
        .detail-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 900; }
        .detail-value { font-size: 14px; font-weight: bold; color: #1e293b; }

        .qr-codes { position: absolute; bottom: 60px; width: 100%; left: 0; padding: 0 60px; box-sizing: border-box; }
        .qr-box { float: left; text-align: left; }
        .qr-box.right { float: right; text-align: right; }
        .qr-caption { font-size: 8px; font-weight: bold; text-transform: uppercase; margin-top: 5px; color: #94a3b8; }

        .footer-info { position: absolute; bottom: 40px; width: 100%; left: 0; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="border-outer">
        <div class="border-inner">
            <div class="header">
                <div class="certificate-title">{{ $payload['label_certificat'] ?? 'Certificat' }}</div>
            </div>

            <div class="label">Décerné à</div>
            <div class="name">{{ $payload['nom_complet'] }}</div>
            <div style="width: 200px; height: 2px; background: {{ $template['accent'] ?? '#0f172a' }}; margin: 5px auto 30px;"></div>

            <div class="description">
                Pour sa participation active et sa contribution exceptionnelle lors de l'événement 
                <span style="font-weight: bold; color: {{ $template['accent'] ?? '#0f172a' }}; text-transform: uppercase;">"{{ $payload['titre_evenement'] }}"</span>, 
                tenu le {{ $payload['date_evenement'] }} à {{ $payload['lieu'] }}.
            </div>

            @if(isset($payload['rang']))
                <div style="margin-top: 20px;">
                    <span style="background: {{ $template['accent'] ?? '#0f172a' }}; color: white; padding: 8px 20px; border-radius: 10px; font-weight: 900; text-transform: uppercase; font-size: 12px;">
                        Classement : {{ $payload['rang'] }}{{ $payload['rang'] == 1 ? 'er' : 'ème' }}
                        @if(isset($payload['mention'])) - Mention {{ $payload['mention'] }} @endif
                    </span>
                </div>
            @endif

            <div class="event-details">
                <div class="detail-box">
                    <div class="detail-label">Organisateur</div>
                    <div class="detail-value">{{ $payload['organisateur'] }}</div>
                </div>
                <div class="detail-box">
                    <div class="detail-label">Délivré le</div>
                    <div class="detail-value">{{ date('d/m/Y') }}</div>
                </div>
                <div class="detail-box">
                    <div class="detail-label">Réf. Série</div>
                    <div class="detail-value">{{ $certificat->code_certificat }}</div>
                </div>
            </div>

            <div class="qr-codes">
                <div class="qr-box">
                    <img src="data:image/png;base64,{{ $qrCode }}" width="70" height="70">
                    <div class="qr-caption">Vérifier l'authenticité</div>
                </div>
                <div class="qr-box right">
                    <img src="data:image/png;base64,{{ $registrationQr }}" width="70" height="70">
                    <div class="qr-caption">Preuve d'inscription</div>
                </div>
            </div>

            <div class="footer-info">
                Document officiel généré par UnivEvent. Vérification en ligne disponible via le QR code de gauche.
            </div>
        </div>
    </div>
</body>
</html>
