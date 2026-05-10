import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type EventToastProps = {
    message: string | null;
    tone?: 'success' | 'error';
};

export function EventToast({ message, tone = 'success' }: EventToastProps) {
    if (!message) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur',
                tone === 'success'
                    ? 'border-emerald-200 bg-white/95 text-emerald-700 shadow-emerald-100 dark:border-emerald-900/70 dark:bg-slate-950/95 dark:text-emerald-200 dark:shadow-black/20'
                    : 'border-rose-200 bg-white/95 text-rose-700 shadow-rose-100 dark:border-rose-900/70 dark:bg-slate-950/95 dark:text-rose-200 dark:shadow-black/20',
            )}
            role="status"
            aria-live="polite"
        >
            {tone === 'success' ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
            {message}
        </div>
    );
}
