import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TabsContent } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Users, Calendar, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/app';
import { Election, WorkflowData, ElectionStats, TimelinePost } from '@/types';
import { getImageUrl } from '@/utils/image';
import votesRoutes from '@/routes/votes';
import WorkflowTabsLayout from '@/components/elections/WorkflowTabsLayout';

interface Props extends PageProps {
    workflow?: WorkflowData;
    stats?: ElectionStats;
    election?: Election;
    posts?: TimelinePost[];
}

export default function ResultatsVote() {
    const { workflow, stats, election, posts } = usePage<Props>().props;

    // Si on affiche une seule élection (vue détaillée)
    if (election && posts) {
        return (
            <AppLayout>
                <Head title={election.titre} />

                <div className="container mt-4 space-y-6">
                    {/* Bouton retour */}
                    <div className="mb-4">
                        <Button asChild variant="outline" className="mb-4">
                            <Link href="/resultats">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour aux élections
                            </Link>
                        </Button>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">{election.titre}</h1>
                        <p className="text-gray-600">Suivez l'évolution de cette élection</p>
                        <Badge variant="outline" className="text-sm">
                            Statut: {election.statut}
                        </Badge>
                    </div>

                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        
                        {posts.map((post, index) => (
                            <div key={index} className="relative flex items-start space-x-4 pb-8">
                                <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white ${
                                    post.type === 'resultats_publies' ? 'bg-green-500' :
                                    post.type === 'vote_ouvert' ? 'bg-blue-500' :
                                    post.type === 'vote_cloture' ? 'bg-orange-500' :
                                    post.type === 'candidats_publies' ? 'bg-purple-500' :
                                    post.type === 'liste_generee' ? 'bg-indigo-500' :
                                    'bg-gray-500'
                                }`}></div>
                                
                                <div className="flex-1 min-w-0">
                                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    {getPostIcon(post.type)}
                                                    <h3 className="font-semibold text-lg">{getPostTitle(post.type)}</h3>
                                                </div>
                                                <span className="text-sm text-gray-500">{post.date}</span>
                                            </div>
                                            {renderPostContent(post)}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Vue principale avec workflow
    return (
        <AppLayout>
            <Head title="Élections" />
            <WorkflowTabsLayout
                title="Espace Élections"
                description="Suivez l'évolution des élections en temps réel"
            >
                {/* 🟡 Candidatures ouvertes */}
                <TabsContent value="liste_generee" className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            📢 Les candidatures sont ouvertes pour ces élections. Déposez votre dossier pour devenir candidat !
                        </AlertDescription>
                    </Alert>
                    
                    {stats && (
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Badge variant="secondary" className="text-sm">
                                Total: {stats.total_elections}
                            </Badge>
                            <Badge variant="default" className="text-sm bg-green-100 text-green-800">
                                Ouvertes: {stats.ouvertes}
                            </Badge>
                            <Badge variant="secondary" className="text-sm bg-orange-100 text-orange-800">
                                Clôturées: {stats.cloturees}
                            </Badge>
                            <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-800">
                                Terminées: {stats.terminees}
                            </Badge>
                        </div>
                    )}
                    
                    {workflow?.liste_generee?.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workflow.liste_generee.map((election) => (
                                <Card key={election.id_election}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{election.titre}</CardTitle>
                                        <Badge variant="secondary">{election.type}</Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-gray-600">{election.description}</p>
                                        <div className="text-xs text-gray-500">
                                            {election.ufr?.nom} {election.filiere?.nom && `• ${election.filiere.nom}`}
                                        </div>
                                        <Button asChild className="w-full">
                                            <Link href="/candidatures/create">
                                                Candidater
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Aucune élection avec candidatures ouvertes
                        </div>
                    )}
                </TabsContent>

                {/* 🟠 Élections planifiées */}
                <TabsContent value="planifiee" className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            📋 Les candidatures sont fermées. Découvrez les candidats retenus pour ces élections.
                        </AlertDescription>
                    </Alert>
                    
                    {workflow?.planifiee?.length > 0 ? (
                        <div className="space-y-4">
                            {workflow.planifiee.map((election) => (
                                <Card key={election.id_election}>
                                    <CardHeader>
                                        <CardTitle>{election.titre}</CardTitle>
                                        <Badge variant="outline">Planifiée</Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600">{election.description}</p>
                                        
                                        {election.candidatures && election.candidatures.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Candidats retenus :</h4>
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {election.candidatures.map((candidature) => (
                                                        <div key={candidature.id_candidature} className="flex items-center gap-3 p-2 border rounded">
                                                            <img 
                                                                src={getImageUrl(candidature.user.photo)} 
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <div>
                                                                <strong className="text-sm">{candidature.user.name}</strong>
                                                                {candidature.slogan && (
                                                                    <p className="text-xs text-gray-600 italic">"{candidature.slogan}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Aucune élection planifiée
                        </div>
                    )}
                </TabsContent>

                {/* 🟢 Votes ouverts */}
                <TabsContent value="ouverte" className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            🗳️ Le vote est ouvert ! Participez aux élections en cours.
                        </AlertDescription>
                    </Alert>
                    
                    {workflow?.ouverte?.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workflow.ouverte.map((election) => (
                                <Card key={election.id_election} className="border-green-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{election.titre}</CardTitle>
                                        <Badge className={election.statut === 'second_tour' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                            {election.statut === 'second_tour' ? 'Second tour' : 'Vote ouvert'}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-gray-600">{election.description}</p>
                                        <div className="text-xs text-gray-500">
                                            Du {new Date(election.date_debut).toLocaleDateString()} au {new Date(election.date_fin).toLocaleDateString()}
                                        </div>
                                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                            <Link href={`/votes/candidats/${election.id_election}`}>
                                                Voter
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Aucun vote ouvert
                        </div>
                    )}
                </TabsContent>

                {/* 🔴 Votes clôturés */}
                <TabsContent value="cloturee" className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            🔒 Les votes sont clôturés. Les résultats seront publiés prochainement.
                        </AlertDescription>
                    </Alert>
                    
                    {workflow?.cloturee?.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workflow.cloturee.map((election) => (
                                <Card key={election.id_election} className="border-orange-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{election.titre}</CardTitle>
                                        <Badge className="bg-orange-100 text-orange-800">Vote clôturé</Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-gray-600">{election.description}</p>
                                        <div className="text-xs text-gray-500">
                                            Clôturé le {new Date(election.date_fin).toLocaleDateString()}
                                        </div>
                                        <div className="text-center text-sm text-orange-600 font-medium">
                                            📊 Résultats en attente de validation
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Aucun vote clôturé
                        </div>
                    )}
                </TabsContent>

                {/* 🏆 Résultats publiés */}
                <TabsContent value="terminee" className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            🏆 Découvrez les résultats officiels des élections terminées.
                        </AlertDescription>
                    </Alert>
                    
                    {workflow?.terminee?.length > 0 ? (
                        <div className="space-y-4">
                            {workflow.terminee.map((election) => (
                                <Card key={election.id_election} className="border-blue-200">
                                    <CardHeader>
                                        <CardTitle>{election.titre}</CardTitle>
                                        <Badge className="bg-blue-100 text-blue-800">Résultats publiés</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-600">{election.description}</p>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Terminé le {new Date(election.date_fin).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Button asChild variant="outline">
                                                <Link href={`/resultats/${election.id_election}`}>
                                                    Voir les résultats
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Aucune élection terminée
                        </div>
                    )}
                </TabsContent>
            </WorkflowTabsLayout>
        </AppLayout>
    );

    function getPostIcon(type: string) {
        switch (type) {
            case 'candidatures_ouvertes':
                return <span className="text-2xl">📢</span>;
            case 'candidats_publies':
                return <span className="text-2xl">👥</span>;
            case 'liste_generee':
                return <span className="text-2xl">📋</span>;
            case 'vote_ouvert':
                return <span className="text-2xl">🗳️</span>;
            case 'vote_cloture':
                return <span className="text-2xl">🔒</span>;
            case 'resultats_publies':
                return <span className="text-2xl">🏆</span>;
            default:
                return <span className="text-2xl">📄</span>;
        }
    }

    function getPostTitle(type: string): string {
        switch (type) {
            case 'candidatures_ouvertes':
                return 'Ouverture officielle des candidatures';
            case 'candidats_publies':
                return 'Publication de la liste officielle des candidats';
            case 'liste_generee':
                return 'Liste électorale générée - Candidatures ouvertes !';
            case 'vote_ouvert':
                return 'Le vote est maintenant ouvert !';
            case 'vote_cloture':
                return 'Le vote a été clôturé';
            case 'resultats_publies':
                return 'Résultats officiels publiés';
            default:
                return 'Mise à jour';
        }
    }

    function renderPostContent(post: any) {
        switch (post.type) {
            case 'candidatures_ouvertes':
                return (
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            Nous sommes heureux d'annoncer l'ouverture officielle des candidatures pour cette élection.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                Les candidats intéressés peuvent désormais déposer leur candidature.
                            </p>
                        </div>
                    </div>
                );

            case 'candidats_publies':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Voici la liste officielle des candidats validés pour cette élection :
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {post.candidates?.map((c: any) => (
                                <div key={c.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                                    <img 
                                        src={getImageUrl(c.photo)} 
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder.svg';
                                        }}
                                    />
                                    <div>
                                        <strong className="text-gray-900">{c.name}</strong>
                                        {c.slogan && (
                                            <p className="text-sm text-gray-600 italic">"{c.slogan}"</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'liste_generee':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            La liste électorale a été générée avec succès ! Les étudiants éligibles peuvent maintenant déposer leur candidature.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="space-y-2">
                                <p className="text-blue-800 font-medium">Candidatures ouvertes</p>
                                <p className="text-sm text-blue-700">
                                    Si vous êtes éligible et intéressé(e) à devenir candidat, veuillez contacter l'administration pour déposer votre dossier.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'vote_ouvert':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Le vote est officiellement ouvert ! Tous les électeurs éligibles peuvent maintenant participer.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-800 font-medium">Participez au vote</p>
                                    <p className="text-sm text-green-700">Votre voix compte !</p>
                                </div>
                                <Button asChild className="bg-green-600 hover:bg-green-700">
                                    <Link href={votesRoutes.candidats.url({ election: post.election_id })}>
                                        Voter maintenant
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'vote_cloture':
                return (
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            La période de vote est maintenant terminée. Nous remercions tous les électeurs pour leur participation.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-800">
                                Les résultats sont en cours de validation et seront publiés prochainement.
                            </p>
                        </div>
                    </div>
                );

            case 'resultats_publies':
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 font-bold text-center">
                                RÉSULTATS OFFICIELS PUBLIÉS
                            </p>
                            <p className="text-sm text-green-700 text-center mt-1">
                                {post.total_votes} votes exprimés
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            {post.results?.map((r: any) => (
                                <div key={r.id} className={`border rounded-lg p-4 ${
                                    r.isWinner ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'
                                }`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center space-x-2">
                                            <strong className={`text-lg ${r.isWinner ? 'text-yellow-700' : 'text-gray-900'}`}>
                                                {r.name}
                                            </strong>
                                            {r.isWinner && (
                                                <Badge className="bg-yellow-500 text-white">
                                                    ÉLU(E)
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-blue-600">{r.votes} votes</span>
                                            <span className="text-gray-500 ml-2">({r.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                r.isWinner ? 'bg-yellow-500' : 'bg-blue-600'
                                            }`}
                                            style={{ width: `${r.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return <p className="text-gray-700">{post.content}</p>;
        }
    }
}