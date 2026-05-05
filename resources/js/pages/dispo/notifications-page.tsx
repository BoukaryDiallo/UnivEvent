import { Head, Link } from '@inertiajs/react';
import { DispoShell } from '@/components/dispo/entete';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import type { LigneNotification, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mes notifications', href: '/mes-notifications' },
];

export default function NotificationsPage({
    user,
    resume,
    notifications,
}: {
    user: UserDispo;
    resume: ResumeDispo;
    notifications: LigneNotification[];
}) {
    return (
        <DispoShell 
            title="Mes notifications" 
            description="Restez informé de ce qui se passe sur votre compte" 
            breadcrumbs={breadcrumbs} 
            resume={resume} 
            user={user} 
            showResume={false}
        >
            <Head title="Mes notifications" />
            
            <div className="space-y-6">
                {/* Carte principale */}
                <Card className="shadow-sm border-border/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-950/30 dark:to-transparent border-b border-border/50 px-6 py-4">
                        <CardTitle className="text-lg font-semibold">
                            Total 
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {notifications.length === 0 
                                ? "Tout est calme pour l'instant" 
                                : `${notifications.length} notification${notifications.length > 1 ? 's' : ''} à consulter`
                            }
                        </p>
                    </div>
                    <CardContent className="pt-5">
                        {notifications.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-3">📭</div>
                                <p className="text-muted-foreground">Aucune notification pour le moment</p>
                                <p className="text-xs text-muted-foreground mt-1">Vous serez averti dès qu'il y aura du nouveau</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.map((item, index) => (
                                    <div 
                                        key={`${item.titre}-${index}`}
                                        className={`py-4 first:pt-0 last:pb-0 transition-all ${
                                            item.type === 'danger' ? 'bg-red-50/20 -mx-2 px-2 rounded-lg' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl mt-0.5">
                                                {item.type === 'danger' ? '⚠️' : '📌'}
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <h4 className="font-semibold text-foreground">
                                                    {item.titre}
                                                </h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {item.texte}
                                                </p>
                                                <Link 
                                                    href={item.lien} 
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors group"
                                                >
                                                    Voir la section concernée
                                                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Petit rappel visuel si notifications */}
                {notifications.length > 0 && (
                    <div className="text-center text-xs text-muted-foreground bg-muted/20 rounded-lg py-2 px-4">
                         Les notifications d'alertes disparaissent automatiquement quand le problème est résolu
                    </div>
                )}
            </div>
        </DispoShell>
    );
}