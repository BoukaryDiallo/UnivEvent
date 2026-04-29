import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Users, Mic, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const features = [
    {
        icon: Mic,
        title: 'Gestion des Intervenants',
        description: 'Ajoutez et gérez les conférenciers et modérateurs',
    },
    {
        icon: Calendar,
        title: 'Programme Détaillé',
        description: 'Planifiez les sessions, pauses et activités',
    },
    {
        icon: Users,
        title: 'Gestion des Participants',
        description: 'Inscription et suivi des participants',
    },
    {
        icon: BookOpen,
        title: 'Contenu Structuré',
        description: 'Organisez les présentations et supports',
    },
];

export default function CreateConference() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Événements', href: '/evenements' },
        { title: 'Gestion', href: '/evenements/gestion' },
        { title: 'Créer une Conférence', href: '/evenements/gestion/conferences' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer une Conférence" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/evenements/gestion">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Créer une Conférence
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Organisez une conférence avec programme détaillé
                        </p>
                    </div>
                </div>

                {/* Fonctionnalités */}
                <div className="grid gap-6 md:grid-cols-2">
                    {features.map((feature) => (
                        <Card key={feature.title}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                        <CardDescription>{feature.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Aperçu du processus */}
                <Card>
                    <CardHeader>
                        <CardTitle>Processus de création</CardTitle>
                        <CardDescription>
                            Étapes pour créer votre conférence
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                                    1
                                </Badge>
                                <div>
                                    <p className="font-medium">Informations générales</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Titre, description, dates, lieu
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                                    2
                                </Badge>
                                <div>
                                    <p className="font-medium">Programme détaillé</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Sessions, intervenants, horaires
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                                    3
                                </Badge>
                                <div>
                                    <p className="font-medium">Affectation des rôles</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Organisateurs, intervenants, modérateurs
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                                    4
                                </Badge>
                                <div>
                                    <p className="font-medium">Validation et publication</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Aperçu final et soumission pour validation
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bouton de création */}
                <div className="flex justify-center">
                    <Button asChild size="lg" className="px-8">
                        <Link href="/evenements/create/conference">
                            <Calendar className="h-5 w-5 mr-2" />
                            Commencer la création de la conférence
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
