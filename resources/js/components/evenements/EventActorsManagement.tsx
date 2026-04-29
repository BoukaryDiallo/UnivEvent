import { Link } from '@inertiajs/react';
import { Users, UserPlus, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EventDetail } from '@/types';

type EventActorsManagementProps = {
    event: EventDetail;
    canManage: boolean;
    onToast: (message: string) => void;
};

export function EventActorsManagement({ event, canManage, onToast }: EventActorsManagementProps) {
    const assignments = event.assignments || [];
    const createur = event.createur;

    const organisateurs = assignments.filter(a => a.role === 'organisateur');
    const intervenants = assignments.filter(a => a.role === 'intervenant');
    const jury = assignments.filter(a => a.role === 'jury');
    const participants = assignments.filter(a => a.role === 'participant');

    const actorSections = [
        {
            title: 'Créateur',
            description: 'Personne ayant créé l\'événement',
            icon: Crown,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            actors: createur ? [createur] : [],
            manageRoute: null,
        },
        {
            title: 'Organisateurs',
            description: 'Responsables de l\'organisation',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            actors: organisateurs.map(a => a.user),
            manageRoute: `/evenements/${event.id}/organisateurs`,
        },
        {
            title: 'Intervenants',
            description: 'Personnes qui interviennent lors de l\'événement',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            actors: intervenants.map(a => a.user),
            manageRoute: `/evenements/${event.id}/intervenants`,
        },
        ...(event.type === 'concours' ? [{
            title: 'Jury',
            description: 'Membres du jury pour l\'évaluation',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            actors: jury.map(a => a.user),
            manageRoute: `/evenements/${event.id}/jury`,
        }] : []),
        {
            title: 'Participants',
            description: 'Personnes inscrites à l\'événement',
            icon: Users,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            actors: participants.map(a => a.user),
            manageRoute: `/evenements/${event.id}/participants`,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gestion des acteurs
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez les organisateurs, intervenants, jury et participants de cet événement.
                    </p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href={`/evenements/${event.id}/edit`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Modifier l'événement
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {actorSections.map((section) => (
                    <Card key={section.title} className="relative">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                                        <section.icon className={`w-5 h-5 ${section.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{section.title}</CardTitle>
                                        <CardDescription>{section.description}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    {section.actors.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {section.actors.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                    {section.actors.slice(0, 3).map((actor) => (
                                        <div key={actor.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {(actor.name ?? '?').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{actor.name ?? 'Utilisateur'}</div>
                                                <div className="text-xs text-gray-500 truncate">{actor.email ?? 'Email indisponible'}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {section.actors.length > 3 && (
                                        <div className="text-sm text-gray-500 text-center">
                                            +{section.actors.length - 3} autres
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Aucun {section.title.toLowerCase()}
                                </div>
                            )}

                            {canManage && section.manageRoute && (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={section.manageRoute}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Gérer les {section.title.toLowerCase()}
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Statistiques */}
            <Card>
                <CardHeader>
                    <CardTitle>Statistiques des acteurs</CardTitle>
                    <CardDescription>
                        Aperçu des différents rôles dans cet événement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{createur ? 1 : 0}</div>
                            <div className="text-sm text-gray-500">Créateur</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{organisateurs.length}</div>
                            <div className="text-sm text-gray-500">Organisateurs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{intervenants.length}</div>
                            <div className="text-sm text-gray-500">Intervenants</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{participants.length}</div>
                            <div className="text-sm text-gray-500">Participants</div>
                        </div>
                    </div>
                    {event.type === 'concours' && (
                        <div className="mt-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{jury.length}</div>
                            <div className="text-sm text-gray-500">Membres du jury</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
