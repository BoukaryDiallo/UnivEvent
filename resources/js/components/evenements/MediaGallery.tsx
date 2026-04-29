import { router, useForm } from '@inertiajs/react';
import { FileText, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
        media: null as File | null,
        description: '',
        is_public: true,
        download_allowed: true,
    });

    const submitUpload = () => {
        if (!uploadForm.data.media) {
            return;
        }

        uploadForm.post(`/evenements/${evenementId}/media`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset('media');
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="flex flex-1 cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 transition hover:border-sky-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-sky-800">
                            <span className="inline-flex items-center gap-2 font-medium">
                                <UploadCloud className="size-4" />
                                Ajouter une image ou un PDF
                            </span>
                            <span className="mt-1 text-xs">Selectionnez un fichier pour l'ajouter a la galerie de l'evenement.</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(event) => uploadForm.setData('media', event.target.files?.[0] ?? null)}
                            />
                        </label>
                        <Button type="button" onClick={submitUpload} disabled={!uploadForm.data.media || uploadForm.processing}>
                            Envoyer
                        </Button>
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
                                {media.type === 'image' ? (
                                    <img src={media.url} alt={media.name ?? 'Media de l evenement'} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex size-full items-center justify-center">
                                        <FileText className="size-12 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                        {media.name || 'Fichier sans titre'}
                                    </div>
                                    <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        {media.type === 'image' ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
                                        {media.type}
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
                {selectedMedia?.type === 'image' ? (
                    <img src={selectedMedia.url} alt={selectedMedia.name ?? 'Media selectionne'} className="max-h-[70vh] w-full rounded-2xl object-contain" />
                ) : selectedMedia ? (
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
                ) : null}
            </Modal>
        </div>
    );
}
