import { Head } from '@inertiajs/react';
import { DispoShell } from '@/components/dispo/entete';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import type { LigneNotification, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications admin', href: '/consultation/notifications' },
];

export default function AdminNotificationsPage({
    user,
    notifications,
    indicateurs,
    resume,
}: {
    user: UserDispo;
    notifications: LigneNotification[];
    indicateurs: Record<string, number>;
    resume: ResumeDispo;
}) {
    return (
        <DispoShell title="Notifications administrateur" description="Vue globale, informative et agregee du module disponibilite." breadcrumbs={breadcrumbs} resume={resume} user={user}>
            <Head title="Notifications administrateur" />
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader><CardTitle>Mises a jour cette semaine</CardTitle></CardHeader>
                    <CardContent>{indicateurs.declarations_semaine} enseignant(s)</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Conflits detectes</CardTitle></CardHeader>
                    <CardContent>{indicateurs.conflits} conflit(s)</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Enseignants avec disponibilites</CardTitle></CardHeader>
                    <CardContent>{indicateurs.avec_dispo} enseignant(s)</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Enseignants sans disponibilites</CardTitle></CardHeader>
                    <CardContent>{indicateurs.sans_dispo} enseignant(s)</CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Synthese generale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {notifications.map((item, index) => (
                        <Alert key={`${item.titre}-${index}`} variant={item.type === 'danger' ? 'destructive' : 'default'}>
                            <AlertTitle>{item.titre}</AlertTitle>
                            <AlertDescription>{item.texte}</AlertDescription>
                        </Alert>
                    ))}
                </CardContent>
            </Card>
        </DispoShell>
    );
}
