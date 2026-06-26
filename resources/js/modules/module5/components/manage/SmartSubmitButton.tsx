import { ArrowRight, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

function readCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function findSection(error: string) {
    const value = error.toLowerCase();

    if (value.includes('organisateur')) {
return 'actors';
}

    if (value.includes('programme') || value.includes('criter')) {
return 'program';
}

    if (value.includes('date') || value.includes('description') || value.includes('titre')) {
return 'general';
}

    return 'general';
}

type SmartSubmitButtonProps = {
    eventId: number;
    initialErrors: string[];
    onSuccess: () => void;
    onNavigate: (section: string) => void;
};

export function SmartSubmitButton({ eventId, initialErrors, onSuccess, onNavigate }: SmartSubmitButtonProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(initialErrors);
    const mappedErrors = useMemo(() => errors.map((message) => ({ message, section: findSection(message) })), [errors]);

    useEffect(() => {
        setErrors(initialErrors);
    }, [initialErrors]);

    async function submit() {
        setLoading(true);

        try {
            const response = await fetch(`/module5/events/${eventId}/submit-validation`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': readCsrfToken(),
                },
                credentials: 'same-origin',
            });

            const payload = (await response.json().catch(() => null)) as { errors?: string[] } | null;

            if (!response.ok) {
                setErrors(payload?.errors ?? ['Veuillez completer les sections requises.']);

                return;
            }

            setErrors([]);
            onSuccess();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <Button onClick={submit} disabled={loading} className="w-full rounded-2xl">
                {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                Soumettre pour validation
            </Button>
            {mappedErrors.length > 0 ? (
                <div className="mt-4 space-y-2">
                    {mappedErrors.map((error) => (
                        <button
                            type="button"
                            key={`${error.section}-${error.message}`}
                            onClick={() => onNavigate(error.section)}
                            className="flex w-full items-start gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-left text-sm text-rose-700"
                        >
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error.message}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
