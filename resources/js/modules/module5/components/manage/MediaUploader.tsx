import { router } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EventMedia } from '@/modules/module5/types/event';

type MediaUploaderProps = {
    eventId: number;
    medias: EventMedia[];
};

export function MediaUploader({ eventId, medias }: MediaUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [description, setDescription] = useState('');
    const [confidentialite, setConfidentialite] = useState<EventMedia['confidentialite']>('public');

    function upload() {
        if (!files.length) {
return;
}

        const formData = new FormData();
        files.forEach((file) => formData.append('media[]', file));
        formData.append('description', description);
        formData.append('confidentialite', confidentialite ?? 'public');
        formData.append('is_public', String((confidentialite ?? 'public') === 'public'));
        formData.append('download_allowed', 'true');

        router.post(`/module5/events/${eventId}/media`, formData, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['evenement'] }),
        });
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
                <Input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} className="rounded-2xl" />
                <div className="space-y-2">
                    <Label>Confidentialite</Label>
                    <Select value={confidentialite ?? 'public'} onValueChange={(value) => setConfidentialite(value as EventMedia['confidentialite'])}>
                        <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="inscrits">Inscrits</SelectItem>
                            <SelectItem value="participants">Participants retenus</SelectItem>
                            <SelectItem value="organisateur">Organisateurs</SelectItem>
                            <SelectItem value="intervenant">Intervenants</SelectItem>
                            <SelectItem value="jury">Jury</SelectItem>
                            <SelectItem value="president_jury">President du jury</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="md:col-span-2">
                    <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description ou texte de l affiche" className="min-h-24 rounded-2xl" />
                </div>
                <Button onClick={upload} className="rounded-2xl md:col-span-2">
                    <Upload className="mr-2 h-4 w-4" />
                    Ajouter les medias
                </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {medias.map((media) => (
                    <div key={media.id} className="rounded-2xl border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-medium text-slate-800">{media.name ?? 'Fichier'}</p>
                                <p className="text-xs text-slate-500">{media.confidentialite ?? 'public'}</p>
                                <a href={media.url ?? '#'} target="_blank" className="text-sm text-sky-600" rel="noreferrer">
                                    Ouvrir
                                </a>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    router.delete(`/module5/events/${eventId}/media/${media.id}`, {
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

