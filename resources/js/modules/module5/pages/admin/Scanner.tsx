import { Head } from '@inertiajs/react';
import { Camera, CheckCircle2, QrCode, ScanLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminScannerProps = {
    scanTarget?: string;
};

type BarcodeDetectorLike = {
    detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
    interface Window {
        BarcodeDetector?: {
            new (): BarcodeDetectorLike;
            getSupportedFormats?: () => Promise<string[]>;
        };
    }
}

function extractToken(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const directMatch = trimmed.match(/\/acces\/([A-Za-z0-9-]+)/i);

    if (directMatch?.[1]) {
        return directMatch[1];
    }

    const tokenMatch = trimmed.match(/^[A-Za-z0-9-]{16,}$/);

    return tokenMatch?.[0] ?? null;
}

export default function AdminScanner({ scanTarget = '' }: AdminScannerProps) {
    const [rawValue, setRawValue] = useState(scanTarget);
    const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'unsupported'>('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);

    const token = useMemo(() => extractToken(rawValue), [rawValue]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Scanner QR', href: '/admin/scanner-acces' },
    ];

    useEffect(() => {
        let intervalId: number | null = null;
        let stream: MediaStream | null = null;
        let mounted = true;

        const start = async () => {
            if (!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
                setStatus('unsupported');

                return;
            }

            const video = document.getElementById('scanner-video') as HTMLVideoElement | null;
            const canvas = document.getElementById('scanner-canvas') as HTMLCanvasElement | null;

            if (!video || !canvas) {
                return;
            }

            try {
                setStatus('starting');
                setCameraError(null);

                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false,
                });

                if (!mounted) {
                    return;
                }

                video.srcObject = stream;
                await video.play();

                const detector = new window.BarcodeDetector();
                const context = canvas.getContext('2d');

                setStatus('scanning');

                intervalId = window.setInterval(async () => {
                    if (!context || video.readyState < 2) {
                        return;
                    }

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const codes = await detector.detect(canvas);
                    const candidate = codes.find((code) => extractToken(code.rawValue ?? ''));

                    if (candidate?.rawValue) {
                        setRawValue(candidate.rawValue);
                    }
                }, 900);
            } catch {
                setCameraError("Impossible d activer la camera sur cet appareil.");
                setStatus('unsupported');
            }
        };

        void start();

        return () => {
            mounted = false;

            if (intervalId) {
                window.clearInterval(intervalId);
            }

            stream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Scanner QR admin" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(8,47,73,0.96)_55%,_rgba(14,116,144,0.86))] p-6 text-white shadow-xl shadow-slate-200/70 dark:shadow-black/20">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                <ScanLine className="size-3.5" />
                                Controle d acces
                            </div>
                            <h1 className="text-3xl font-semibold sm:text-4xl">Scanner un QR participant avec une interface admin plus directe.</h1>
                            <p className="max-w-2xl text-sm leading-7 text-cyan-50/88 sm:text-base">
                                Ouvrez la camera si le navigateur le permet, ou collez l URL / le token du QR pour acceder immediatement a la fiche de check-in.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                                <Camera className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Detection camera</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {status === 'scanning'
                                        ? 'La camera est active. Placez le QR dans le cadre.'
                                        : status === 'starting'
                                          ? 'Activation de la camera en cours...'
                                          : 'Si la camera n est pas disponible, utilisez le collage manuel.'}
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 dark:border-slate-800">
                            <video id="scanner-video" className="aspect-[4/3] w-full object-cover opacity-90" muted playsInline />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-56 w-56 rounded-[2rem] border-2 border-emerald-300/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.28)]" />
                            </div>
                        </div>

                        <canvas id="scanner-canvas" className="hidden" />

                        {cameraError ? (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                                {cameraError}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300">
                                    <QrCode className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Ouverture rapide</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Collez l URL du QR ou le token brut. Le systeme extrait le jeton automatiquement.
                                    </p>
                                </div>
                            </div>

                            <label htmlFor="scan-target" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                URL ou token scanne
                            </label>
                            <textarea
                                id="scan-target"
                                value={rawValue}
                                onChange={(event) => setRawValue(event.target.value)}
                                rows={5}
                                className="mt-2 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500"
                                placeholder="https://votre-app.test/acces/uuid... ou directement le token"
                            />

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    disabled={!token}
                                    className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs bg-gray-900"
                                    onClick={() => {
                                        if (!token) {
                                            return;
                                        }

                                        const url = `/acces/${token}${scanTarget ? `?target=${scanTarget}` : ''}`;
                                        window.location.href = url;
                                    }}
                                >
                                    Ouvrir la fiche de check-in
                                </Button>
                                {token ? (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                                        <CheckCircle2 className="size-3.5" />
                                        Token detecte
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Conseils d usage</h3>
                            <div className="mt-4 grid gap-3">
                                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    Utilisez cette page sur smartphone ou tablette pour enchaîner les scans plus vite.
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    Un QR deja valide reste consultable et l interface le signalera clairement.
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    Les organisateurs et administrateurs peuvent utiliser le meme lien sans changer de flux.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
