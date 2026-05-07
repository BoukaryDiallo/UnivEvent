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

function ReplyCard({
    reply,
    onToast,
}: {
    reply: any;
    onToast?: (message: string, tone?: 'success' | 'error') => void;
}) {
    return (
        <div className="rounded-2xl bg-gray-50/50 p-4 border border-gray-100 dark:bg-slate-900/50 dark:border-slate-800 animate-in fade-in slide-in-from-left-2">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <UserAvatar name={reply.user.name} className="size-7" />
                    <div>
                        <div className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{reply.user.name || 'Utilisateur'}</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ''}
                        </div>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reply.liked_by_me ? 'text-rose-600 bg-rose-50' : 'text-gray-400'}`}
                    onClick={() =>
                        router.post(
                            `/module5/commentaires/${reply.id}/reactions/toggle`,
                            {},
                            { preserveScroll: true }
                        )
                    }
                >
                    <Heart className={`size-3 mr-1.5 ${reply.liked_by_me ? 'fill-current' : ''}`} />
                    {reply.likes_count || 0}
                </Button>
            </div>
            <p className="mt-2.5 text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{reply.contenu}</p>
        </div>
    );
}

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
            `/module5/events/${evenementId}/commentaires`,
            { contenu: reply, parent_id: comment.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReply('');
                    setShowReply(false);
                    onToast?.('Réponse publiée.');
                },
                onError: () => onToast?.("Erreur lors de l'envoi.", 'error'),
            },
        );
    };

    return (
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                    <div className="p-1 bg-indigo-50 rounded-2xl dark:bg-indigo-950/30">
                        <UserAvatar name={comment.user.name} className="size-10 rounded-xl" />
                    </div>
                    <div>
                        <div className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">{comment.user.name || 'Utilisateur'}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <Clock className="size-3" />
                            {comment.created_at ? new Date(comment.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                    </div>
                </div>
                {canManage ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-gray-300 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() =>
                            router.delete(`/module5/commentaires/${comment.id}`, {
                                preserveScroll: true,
                                onSuccess: () => onToast?.('Commentaire supprimé.'),
                            })
                        }
                    >
                        <Trash2 className="size-4" />
                    </Button>
                ) : null}
            </div>
            <p className="mt-5 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400 border-l-2 border-indigo-50 pl-4 ml-1">
                {comment.contenu}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={`rounded-xl h-9 px-4 font-black uppercase text-[10px] tracking-widest transition-all ${comment.liked_by_me ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500'}`}
                    onClick={() =>
                        router.post(
                            `/module5/commentaires/${comment.id}/reactions/toggle`,
                            {},
                            { preserveScroll: true }
                        )
                    }
                >
                    <Heart className={`size-3.5 mr-2 ${comment.liked_by_me ? 'fill-current' : ''}`} />
                    {comment.likes_count}
                </Button>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl h-9 px-4 font-black uppercase text-[10px] tracking-widest text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setShowReply((value) => !value)}
                >
                    <MessageCircle className="size-3.5 mr-2" />
                    Répondre
                </Button>
            </div>
            {showReply ? (
                <form onSubmit={submitReply} className="mt-5 space-y-4 rounded-[2rem] bg-indigo-50/30 p-5 border border-indigo-50 animate-in fade-in zoom-in duration-300">
                    <Textarea 
                        value={reply} 
                        onChange={(event) => setReply(event.target.value)} 
                        placeholder="Écrivez votre réponse..." 
                        className="min-h-24 rounded-2xl border-white bg-white/80 focus:ring-indigo-500 font-medium" 
                    />
                    <div className="flex justify-end">
                        <Button type="submit" size="sm" className="rounded-xl bg-gray-900 px-6 font-black uppercase tracking-widest text-[10px]" disabled={!reply.trim()}>
                            <Send className="size-3.5 mr-2" />
                            Envoyer
                        </Button>
                    </div>
                </form>
            ) : null}
            {comment.replies.length ? (
                <div className="mt-6 space-y-4 border-t border-gray-50 pt-6 dark:border-slate-800">
                    {comment.replies.map((reply) => (
                        <ReplyCard key={reply.id} reply={reply} onToast={onToast} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function EventCommentsPanel({ evenementId, comments, canManage = false, onToast }: EventCommentsPanelProps) {
    const [content, setContent] = useState('');
    const { auth } = usePage().props as any;

    const submitComment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            `/module5/events/${evenementId}/commentaires`,
            { contenu: content },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setContent('');
                    onToast?.('Commentaire publié.');
                },
                onError: () => onToast?.("Impossible de publier.", 'error'),
            },
        );
    };

    return (
        <div className="space-y-8">
            {auth.user ? (
                <form onSubmit={submitComment} className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/30 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="size-4 text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Discussion & Partages</span>
                    </div>
                    <Textarea 
                        value={content} 
                        onChange={(event) => setContent(event.target.value)} 
                        placeholder="Posez une question ou partagez votre avis..." 
                        className="rounded-[1.5rem] border-white bg-white focus:ring-indigo-600 font-medium min-h-32 p-6" 
                    />
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-8 font-black uppercase tracking-widest text-xs h-12 shadow-lg shadow-indigo-100" disabled={!content.trim()}>
                            <Send className="size-4 mr-2" />
                            Publier mon commentaire
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="rounded-[2.5rem] bg-gray-50 p-10 text-center border border-dashed border-gray-200">
                    <MessageSquare className="size-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">Connectez-vous pour participer à la discussion</p>
                </div>
            )}
            
            <div className="space-y-6">
                {comments.length ? (
                    comments.map((comment) => <CommentCard key={comment.id} comment={comment} evenementId={evenementId} canManage={canManage} onToast={onToast} />)
                ) : (
                    <div className="rounded-[3rem] border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400 font-bold uppercase tracking-widest italic">
                        Soyez le premier à commenter
                    </div>
                )}
            </div>
        </div>
    );
}

import { Clock } from 'lucide-react';
import { usePage } from '@inertiajs/react';
