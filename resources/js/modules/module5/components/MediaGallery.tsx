import { router, useForm, usePage } from '@inertiajs/react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { FileText, Image as ImageIcon, Trash2, UploadCloud, Video, Play, File as FileIcon, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
    const { auth } = usePage().props as any;

    const uploadForm = useForm({
        media: [] as File[],
        description: '',
        is_public: true,
        download_allowed: true,
        confidentialite: 'public',
        use_as_cover: false,
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

        uploadForm.post(`/module5/events/${evenementId}/media`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset('media', 'description');
                uploadForm.setData('use_as_cover', false);
                onToast?.('Média(s) ajouté(s) avec succès.');
            },
        });
    };

    const removeMedia = (id: number) => {
        if (confirm('Supprimer ce média ?')) {
            router.delete(`/module5/events/${evenementId}/media/${id}`, {
                preserveScroll: true,
                onSuccess: () => onToast?.('Média supprimé.'),
            });
        }
    };

    const setAsCover = (id: number) => {
        router.patch(`/module5/events/${evenementId}/media/${id}`, { is_cover: true }, {
            preserveScroll: true,
            onSuccess: () => onToast?.('Image de couverture mise à jour.'),
        });
    };

    return (
        <div className="space-y-6">
            {canUpload ? (
                <div className="rounded-[2.5rem] border border-dashed border-indigo-200 bg-indigo-50/30 p-6 dark:border-slate-700 dark:bg-slate-900/40 animate-in fade-in slide-in-from-top-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white bg-white/50 px-4 py-8 text-center transition hover:border-indigo-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950">
                                <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                    <UploadCloud className="size-8 text-indigo-600" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                    {uploadForm.data.media.length > 0 
                                        ? `${uploadForm.data.media.length} fichier(s) sélectionné(s)` 
                                        : 'Ajouter des affiches, vidéos ou documents'}
                                </span>
                                <span className="mt-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-relaxed">
                                    Images, PDFs et vidéos (MP4)<br/>Taille max : 50Mo par fichier.
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf,video/mp4,video/webm"
                                    multiple
                                    onChange={(event) => uploadForm.setData('media', Array.from(event.target.files ?? []))}
                                />
                            </label>
                            {uploadForm.data.media.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto p-1">
                                        {uploadForm.data.media.map((file, i) => (
                                            <Badge key={i} variant="secondary" className="text-[8px] font-bold bg-white/80">{file.name}</Badge>
                                        ))}
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full rounded-xl text-rose-500 font-bold" onClick={() => uploadForm.setData('media', [])}>
                                        <X className="size-4 mr-2" /> Vider la sélection
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 bg-white/40 p-6 rounded-[2rem] border border-white dark:bg-slate-950 dark:border-slate-800">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description groupée</Label>
                                <Textarea
                                    value={uploadForm.data.description}
                                    onChange={(event) => uploadForm.setData('description', event.target.value)}
                                    placeholder="Ex: Supports de présentation..."
                                    className="min-h-[80px] rounded-xl border-gray-100 focus:ring-indigo-600"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confidentialité</Label>
                                    <Select
                                        value={uploadForm.data.confidentialite}
                                        onValueChange={(value) => uploadForm.setData('confidentialite', value)}
                                    >
                                        <SelectTrigger className="rounded-xl h-10 border-gray-100 font-bold text-xs uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="public">Public (Tous)</SelectItem>
                                            <SelectItem value="inscrits">Inscrits</SelectItem>
                                            <SelectItem value="participants">Participants validés</SelectItem>
                                            <SelectItem value="organisateur">Équipe Orga</SelectItem>
                                            <SelectItem value="intervenant">Intervenants</SelectItem>
                                            <SelectItem value="jury">Membres du jury</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col justify-center space-y-2 pt-4">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id="is_public" checked={uploadForm.data.is_public} onCheckedChange={setPublicState} className="rounded-md" />
                                        <Label htmlFor="is_public" className="text-[10px] font-black uppercase tracking-tight cursor-pointer">Public</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Checkbox id="use_as_cover" checked={uploadForm.data.use_as_cover} onCheckedChange={(checked) => uploadForm.setData('use_as_cover', checked === true)} className="rounded-md" />
                                        <Label htmlFor="use_as_cover" className="text-[10px] font-black uppercase tracking-tight cursor-pointer">Couverture (Image)</Label>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100" 
                                onClick={submitUpload} 
                                disabled={!uploadForm.data.media.length || uploadForm.processing}
                            >
                                {uploadForm.processing ? 'Envoi en cours...' : 'Envoyer les fichiers'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {medias.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {medias.map((media) => (
                        <div
                            key={media.id}
                            className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="aspect-video overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
                                {media.type === 'image' && media.url ? (
                                    <img src={media.url} alt={media.name} className="size-full object-cover transition duration-500 group-hover:scale-110" />
                                ) : media.type === 'video' ? (
                                    <div className="flex size-full items-center justify-center bg-slate-950">
                                        <Play className="size-12 text-white/50" />
                                        <Badge className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border-0 uppercase text-[8px] font-black">Vidéo</Badge>
                                    </div>
                                ) : (
                                    <div className="flex size-full items-center justify-center">
                                        {media.type === 'pdf' ? <FileText className="size-16 text-rose-100 dark:text-rose-900/30" /> : <FileIcon className="size-16 text-slate-100" />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" className="rounded-xl font-bold bg-white text-gray-900 hover:bg-gray-100" onClick={() => setSelectedMedia(media)}>
                                        <Play className="size-3 mr-2 fill-current" /> Aperçu
                                    </Button>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{media.name}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[7px] font-black uppercase px-2 py-0 border-gray-100">{media.type}</Badge>
                                            <Badge className="bg-indigo-50 text-indigo-600 border-0 text-[7px] font-black uppercase px-2 py-0">{media.confidentialite}</Badge>
                                            {media.is_cover ? <Badge className="bg-amber-100 text-amber-700 border-0 text-[7px] font-black uppercase px-2 py-0">Couverture</Badge> : null}
                                        </div>
                                    </div>
                                    {canUpload && (
                                        <div className="flex gap-1">
                                            {media.type === 'image' && !media.is_cover && (
                                                <Button size="icon" variant="ghost" onClick={() => setAsCover(media.id)} className="h-8 w-8 rounded-lg text-amber-500 hover:bg-amber-50">
                                                    <ImageIcon className="size-4" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" onClick={() => removeMedia(media.id)} className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium line-clamp-2 italic leading-relaxed">
                                    {media.description || 'Aucune description fournie.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50 p-20 text-center">
                    <FileIcon className="size-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun média disponible</p>
                </div>
            )}

            <Modal
                open={Boolean(selectedMedia)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMedia(null);
                    }
                }}
                title={selectedMedia?.name || 'Aperçu'}
            >
                <div className="p-0 overflow-hidden rounded-[2rem]">
                    {selectedMedia?.type === 'image' && selectedMedia.url ? (
                        <img src={selectedMedia.url} alt={selectedMedia.name} className="max-h-[70vh] w-full object-contain shadow-2xl" />
                    ) : selectedMedia?.type === 'video' && selectedMedia.url ? (
                        <video controls className="max-h-[70vh] w-full shadow-2xl bg-black" src={selectedMedia.url}>
                            Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                    ) : selectedMedia?.url ? (
                        <div className="space-y-4">
                            <iframe title={selectedMedia.name} src={selectedMedia.url} className="h-[70vh] w-full border bg-white" />
                            <div className="flex justify-center p-4">
                                <Button asChild className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs bg-gray-900">
                                    <a href={selectedMedia.url} target="_blank" rel="noreferrer">
                                        Ouvrir le document
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 text-center text-slate-500 bg-slate-50">
                            <X className="size-12 mx-auto mb-4 text-slate-200" />
                            <p className="font-black uppercase tracking-widest text-xs">Fichier non accessible</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
