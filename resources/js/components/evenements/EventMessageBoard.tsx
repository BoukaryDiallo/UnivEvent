import { router } from '@inertiajs/react';
import { MessageSquare, Pin, Reply, Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            `/evenements/${evenementId}/messages`,
            { contenu: content, type: canManage ? 'annonce' : 'question' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setContent('');
                    onToast?.('Message envoye.');
                },
                onError: () => onToast?.("Impossible d'envoyer le message.", 'error'),
            },
        );
    };

    const submitReply = (messageId: number) => {
        router.post(
            `/evenements/${evenementId}/messages/${messageId}/reply`,
            { contenu: replies[messageId], type: canManage ? 'reponse_organisateur' : 'support' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplies((current) => ({ ...current, [messageId]: '' }));
                    onToast?.('Reponse envoyee.');
                },
                onError: () => onToast?.("Impossible d'envoyer la reponse.", 'error'),
            },
        );
    };

    return (
        <div className="space-y-5">
            <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <MessageSquare className="size-4" />
                    Messagerie liee a l evenement
                </div>
                <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Poser une question a l organisateur ou discuter avec les participants..." className="mt-4 min-h-28" />
                <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={!content.trim()}>
                        <Send className="size-4" />
                        Envoyer
                    </Button>
                </div>
            </form>
            {messages.length ? (
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <UserAvatar name={message.user.name} className="size-10" />
                                    <div>
                                        <div className="font-medium text-slate-950 dark:text-white">{message.user.name || 'Participant'}</div>
                                        <div className="text-xs text-slate-400">
                                            {message.created_at ? new Date(message.created_at).toLocaleString() : ''} - {message.type}
                                        </div>
                                    </div>
                                </div>
                                {message.is_pinned ? <Pin className="size-4 text-amber-500" /> : null}
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{message.contenu}</p>
                            <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                {message.status}
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Reply className="size-4 text-slate-400" />
                                <Textarea value={replies[message.id] ?? ''} onChange={(event) => setReplies((current) => ({ ...current, [message.id]: event.target.value }))} placeholder="Repondre a ce fil..." className="min-h-20" />
                                <Button type="button" size="sm" disabled={!(replies[message.id] ?? '').trim()} onClick={() => submitReply(message.id)}>
                                    Envoyer
                                </Button>
                            </div>
                            {message.replies?.length ? (
                                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    {message.replies.map((reply) => (
                                        <div key={reply.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={reply.user.name} className="size-8" />
                                                <div>
                                                    <div className="text-sm font-medium text-slate-950 dark:text-white">{reply.user.name || 'Utilisateur'}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {reply.created_at ? new Date(reply.created_at).toLocaleString() : ''} - {reply.type}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{reply.contenu}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                    Aucun message pour le moment.
                </div>
            )}
        </div>
    );
}
