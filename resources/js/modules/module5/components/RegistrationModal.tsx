import { router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import { CalendarIcon, Loader2, MapPinIcon, InfoIcon, CheckCircle2Icon, AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import type { EventSummary } from '@/modules/module5/types/event';
import { EventBadge } from './EventBadge';

type RegistrationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    event: EventSummary | null;
    isRegistered?: boolean;
    isFull?: boolean;
};

export default function RegistrationModal({ isOpen, onClose, event, isRegistered, isFull }: RegistrationModalProps) {
    const { post, processing, recentlySuccessful } = useForm({
        evenement_id: event?.id ?? 0,
    });

    if (!event) {
        return null;
    }

    const handleConfirm = () => {
        post('/module5/inscriptions', {
            onSuccess: () => {
                setTimeout(() => onClose(), 1500);
            },
        });
    };

    const handleCancel = () => {
        // As per prompt: "Bouton 'Annuler mon inscription' (destructive, outline rose)"
        // Usually would be a DELETE/PATCH request
        router.patch(`/module5/participations/${event.participation?.id}/cancel`, {}, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] overflow-hidden p-0 gap-0 border-0 shadow-2xl">
                {/* Header with Background */}
                <div className={`h-24 w-full relative ${event.type === 'conference' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-4 left-6 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-md">
                                {event.type}
                            </span>
                            <span className="text-xs opacity-80">
                                {dayjs(event.date_debut).format('DD MMMM YYYY')}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold line-clamp-1">{event.titre}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Event Quick Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pb-4 border-b border-gray-100 dark:border-slate-800 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            <span>{event.lieu || 'Lieu à confirmer'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <InfoIcon className="h-3.5 w-3.5" />
                            <span>{event.capacite_max ? `${event.participants_count}/${event.capacite_max} places` : 'Libre'}</span>
                        </div>
                    </div>

                    {/* Status Messages & Body */}
                    <div className="space-y-4 py-2">
                        {recentlySuccessful ? (
                            <div className="flex flex-col items-center justify-center py-4 text-center animate-in zoom-in-95 duration-300">
                                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2Icon className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h3 className="text-emerald-900 font-bold dark:text-emerald-400">Inscription réussie !</h3>
                                <p className="text-sm text-emerald-700/80 dark:text-emerald-400/70">Vous allez recevoir une confirmation par email.</p>
                            </div>
                        ) : isRegistered ? (
                            <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 dark:bg-emerald-900/20">
                                <CheckCircle2Icon className="h-5 w-5 text-emerald-600 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Vous êtes déjà inscrit(e)</h4>
                                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70">Votre place est réservée pour cet événement.</p>
                                </div>
                            </div>
                        ) : isFull ? (
                            <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 dark:bg-amber-900/20">
                                <AlertTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">L'événement est complet</h4>
                                    <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
                                        Il n'y a plus de places disponibles. Vous pouvez rejoindre la liste d'attente.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-slate-300">
                                    Souhaitez-vous confirmer votre inscription à cet événement ? 
                                    {event.capacite_max && (
                                        <span className="block mt-1 font-medium text-emerald-600">
                                            Il reste {event.capacite_max - event.participants_count} places disponibles.
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <DialogFooter className="flex sm:flex-col gap-2">
                        {!recentlySuccessful && (
                            <>
                                {!isRegistered ? (
                                    <Button 
                                        onClick={handleConfirm}
                                        disabled={processing}
                                        className={`w-full py-6 rounded-2xl text-base font-bold transition-all shadow-lg ${
                                            isFull ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                    >
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isFull ? "Rejoindre la liste d'attente" : "Confirmer l'inscription"}
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="w-full py-6 rounded-2xl text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold"
                                    >
                                        Annuler mon inscription
                                    </Button>
                                )}
                            </>
                        )}
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="w-full text-gray-400 hover:text-gray-600"
                        >
                            {recentlySuccessful ? "Fermer" : "Plus tard"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
