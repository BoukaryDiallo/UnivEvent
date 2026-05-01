import { Link } from '@inertiajs/react';
import { Crown, Settings, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { EventDetail } from '@/types';

type EventActorsManagementProps = {
    event: EventDetail;
    canManage: boolean;
    onToast: (message: string) => void;
};

export function EventActorsManagement({ event, canManage, onToast: _onToast }: EventActorsManagementProps) {
    const [search, setSearch] = useState('');
    const createur = event.createur;
    const organisateurs = event.team?.organisateur ?? [];
    const intervenants = event.team?.intervenant ?? [];
    const jury = event.team?.jury ?? [];
    const participants = event.participants ?? [];

    const actorSections = useMemo(
        () => [
            {
                title: 'Createur',
                description: 'Personne ayant cree l evenement',
                icon: Crown,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
                actors: createur ? [createur] : [],
                manageRoute: canManage ? `/evenements/${event.id}/manage#actors` : null,
            },
            {
                title: 'Organisateurs',
                description: 'Responsables de l organisation',
                icon: Users,
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                actors: organisateurs,
                manageRoute: `/evenements/${event.id}/manage#actors`,
            },
            {
                title: 'Intervenants',
                description: 'Personnes qui interviennent lors de l evenement',
                icon: Users,
                color: 'text-purple-600',
                bgColor: 'bg-purple-100',
                actors: intervenants,
                manageRoute: `/evenements/${event.id}/manage#actors`,
            },
            ...(event.type === 'concours'
                ? [
                      {
                          title: 'Jury',
                          description: 'Membres du jury pour l evaluation',
                          icon: Users,
                          color: 'text-blue-600',
                          bgColor: 'bg-blue-100',
                          actors: jury,
                          manageRoute: `/evenements/${event.id}/manage#actors`,
                      },
                  ]
                : []),
            {
                title: 'Participants',
                description: 'Personnes inscrites a l evenement',
                icon: Users,
                color: 'text-gray-600',
                bgColor: 'bg-gray-100',
                actors: participants.map((participant) => participant.user),
                manageRoute: `/evenements/${event.id}#participants`,
            },
        ],
        [canManage, createur, event.id, event.type, intervenants, jury, organisateurs, participants],
    );

    const filteredSections = useMemo(
        () =>
            actorSections.map((section) => ({
                ...section,
                actors: section.actors.filter((actor) => {
                    const haystack = `${actor?.name ?? ''} ${actor?.email ?? ''} ${actor?.role ?? ''}`.toLowerCase();
                    return haystack.includes(search.trim().toLowerCase());
                }),
            })),
        [actorSections, search],
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des acteurs</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerez les organisateurs, intervenants, jury et participants de cet evenement.
                    </p>
                </div>
                {canManage ? (
                    <Button asChild>
                        <Link href={`/evenements/${event.id}/edit`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Modifier l evenement
                        </Link>
                    </Button>
                ) : null}
            </div>

            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un acteur..." />

            <div className="grid gap-6 md:grid-cols-2">
                {filteredSections.map((section) => (
                    <Card key={section.title} className="relative">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`rounded-lg p-2 ${section.bgColor}`}>
                                        <section.icon className={`h-5 w-5 ${section.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{section.title}</CardTitle>
                                        <CardDescription>{section.description}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary">{section.actors.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {section.actors.length > 0 ? (
                                <div className="mb-4 space-y-3">
                                    {section.actors.slice(0, 3).map((actor) => (
                                        <div key={actor.id ?? `${section.title}-${actor.email ?? actor.name}`} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-sm font-medium text-blue-600">{(actor.name ?? '?').charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium">{actor.name ?? 'Utilisateur'}</div>
                                                <div className="truncate text-xs text-gray-500">{actor.email ?? 'Email indisponible'}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {section.actors.length > 3 ? <div className="text-center text-sm text-gray-500">+{section.actors.length - 3} autres</div> : null}
                                </div>
                            ) : (
                                <div className="py-4 text-center text-gray-500">Aucun {section.title.toLowerCase()}</div>
                            )}

                            {canManage && section.manageRoute ? (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={section.manageRoute}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Gerer les {section.title.toLowerCase()}
                                    </Link>
                                </Button>
                            ) : null}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Statistiques des acteurs</CardTitle>
                    <CardDescription>Apercu des differents roles dans cet evenement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{createur ? 1 : 0}</div>
                            <div className="text-sm text-gray-500">Createur</div>
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
                    {event.type === 'concours' ? (
                        <div className="mt-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{jury.length}</div>
                            <div className="text-sm text-gray-500">Membres du jury</div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
