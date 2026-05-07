import { useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type InlineEditFieldProps = {
    label: string;
    value: string;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
    onSave: (value: string) => Promise<void>;
};

export function InlineEditField({
    label,
    value,
    placeholder,
    type = 'text',
    textarea = false,
    onSave,
}: InlineEditFieldProps) {
    const [draft, setDraft] = useState(value);
    const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setDraft(value);
    }, [value]);

    useEffect(() => {
        if (draft === value) {
            return;
        }

        const timeout = window.setTimeout(async () => {
            setState('saving');
            try {
                await onSave(draft);
                setState('saved');
                window.setTimeout(() => setState('idle'), 1200);
            } catch {
                setState('idle');
            }
        }, 700);

        return () => window.clearTimeout(timeout);
    }, [draft, onSave, value]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium text-slate-700">{label}</Label>
                <span className="text-xs text-slate-400">
                    {state === 'saving' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {state === 'saved' ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                </span>
            </div>
            {textarea ? (
                <Textarea
                    value={draft}
                    placeholder={placeholder}
                    onChange={(event) => setDraft(event.target.value)}
                    className={cn('min-h-28 rounded-2xl border-slate-200')}
                />
            ) : (
                <Input
                    type={type}
                    value={draft}
                    placeholder={placeholder}
                    onChange={(event) => setDraft(event.target.value)}
                    className="rounded-2xl border-slate-200"
                />
            )}
        </div>
    );
}
