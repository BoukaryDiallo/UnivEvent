import { Head } from '@inertiajs/react';
import { Award, Users, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Événements', href: '/evenements' },
    { title: 'Gestion du jury', href: '#' },
];

export default function Jury() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion du jury" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Gestion du jury
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Constituez et gérez les jurys de vos concours : sélectionnez les membres, définissez les critères d'évaluation et suivez les délibérations.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Membres de jury actifs</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">15</div>
                            <p className="text-xs text-muted-foreground">
                                8 présidents, 7 membres
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Concours en cours</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">
                                2 en notation, 2 en délibération
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Évaluations terminées</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                Ce mois-ci
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jurys récents</CardTitle>
                            <CardDescription>
                                Liste des jurys constitués récemment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Concours Innovation 2024', president: 'Dr. Marie Dupont', members: 5, status: 'notation' },
                                { name: 'Hackathon IA', president: 'Prof. Jean Martin', members: 3, status: 'deliberation' },
                                { name: 'Concours Design', president: 'Mme Sophie Leroy', members: 4, status: 'termine' },
                            ].map((jury, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {jury.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Président: {jury.president} • {jury.members} membres
                                        </p>
                                    </div>
                                    <Badge variant={
                                        jury.status === 'termine' ? 'default' :
                                        jury.status === 'notation' ? 'secondary' : 'outline'
                                    }>
                                        {jury.status === 'termine' ? 'Terminé' :
                                         jury.status === 'notation' ? 'Notation' : 'Délibération'}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions rapides</CardTitle>
                            <CardDescription>
                                Outils de gestion des jurys
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Constituer un jury
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Award className="mr-2 h-4 w-4" />
                                Définir les critères
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Ouvrir la notation
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}