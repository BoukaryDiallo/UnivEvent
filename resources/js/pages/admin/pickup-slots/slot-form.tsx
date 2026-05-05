import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Data = {
    location: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
};

type Errors = Partial<Record<keyof Data, string>>;

type Props = {
    data: Data;
    setData: <K extends keyof Data>(key: K, value: Data[K]) => void;
    errors: Errors;
    processing: boolean;
    onSubmit: (e: FormEvent) => void;
    submitLabel: string;
};

export function SlotForm({ data, setData, errors, processing, onSubmit, submitLabel }: Props) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="Salle 201, Bâtiment Scolarité"
                    required
                />
                <InputError message={errors.location} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="starts_at">Début</Label>
                    <Input
                        id="starts_at"
                        type="datetime-local"
                        value={data.starts_at}
                        onChange={(e) => setData('starts_at', e.target.value)}
                        required
                    />
                    <InputError message={errors.starts_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="ends_at">Fin</Label>
                    <Input
                        id="ends_at"
                        type="datetime-local"
                        value={data.ends_at}
                        onChange={(e) => setData('ends_at', e.target.value)}
                        required
                    />
                    <InputError message={errors.ends_at} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="capacity">Capacité</Label>
                <Input
                    id="capacity"
                    type="number"
                    min={1}
                    max={200}
                    value={data.capacity}
                    onChange={(e) => setData('capacity', Number(e.target.value))}
                    required
                />
                <InputError message={errors.capacity} />
            </div>

            <div>
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
