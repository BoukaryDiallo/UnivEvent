import { Head, usePage, router } from '@inertiajs/react';
import { 
    Users, 
    Calendar, 
    TrendingUp, 
    Award, 
    BarChart3, 
    Settings,
    ChevronRight,
    Activity,
    UserCheck,
    FileText,
    Eye
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import ElectionAdminCandidatures from '@/components/elections/admin/ElectionAdminCandidatures';
import ElectionAdminDepouillement from '@/components/elections/admin/ElectionAdminDepouillement';
import ElectionAdminInformations from '@/components/elections/admin/ElectionAdminInformations';
import ElectionAdminLayout from '@/components/elections/admin/ElectionAdminLayout';
import ElectionAdminResultats from '@/components/elections/admin/ElectionAdminResultats';
import ElectionAdminVote from '@/components/elections/admin/ElectionAdminVote';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { index as candidaturesIndex } from '@/routes/candidatures';
import { calculer as depouillementCalculer, etat as depouillementEtat } from '@/routes/depouillement';
import { ouvrir as electionsOuvrir, cloturer as electionsCloturer } from '@/routes/elections';
import { show as resultatsShow } from '@/routes/resultats';
import votes from '@/routes/votes';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    statut: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Candidature {
    id_candidature: number;
    programme: string;
    statut: string;
    user: { name: string; email: string };
}

interface Props {
    election: Election;
    totalVotes: number;
    totalVoters: number;
    totalCandidatures: number;
    candidaturesValidees: Candidature[];
    resultatsDepouillement: any;
}

export default function ElectionAdmin() {
    const props = usePage<Props>().props;
    const { election, totalVotes, totalVoters, totalCandidatures, candidaturesValidees, resultatsDepouillement } = props;
    const { confirm, ConfirmDialog } = useConfirmDialog();

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['election', 'totalVotes', 'totalVoters', 'totalCandidatures', 'candidaturesValidees'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const stats = useMemo(() => {
        const participationRate = totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0;

        return {
            totalVotes,
            totalVoters,
            totalCandidatures,
            candidaturesValidees: candidaturesValidees.length,
            participationRate,
        };
    }, [totalVotes, totalVoters, totalCandidatures, candidaturesValidees]);

    const handleOuvrir = () => {
        confirm({
            title: 'Ouvrir l\'élection',
            description: 'Êtes-vous sûr de vouloir ouvrir cette élection ?',
            onConfirm: () => router.visit(electionsOuvrir.url({ election: election.id_election })),
            variant: 'default'
        });
    };

    const handleCloturer = () => {
        confirm({
            title: 'Clôturer l\'élection',
            description: 'Êtes-vous sûr de vouloir clôturer cette élection ?',
            onConfirm: () => router.post(electionsCloturer.url({ election: election.id_election })),
            variant: 'destructive'
        });
    };

    const handleGenererListe = () => router.get(`/elections/${election.id_election}/generer-liste`);
    const handleVoirListe = () => router.get(`/elections/${election.id_election}/liste-electorale`);
    const handleCloturerCandidatures = () => router.post(`/elections/${election.id_election}/cloturer-candidatures`);
    const handleDepouiller = () => {
        confirm({
            title: 'Dépouiller l\'élection',
            description: 'Êtes-vous sûr de vouloir dépouiller cette élection ? Cette action calculera les résultats définitifs et ne pourra être annulée.',
            onConfirm: () => {
                const url = depouillementCalculer.url({ election: election.id_election });
                router.post(url, {}, {
                    onSuccess: () => {
                        // Redirection automatique vers la page de dépouillement
                        router.get(`/depouillement/${election.id_election}/results`);
                    }
                });
            },
            variant: 'default'
        });
    };
    const handleConfigurerSecondTour = () => router.get(`/elections/${election.id_election}/second-tour`);
    const handleVoirResultatsDepouillement = () => router.get(`/depouillement/${election.id_election}/results`);

    // Fonction pour obtenir la couleur du statut
    const getStatusColor = (statut: string) => {
        switch (statut) {
            case 'ouverte': return 'bg-green-500';
            case 'cloturee': return 'bg-red-500';
            case 'second_tour': return 'bg-orange-500';
            case 'planifiee': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    // Fonction pour obtenir le texte du statut
    const getStatusText = (statut: string) => {
        switch (statut) {
            case 'ouverte': return 'En cours';
            case 'cloturee': return 'Clôturée';
            case 'second_tour': return 'Second tour';
            case 'planifiee': return 'Planifiée';
            default: return statut;
        }
    };

    return (
        <AppLayout>
            <Head title={`Administration - ${election.titre}`} />
            
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="text-white hover:bg-white/20"
                                >
                                    <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                                    Retour
                                </Button>
                                <Badge className={`${getStatusColor(election.statut)} text-white border-none`}>
                                    {getStatusText(election.statut)}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{election.titre}</h1>
                            {election.description && (
                                <p className="text-blue-100 max-w-2xl">{election.description}</p>
                            )}
                        </div>
                        
                        {/* Actions rapides */}
                        <div className="flex gap-2">
                            {election.statut === 'planifiee' && (
                                <Button
                                    onClick={handleOuvrir}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <Activity className="h-4 w-4 mr-2" />
                                    Ouvrir
                                </Button>
                            )}
                            {(election.statut === 'ouverte' || election.statut === 'second_tour') && (
                                <Button
                                    onClick={handleCloturer}
                                    variant="destructive"
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Clôturer
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="container mx-auto px-6 -mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Votes</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Électeurs</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalVoters}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <UserCheck className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Candidats</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.candidaturesValidees}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Award className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Participation</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.participationRate}%</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Informations supplémentaires */}
                <Card className="bg-white shadow-lg border-0 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Période électorale
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Début</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(election.date_debut).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Fin</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(election.date_fin).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        </div>
                        {election.type && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-medium text-gray-600 mb-1">Portée</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {election.type === 'ufr' && election.ufr
                                        ? `UFR: ${election.ufr.nom}`
                                        : election.type === 'promotion' && election.filiere
                                        ? `Promotion: ${election.filiere.nom}`
                                        : 'Générale'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Onglets */}
            <div className="container mx-auto px-6 pb-8">
                <ElectionAdminLayout
                    election={election}
                    onBack={() => window.history.back()}
                >
                    <TabsContent value="informations">
                        <ElectionAdminInformations
                            election={election}
                            onGenererListe={handleGenererListe}
                            onVoirListe={handleVoirListe}
                            onCloturerCandidatures={handleCloturerCandidatures}
                            onOuvrir={handleOuvrir}
                            onCloturer={handleCloturer}
                        />
                    </TabsContent>

                    <TabsContent value="candidatures">
                        <ElectionAdminCandidatures
                            candidatures={candidaturesValidees}
                            totalCandidatures={totalCandidatures}
                            candidaturesIndexUrl={candidaturesIndex.url()}
                        />
                    </TabsContent>

                    <TabsContent value="vote">
                        <ElectionAdminVote
                            stats={stats}
                            electionId={election.id_election}
                            candidatsUrl={votes.candidats.url({ election: election.id_election })}
                            voteLiveUrl={votes.live.show.url({ election: election.id_election })}
                        />
                    </TabsContent>

                    <TabsContent value="resultats">
                        <ElectionAdminResultats
                            electionStatut={election.statut}
                            resultatsUrl={resultatsShow.url({ election: election.id_election })}
                        />
                    </TabsContent>

                    <TabsContent value="depouillement">
                        <ElectionAdminDepouillement
                            election={election}
                            stats={stats}
                            onDepouiller={handleDepouiller}
                            onVoirResultatsDepouillement={handleVoirResultatsDepouillement}
                            onConfigurerSecondTour={handleConfigurerSecondTour}
                            resultatsUrl={resultatsShow.url({ election: election.id_election })}
                            resultatsDepouillement={resultatsDepouillement}
                        />
                    </TabsContent>
                </ElectionAdminLayout>
            </div>
            
            <ConfirmDialog />
        </AppLayout>
    );
}
