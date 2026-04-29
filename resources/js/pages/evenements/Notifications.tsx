import { Head } from '@inertiajs/react';
import { Bell, BellRing, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Événements', href: '/evenements' },
    { title: 'Notifications', href: '#' },
];

export default function Notifications() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Notifications
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Gérez les notifications de vos événements : alertes importantes, rappels automatiques et communications avec les participants.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Notifications envoyées</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,247</div>
                            <p className="text-xs text-muted-foreground">
                                Ce mois-ci
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
                            <BellRing className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">68%</div>
                            <p className="text-xs text-muted-foreground">
                                +5% par rapport au mois dernier
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente d'envoi</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                Notifications programmées
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications récentes</CardTitle>
                            <CardDescription>
                                Historique des notifications envoyées
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { title: 'Rappel événement', event: 'Concours Innovation 2024', type: 'rappel', sent: '2h ago', status: 'delivered' },
                                { title: 'Inscription validée', event: 'Conférence IA', type: 'confirmation', sent: '1j ago', status: 'opened' },
                                { title: 'Résultats publiés', event: 'Hackathon Design', type: 'resultat', sent: '3j ago', status: 'delivered' },
                            ].map((notification, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {notification.event} • {notification.sent}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {notification.type}
                                        </Badge>
                                        <Badge variant={notification.status === 'opened' ? 'default' : 'secondary'}>
                                            {notification.status === 'opened' ? 'Ouvert' : 'Envoyé'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions rapides</CardTitle>
                            <CardDescription>
                                Outils de gestion des notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <Bell className="mr-2 h-4 w-4" />
                                Créer une notification
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <BellRing className="mr-2 h-4 w-4" />
                                Programmer un rappel
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Voir les statistiques
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}