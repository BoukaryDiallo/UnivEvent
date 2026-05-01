import { router, useForm } from '@inertiajs/react';
import { FileText, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EventMedia } from '@/types';
import { Modal } from './Modal';

type MediaGalleryProps = {
    medias: EventMedia[];
    evenementId: number;
    canUpload?: boolean;
    onToast?: (message: string) => void;
};

export function MediaGallery({ medias, evenementId, canUpload = false, onToast }: MediaGalleryProps) {
    const [selectedMedia, setSelectedMedia] = useState<EventMedia | null>(null);
    const uploadForm = useForm({
        media: [] as File[],
        description: '',
        is_public: true,
        download_allowed: true,
        confidentialite: 'public',
    });

    const setPublicState = (checked: CheckedState) => {
        const isPublic = checked === true;
        uploadForm.setData('is_public', isPublic);

        if (isPublic) {
            uploadForm.setData('confidentialite', 'public');
        }
    };

    const submitUpload = () => {
        if (!uploadForm.data.media.length) {
            return;
        }

        uploadForm.post(`/evenements/${evenementId}/media`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset('media', 'description');
                onToast?.('Media ajoute.');
            },
        });
    };

    const removeMedia = (id: number) => {
        router.delete(`/evenements/${evenementId}/media/${id}`, {
            preserveScroll: true,
            onSuccess: () => onToast?.('Media supprime.'),
        });
    };

    return (
        <div className="space-y-5">
            {canUpload ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                        <label className="flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 transition hover:border-sky-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-sky-800">
                            <span className="inline-flex items-center gap-2 font-medium">
                                <UploadCloud className="size-4" />
                                Ajouter une ou plusieurs affiches / ressources
                            </span>
                            <span className="mt-1 text-xs">Selectionnez plusieurs fichiers pour enrichir la galerie de l evenement.</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                multiple
                                onChange={(event) => uploadForm.setData('media', Array.from(event.target.files ?? []))}
                            />
                        </label>

                        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={uploadForm.data.description}
                                    onChange={(event) => uploadForm.setData('description', event.target.value)}
                                    placeholder="Affiche officielle, brochure, support intervenant..."
                                    className="min-h-24"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confidentialite</Label>
                                <Select
                                    value={uploadForm.data.confidentialite}
                                    onValueChange={(value) => uploadForm.setData('confidentialite', value as typeof uploadForm.data.confidentialite)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="inscrits">Inscrits</SelectItem>
                                        <SelectItem value="participants">Participants retenus</SelectItem>
                                        <SelectItem value="organisateur">Organisateurs</SelectItem>
                                        <SelectItem value="intervenant">Intervenants</SelectItem>
                                        <SelectItem value="jury">Membres du jury</SelectItem>
                                        <SelectItem value="president_jury">President du jury</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-wrap items-center gap-5">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <Checkbox checked={uploadForm.data.is_public} onCheckedChange={setPublicState} />
                                    Public
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <Checkbox checked={uploadForm.data.download_allowed} onCheckedChange={(checked) => uploadForm.setData('download_allowed', checked === true)} />
                                    Telechargement autorise
                                </label>
                            </div>
                            <Button type="button" onClick={submitUpload} disabled={!uploadForm.data.media.length || uploadForm.processing}>
                                Envoyer les medias
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {medias.length ? (
                <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {medias.map((media) => (
                        <button
                            key={media.id}
                            type="button"
                            onClick={() => setSelectedMedia(media)}
                            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20"
                        >
                            <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                                {media.type === 'image' && media.url ? (
                                    <img src={media.url} alt={media.name ?? 'Media de l evenement'} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex size-full items-center justify-center">
                                        <FileText className="size-12 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{media.name || 'Fichier sans titre'}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        {media.type === 'image' ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
                                        {media.type}
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{media.confidentialite ?? 'public'}</span>
                                    </div>
                                </div>
                                {canUpload ? (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            removeMedia(media.id);
                                        }}
                                        title="Supprimer le media"
                                        aria-label={`Supprimer le media ${media.name || 'sans titre'}`}
                                        className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                ) : null}
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                    Aucun media publie pour le moment.
                </div>
            )}

            <Modal
                open={Boolean(selectedMedia)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMedia(null);
                    }
                }}
                title={selectedMedia?.name || 'Apercu du media'}
            >
                {selectedMedia?.type === 'image' && selectedMedia.url ? (
                    <img src={selectedMedia.url} alt={selectedMedia.name ?? 'Media selectionne'} className="max-h-[70vh] w-full rounded-2xl object-contain" />
                ) : selectedMedia?.url ? (
                    <div className="space-y-4">
                        <iframe title={selectedMedia.name ?? 'Apercu PDF'} src={selectedMedia.url} className="h-[70vh] w-full rounded-2xl border" />
                        <a
                            href={selectedMedia.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                        >
                            Ouvrir le document dans un nouvel onglet
                        </a>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">
                        Ce media n est pas accessible avec votre role actuel.
                    </div>
                )}
            </Modal>
        </div>
    );
}
