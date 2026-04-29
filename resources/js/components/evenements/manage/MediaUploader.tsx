import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EventMedia } from '@/types/evenements';

type MediaUploaderProps = {
    eventId: number;
    medias: EventMedia[];
};

export function MediaUploader({ eventId, medias }: MediaUploaderProps) {
    const [file, setFile] = useState<File | null>(null);

    function upload() {
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        router.post(`/evenements/${eventId}/media`, formData, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['evenement'] }),
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
                <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="rounded-2xl" />
                <Button onClick={upload} className="rounded-2xl">
                    <Upload className="mr-2 h-4 w-4" />
                    Ajouter un media
                </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {medias.map((media) => (
                    <div key={media.id} className="rounded-2xl border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-medium text-slate-800">{media.name ?? 'Fichier'}</p>
                                <a href={media.url} target="_blank" className="text-sm text-sky-600" rel="noreferrer">
                                    Ouvrir
                                </a>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    router.delete(`/evenements/${eventId}/media/${media.id}`, {
                                        preserveScroll: true,
                                        onSuccess: () => router.reload({ only: ['evenement'] }),
                                    })
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
