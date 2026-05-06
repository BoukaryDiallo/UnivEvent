import { Link, router } from '@inertiajs/react';
import { 
    Bell, 
    CheckCircle2, 
    Trash2, 
    Search, 
    X, 
    MessageSquare, 
    Users, 
    Trophy, 
    Calendar,
    Flame,
    Clock
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Activity = {
    id: number;
    label: string;
    description: string;
    type: string;
    created_at: string;
    read_at: string | null;
    user?: { name: string };
    evenement?: { id: number; titre: string };
};

type ActualitesFeedProps = {
    activities: Activity[];
    title?: string;
    showSearch?: boolean;
};

export function ActualitesFeed({ activities, title = "Actualités de la plateforme", showSearch = true }: ActualitesFeedProps) {
    const [search, setSearch] = useState('');
    
    const filtered = activities.filter(act => 
        act.label.toLowerCase().includes(search.toLowerCase()) ||
        act.description.toLowerCase().includes(search.toLowerCase()) ||
        act.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        act.evenement?.titre.toLowerCase().includes(search.toLowerCase())
    );

    const markAsRead = (id: number) => {
        router.patch(`/module5/activities/${id}/read`, {}, { preserveScroll: true });
    };

    const clearAll = () => {
        if (confirm('Voulez-vous vraiment vider tout l\'historique ?')) {
            router.delete('/module5/activities-clear');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'inscription': return <Users className="size-4 text-emerald-500" />;
            case 'comment': return <MessageSquare className="size-4 text-sky-500" />;
            case 'result': return <Trophy className="size-4 text-amber-500" />;
            case 'event': return <Calendar className="size-4 text-indigo-500" />;
            default: return <Flame className="size-4 text-rose-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Bell className="size-5 text-indigo-600" />
                        {title}
                    </h3>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600" onClick={() => router.post('/module5/activities/read-all')}>
                            Tout lire
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-600" onClick={clearAll}>
                            Effacer
                        </Button>
                    </div>
                </div>

                {showSearch && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input 
                            placeholder="Rechercher dans les actualités..." 
                            className="pl-10 h-10 rounded-xl border-gray-100 bg-white/50" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {filtered.map((activity) => (
                    <div 
                        key={activity.id} 
                        className={`group relative bg-white p-5 rounded-[2rem] border transition-all duration-300 hover:shadow-lg dark:bg-slate-950 ${
                            activity.read_at ? 'border-gray-50 opacity-60' : 'border-indigo-100 shadow-sm border-l-4 border-l-indigo-600'
                        }`}
                    >
                        <div className="flex gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                activity.read_at ? 'bg-gray-50 text-gray-400' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                                {getIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                        {activity.label} 
                                        {activity.evenement && (
                                            <span className="mx-1 text-gray-300">·</span>
                                        )}
                                        {activity.evenement && (
                                            <Link 
                                                href={`/module5/events/${activity.evenement.id}`} 
                                                className="text-indigo-600 hover:underline"
                                                onClick={() => !activity.read_at && markAsRead(activity.id)}
                                            >
                                                {activity.evenement.titre}
                                            </Link>
                                        )}
                                    </p>
                                    <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {new Date(activity.created_at).toLocaleString('fr-FR', {
                                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                    <span className="font-bold text-gray-700">{activity.user?.name}</span> · {activity.description}
                                </p>
                            </div>
                        </div>

                        {/* Actions on Hover */}
                        <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!activity.read_at && (
                                <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                    onClick={() => markAsRead(activity.id)}
                                >
                                    <CheckCircle2 className="size-4" />
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-gray-300 hover:text-rose-600"
                                onClick={() => router.delete(`/module5/activities/${activity.id}`)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100">
                        <Bell className="size-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucune actualité trouvée</p>
                    </div>
                )}
            </div>
        </div>
    );
}
