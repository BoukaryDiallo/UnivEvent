<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Controle d acces</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #020617;
            --card: #ffffff;
            --muted: #475569;
            --text: #0f172a;
            --line: #e2e8f0;
            --good-bg: #ecfdf5;
            --good-text: #047857;
            --warn-bg: #fff7ed;
            --warn-text: #c2410c;
            --accent: #0f172a;
        }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background:
                radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 28%),
                linear-gradient(135deg, #020617 0%, #0f172a 42%, #164e63 100%);
            color: var(--text);
            padding: 24px;
        }

        .shell {
            max-width: 1080px;
            margin: 0 auto;
            display: grid;
            gap: 24px;
        }

        .hero, .panel {
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(226, 232, 240, 0.85);
            border-radius: 28px;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
        }

        .hero { padding: 28px; }
        .panel { padding: 24px; }

        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: .12em;
            text-transform: uppercase;
        }

        h1 {
            margin: 16px 0 8px;
            font-size: clamp(30px, 4vw, 44px);
            line-height: 1.1;
        }

        p { color: var(--muted); line-height: 1.6; }

        .grid {
            display: grid;
            gap: 24px;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }

        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 14px;
        }

        .status.good {
            background: var(--good-bg);
            color: var(--good-text);
        }

        .status.warn {
            background: var(--warn-bg);
            color: var(--warn-text);
        }

        .meta {
            display: grid;
            gap: 12px;
            margin-top: 18px;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-radius: 18px;
            background: #f8fafc;
            padding: 14px 16px;
        }

        .meta-row strong {
            display: block;
            color: var(--text);
            font-size: 15px;
        }

        .meta-row span {
            color: var(--muted);
            font-size: 13px;
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 46px;
            padding: 0 18px;
            border: 0;
            border-radius: 999px;
            background: var(--accent);
            color: white;
            text-decoration: none;
            font-weight: 700;
            cursor: pointer;
        }

        .button.secondary {
            background: #e2e8f0;
            color: var(--text);
        }

        .alert {
            margin-top: 16px;
            border-radius: 18px;
            padding: 14px 16px;
            font-size: 14px;
        }

        .alert.success {
            background: var(--good-bg);
            color: var(--good-text);
        }

        .alert.info {
            background: #eff6ff;
            color: #1d4ed8;
        }

        @media (max-width: 640px) {
            body { padding: 16px; }
            .hero, .panel { padding: 20px; }
            .meta-row { flex-direction: column; }
            .actions > * { width: 100%; }
            .button { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="shell">
        <section class="hero">
            <div class="eyebrow">Controle d acces</div>
            <h1>{{ $inscription->utilisateur?->name ?? 'Participant' }}</h1>
            <p>
                Fiche de scan pour <strong>{{ $inscription->evenement?->titre ?? 'Evenement' }}</strong>.
                L interface met en avant le statut du check-in pour une validation plus rapide cote accueil.
            </p>

            @if (session('status') === 'checked-in')
                <div class="alert success">Le check-in a ete valide avec succes.</div>
            @elseif (session('status') === 'already-checked-in')
                <div class="alert info">Ce participant a deja ete scanne auparavant.</div>
            @endif
        </section>

        <div class="grid">
            <section class="panel">
                <div class="status {{ $inscription->checked_in_at ? 'good' : 'warn' }}">
                    {{ $inscription->checked_in_at ? 'Check-in deja effectue' : 'En attente de validation' }}
                </div>

                <div class="meta">
                    <div class="meta-row">
                        <div>
                            <span>Evenement</span>
                            <strong>{{ $inscription->evenement?->titre ?? 'Non renseigne' }}</strong>
                        </div>
                        <div>
                            <span>Statut d inscription</span>
                            <strong>{{ ucfirst(str_replace('_', ' ', $inscription->statut)) }}</strong>
                        </div>
                    </div>
                    <div class="meta-row">
                        <div>
                            <span>Participant</span>
                            <strong>{{ $inscription->utilisateur?->name ?? 'Utilisateur inconnu' }}</strong>
                        </div>
                        <div>
                            <span>Email</span>
                            <strong>{{ $inscription->utilisateur?->email ?? 'Non renseigne' }}</strong>
                        </div>
                    </div>
                    <div class="meta-row">
                        <div>
                            <span>Role</span>
                            <strong>{{ $inscription->utilisateur?->role ?? 'N/A' }}</strong>
                        </div>
                        <div>
                            <span>Dernier passage</span>
                            <strong>{{ $inscription->checked_in_at ? $inscription->checked_in_at->format('d/m/Y H:i') : 'Pas encore scanne' }}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section class="panel">
                <h2 style="margin:0 0 8px;">Actions admin</h2>
                <p style="margin-top:0;">
                    Les administrateurs et organisateurs peuvent valider le passage ou revenir vers le scanner pour enchainer les controles.
                </p>

                <div class="actions">
                    @if ($canManage)
                        <form method="POST" action="{{ route('acces.checkIn', $inscription->access_token) }}">
                            @csrf
                            <button class="button" type="submit" {{ $inscription->checked_in_at ? 'disabled' : '' }}>
                                {{ $inscription->checked_in_at ? 'Deja valide' : 'Valider le check-in' }}
                            </button>
                        </form>

                        <a class="button secondary" href="{{ route('acces.admin', ['target' => route('acces.scan', $inscription->access_token)]) }}">
                            Retour au scanner admin
                        </a>
                    @else
                        <div class="alert info">
                            Connectez-vous avec un compte administrateur ou organisateur pour confirmer le check-in.
                        </div>
                    @endif

                    @if ($inscription->evenement)
                        <a class="button secondary" href="{{ route('evenements.show', $inscription->evenement) }}">
                            Ouvrir la fiche evenement
                        </a>
                    @endif
                </div>
            </section>
        </div>
    </div>
</body>
</html>
