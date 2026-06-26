import { router } from '@inertiajs/react';
import { MessageSquare, Pin, Reply, Send } from 'lucide-react';
import { Search, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { EventMessage } from '@/types';
import { UserAvatar } from './UserAvatar';

type EventMessageBoardProps = {
    evenementId: number;
    messages: EventMessage[];
    canManage?: boolean;
    onToast?: (message: string, tone?: 'success' | 'error') => void;
};

export function EventMessageBoard({ evenementId, messages, canManage = false, onToast }: EventMessageBoardProps) {
    const [content, setContent] = useState('');
    const [replies, setReplies] = useState<Record<number, string>>({});
    const [search, setSearch] = useState('');
    const { auth } = usePage().props as any;

    const filteredMessages = useMemo(
        () =>
            messages.filter((message) => {
                const haystack = `${message.user.name ?? ''} ${message.contenu} ${message.type}`.toLowerCase();

                return haystack.includes(search.trim().toLowerCase());
            }),
        [messages, search],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            `/module5/events/${evenementId}/messages`,
            { contenu: content, type: canManage ? 'annonce' : 'question' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setContent('');
                    onToast?.('Message publié.');
                },
                onError: () => onToast?.("Impossible d'envoyer le message.", 'error'),
            },
        );
    };

    const submitReply = (messageId: number) => {
        router.post(
            `/module5/events/${evenementId}/messages/${messageId}/reply`,
            { contenu: replies[messageId], type: canManage ? 'reponse_organisateur' : 'support' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplies((current) => ({ ...current, [messageId]: '' }));
                    onToast?.('Réponse envoyée.');
                },
                onError: () => onToast?.("Impossible d'envoyer la réponse.", 'error'),
            },
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-indigo-600" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Espace de discussion</h3>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input 
                        value={search} 
                        onChange={(event) => setSearch(event.target.value)} 
                        placeholder="Chercher un sujet..." 
                        className="pl-10 h-10 rounded-xl border-gray-100 bg-white" 
                    />
                </div>
            </div>

            {auth.user ? (
                <form onSubmit={submit} className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/30 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        <Send className="size-3" /> Nouveau message
                    </div>
                    <Textarea 
                        value={content} 
                        onChange={(event) => setContent(event.target.value)} 
                        placeholder="Une question technique ou logistique ? Posez-la ici..." 
                        className="rounded-[1.5rem] border-white bg-white focus:ring-indigo-600 font-medium min-h-24 p-6" 
                    />
                    <div className="mt-4 flex justify-end">
                        <Button type="submit" disabled={!content.trim()} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-8 font-black uppercase tracking-widest text-xs h-12 shadow-lg">
                            Envoyer le message
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="rounded-[2.5rem] bg-gray-50 p-10 text-center border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-tight italic">Connectez-vous pour envoyer un message</p>
                </div>
            )}

            <div className="space-y-6">
                {filteredMessages.map((message) => (
                    <div key={message.id} className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="p-1 bg-gray-50 rounded-2xl">
                                    <UserAvatar name={message.user.name} className="size-10 rounded-xl" />
                                </div>
                                <div>
                                    <div className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm flex items-center gap-2">
                                        {message.user.name}
                                        {message.type === 'annonce' && <Badge className="bg-amber-100 text-amber-700 border-0 text-[8px] font-black uppercase">Annonce</Badge>}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                        <Clock className="size-3" />
                                        {new Date(message.created_at).toLocaleString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                            {message.is_pinned && <Pin className="size-4 text-amber-500 fill-current" />}
                        </div>

                        <p className="mt-6 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                            {message.contenu}
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex gap-2">
                                <Input 
                                    value={replies[message.id] ?? ''} 
                                    onChange={(event) => setReplies((current) => ({ ...current, [message.id]: event.target.value }))} 
                                    placeholder="Ajouter une réponse rapide..." 
                                    className="h-10 rounded-xl border-gray-100 bg-gray-50/50" 
                                />
                                <Button size="sm" className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] bg-gray-900" disabled={!(replies[message.id] ?? '').trim()} onClick={() => submitReply(message.id)}>
                                    <Reply className="size-3 mr-2" /> Répondre
                                </Button>
                            </div>

                            {message.replies?.length ? (
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    {message.replies.map((reply) => (
                                        <div key={reply.id} className="flex gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                            <UserAvatar name={reply.user.name} className="size-6" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black text-gray-900 uppercase">{reply.user.name}</span>
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{reply.contenu}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                ))}

                {filteredMessages.length === 0 && (
                    <div className="rounded-[3rem] border border-dashed border-gray-200 bg-white p-16 text-center text-sm text-gray-400 font-bold uppercase tracking-widest italic">
                        {messages.length ? 'Aucun résultat' : 'La boîte de réception est vide'}
                    </div>
                )}
            </div>
        </div>
    );
}

import { usePage } from '@inertiajs/react';
