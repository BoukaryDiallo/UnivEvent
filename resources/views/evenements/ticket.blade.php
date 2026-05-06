<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket d'inscription</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; }
        .ticket { border: 2px solid #e2e8f0; border-radius: 20px; overflow: hidden; max-width: 600px; margin: 0 auto; }
        .header { background: #4f46e5; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px; text-align: center; }
        .qr-section { margin: 30px 0; }
        .event-info { margin-top: 30px; border-top: 1px solid #f1f5f9; pt: 20px; }
        .label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #94a3b8; letter-spacing: 0.1em; }
        .value { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .footer { background: #f8fafc; padding: 20px; font-size: 12px; text-align: center; color: #64748b; }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Ticket d'accès</h1>
            <p style="margin: 5px 0 0; opacity: 0.8;">UnivEvent - Badge officiel</p>
        </div>
        <div class="content">
            <div class="label">Participant</div>
            <div class="value">{{ $inscription->utilisateur->name }}</div>

            <div class="qr-section">
                <img src="data:image/png;base64,{{ $qrCode }}" width="200" height="200">
            </div>

            <div class="event-info">
                <div class="label">Événement</div>
                <div class="value">{{ $inscription->evenement->titre }}</div>
                
                <div style="display: table; width: 100%;">
                    <div style="display: table-cell; width: 50%;">
                        <div class="label">Date</div>
                        <div class="value">{{ $inscription->evenement->date_debut->format('d/m/Y') }}</div>
                    </div>
                    <div style="display: table-cell; width: 50%;">
                        <div class="label">Heure</div>
                        <div class="value">{{ $inscription->evenement->date_debut->format('H:i') }}</div>
                    </div>
                </div>

                <div class="label">Lieu</div>
                <div class="value">{{ $inscription->evenement->lieu ?: 'À confirmer' }}</div>
            </div>
        </div>
        <div class="footer">
            Veuillez présenter ce ticket (numérique ou imprimé) à l'entrée de l'événement.<br>
            Code: {{ $inscription->access_token }}
        </div>
    </div>
</body>
</html>
