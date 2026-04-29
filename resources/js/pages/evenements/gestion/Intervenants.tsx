import { Head } from '@inertiajs/react';
import { Mic, Users, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Événements', href: '/evenements' },
    { title: 'Gestion des intervenants', href: '#' },
];

export default function Intervenants() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des intervenants" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Gestion des intervenants
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Organisez les intervenants de vos événements : planifiez les interventions, gérez les plannings et coordonnez les présentations.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Intervenants actifs</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">23</div>
                            <p className="text-xs text-muted-foreground">
                                12 enseignants, 11 externes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Interventions planifiées</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45</div>
                            <p className="text-xs text-muted-foreground">
                                Ce trimestre
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmations reçues</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">38</div>
                            <p className="text-xs text-muted-foreground">
                                84% de taux de confirmation
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Intervenants récents</CardTitle>
                            <CardDescription>
                                Liste des intervenants ajoutés récemment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Dr. Marie Dupont', specialty: 'Intelligence Artificielle', events: 3, status: 'confirmed' },
                                { name: 'Prof. Jean Martin', specialty: 'Data Science', events: 2, status: 'pending' },
                                { name: 'Mme Sophie Leroy', specialty: 'UX Design', events: 1, status: 'confirmed' },
                            ].map((intervenant, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {intervenant.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {intervenant.specialty} • {intervenant.events} interventions
                                        </p>
                                    </div>
                                    <Badge variant={intervenant.status === 'confirmed' ? 'default' : 'secondary'}>
                                        {intervenant.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions rapides</CardTitle>
                            <CardDescription>
                                Outils de gestion des intervenants
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Ajouter un intervenant
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Calendar className="mr-2 h-4 w-4" />
                                Planifier une intervention
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Mic className="mr-2 h-4 w-4" />
                                Préparer les supports
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}