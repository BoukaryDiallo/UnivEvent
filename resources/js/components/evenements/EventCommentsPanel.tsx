import { router } from '@inertiajs/react';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { EventComment } from '@/types';
import { UserAvatar } from './UserAvatar';

type EventCommentsPanelProps = {
    evenementId: number;
    comments: EventComment[];
    canManage?: boolean;
    onToast?: (message: string, tone?: 'success' | 'error') => void;
};

function CommentCard({
    comment,
    evenementId,
    canManage,
    onToast,
}: {
    comment: EventComment;
    evenementId: number;
    canManage: boolean;
    onToast?: (message: string, tone?: 'success' | 'error') => void;
}) {
    const [reply, setReply] = useState('');
    const [showReply, setShowReply] = useState(false);

    const submitReply = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            `/evenements/${evenementId}/commentaires`,
            { contenu: reply, parent_id: comment.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReply('');
                    setShowReply(false);
                    onToast?.('Reponse envoyee.');
                },
                onError: () => onToast?.("Impossible d'envoyer la reponse.", 'error'),
            },
        );
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <UserAvatar name={comment.user.name} className="size-10" />
                    <div>
                        <div className="font-medium text-slate-950 dark:text-white">{comment.user.name || 'Utilisateur'}</div>
                        <div className="text-xs text-slate-400">
                            {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                        </div>
                    </div>
                </div>
                {canManage ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            router.delete(`/commentaires/${comment.id}`, {
                                preserveScroll: true,
                                onSuccess: () => onToast?.('Commentaire supprime.'),
                            })
                        }
                    >
                        <Trash2 className="size-4" />
                    </Button>
                ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.contenu}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={comment.liked_by_me ? 'border-rose-200 text-rose-600' : ''}
                    onClick={() =>
                        router.post(
                            `/commentaires/${comment.id}/reactions/toggle`,
                            {},
                            {
                                preserveScroll: true,
                            },
                        )
                    }
                >
                    <Heart className="size-4" />
                    {comment.likes_count}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowReply((value) => !value)}>
                    <MessageCircle className="size-4" />
                    Repondre
                </Button>
            </div>
            {showReply ? (
                <form onSubmit={submitReply} className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Votre reponse..." className="min-h-24" />
                    <div className="flex justify-end">
                        <Button type="submit" size="sm" disabled={!reply.trim()}>
                            <Send className="size-4" />
                            Envoyer
                        </Button>
                    </div>
                </form>
            ) : null}
            {comment.replies.length ? (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <UserAvatar name={reply.user.name} className="size-8" />
                                <div>
                                    <div className="text-sm font-medium text-slate-950 dark:text-white">{reply.user.name || 'Utilisateur'}</div>
                                    <div className="text-xs text-slate-400">
                                        {reply.created_at ? new Date(reply.created_at).toLocaleString() : ''}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{reply.contenu}</p>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function EventCommentsPanel({ evenementId, comments, canManage = false, onToast }: EventCommentsPanelProps) {
    const [content, setContent] = useState('');

    const submitComment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            `/evenements/${evenementId}/commentaires`,
            { contenu: content },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setContent('');
                    onToast?.('Commentaire ajoute.');
                },
                onError: () => onToast?.("Impossible d'ajouter le commentaire.", 'error'),
            },
        );
    };

    return (
        <div className="space-y-5">
            <form onSubmit={submitComment} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Commentaires & reactions</div>
                <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Partager une question, un retour ou une reaction..." className="mt-4 min-h-28" />
                <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={!content.trim()}>
                        <Send className="size-4" />
                        Publier
                    </Button>
                </div>
            </form>
            {comments.length ? (
                comments.map((comment) => <CommentCard key={comment.id} comment={comment} evenementId={evenementId} canManage={canManage} onToast={onToast} />)
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                    Aucun commentaire pour le moment.
                </div>
            )}
        </div>
    );
}
