import { Head } from '@inertiajs/react';
import { MessageSquare, Send, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Événements', href: '/evenements' },
    { title: 'Messages', href: '#' },
];

export default function Messages() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Messages
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Communiquez avec les participants de vos événements : envoyez des messages groupés, répondez aux questions et maintenez l'engagement.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages envoyés</CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">89</div>
                            <p className="text-xs text-muted-foreground">
                                Ce mois-ci
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversations actives</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">23</div>
                            <p className="text-xs text-muted-foreground">
                                Avec les organisateurs
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">7</div>
                            <p className="text-xs text-muted-foreground">
                                À traiter en priorité
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Messages récents</CardTitle>
                            <CardDescription>
                                Conversations et messages récents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { from: 'Marie Dupont', event: 'Concours Innovation 2024', message: 'Question sur les critères d\'évaluation', time: '2h ago', unread: true },
                                { from: 'Jean Martin', event: 'Conférence IA', message: 'Demande de modification du programme', time: '1j ago', unread: false },
                                { from: 'Sophie Leroy', event: 'Hackathon Design', message: 'Confirmation de participation', time: '3j ago', unread: false },
                            ].map((message, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {message.from}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {message.event} • {message.time}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                                            {message.message}
                                        </p>
                                    </div>
                                    {message.unread && (
                                        <Badge variant="destructive" className="text-xs">
                                            Non lu
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions rapides</CardTitle>
                            <CardDescription>
                                Outils de communication
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Nouveau message
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Message groupé
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Send className="mr-2 h-4 w-4" />
                                Répondre aux messages
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}