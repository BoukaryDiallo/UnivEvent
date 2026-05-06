import { QrCode, ShieldCheck } from 'lucide-react';
import type { EventAccessPass } from '@/types';

type EventAccessPassCardProps = {
    access: EventAccessPass | null;
};

export function EventAccessPassCard({ access }: EventAccessPassCardProps) {
    if (!access) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Votre QR d acces apparaitra des que votre participation sera enregistree.
            </div>
        );
    }

    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <QrCode className="size-4" />
                QR Code d acces
            </div>
            <div className="mt-4 flex flex-col items-center gap-4 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                <img src={access.qr_url} alt="QR code d acces" className="size-44 rounded-2xl bg-white p-2" />
                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Token: <span className="font-semibold text-slate-700 dark:text-slate-200">{access.token.slice(0, 12)}...</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <ShieldCheck className="size-3.5" />
                    {access.checked_in_at ? 'Check-in effectue' : 'Pret pour le scan'}
                </div>
            </div>
        </div>
    );
}
