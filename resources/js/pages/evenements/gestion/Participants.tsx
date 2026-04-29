import { Head } from '@inertiajs/react';
import { UserCheck, Users, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Événements', href: '/evenements' },
    { title: 'Gestion des participants', href: '#' },
];

export default function Participants() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des participants" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Gestion des participants
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Gérez les inscriptions aux événements : validez les demandes, suivez les présences et communiquez avec les participants.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Participants inscrits</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">247</div>
                            <p className="text-xs text-muted-foreground">
                                +15% par rapport au mois dernier
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inscriptions validées</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">189</div>
                            <p className="text-xs text-muted-foreground">
                                76% de taux d'acceptation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente de validation</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">58</div>
                            <p className="text-xs text-muted-foreground">
                                À traiter dans les 24h
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>Demandes récentes</CardTitle>
                                    <CardDescription>
                                        Inscriptions en attente de validation
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher..."
                                            className="pl-8 w-50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Alice Dupont', event: 'Concours Innovation 2024', role: 'Étudiant', status: 'pending' },
                                { name: 'Bob Martin', event: 'Conférence IA', role: 'Enseignant', status: 'pending' },
                                { name: 'Claire Leroy', event: 'Hackathon Design', role: 'Étudiant', status: 'approved' },
                            ].map((participant, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {participant.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {participant.event} • {participant.role}
                                        </p>
                                    </div>
                                    <Badge variant={participant.status === 'approved' ? 'default' : 'secondary'}>
                                        {participant.status === 'approved' ? 'Accepté' : 'En attente'}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions rapides</CardTitle>
                            <CardDescription>
                                Outils de gestion des participants
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Valider les inscriptions
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Gérer les présences
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Communiquer avec les participants
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}