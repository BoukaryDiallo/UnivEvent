import { Head } from '@inertiajs/react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Événements', href: '/module5/events' },
    { title: 'Gestion des organisateurs', href: '#' },
];

export default function Organisateurs() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des organisateurs" />

            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Gestion des organisateurs
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Gérez les organisateurs de vos événements : affectez des rôles, suivez les activités et maintenez la coordination.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Organisateurs actifs</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                +2 depuis la semaine dernière
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Événements gérés</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">
                                3 conférences, 5 concours
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente de validation</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">
                                Nouveaux organisateurs
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organisateurs récents</CardTitle>
                            <CardDescription>
                                Liste des organisateurs ajoutés récemment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Marie Dupont', role: 'Enseignant', events: 3, status: 'active' },
                                { name: 'Jean Martin', role: 'Organisateur', events: 1, status: 'pending' },
                                { name: 'Sophie Leroy', role: 'Admin', events: 5, status: 'active' },
                            ].map((organizer, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {organizer.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {organizer.role} • {organizer.events} événements
                                        </p>
                                    </div>
                                    <Badge variant={organizer.status === 'active' ? 'default' : 'secondary'}>
                                        {organizer.status === 'active' ? 'Actif' : 'En attente'}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions rapides</CardTitle>
                            <CardDescription>
                                Outils de gestion des organisateurs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Ajouter un organisateur
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Valider les demandes
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <UserX className="mr-2 h-4 w-4" />
                                Révoquer des droits
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
