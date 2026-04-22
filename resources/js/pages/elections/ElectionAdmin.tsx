import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import {
    Users,
    Vote,
    Trophy,
    BarChart3,
    Radio,
    Settings,
    Calendar,
    MapPin,
    UserCheck,
    TrendingUp
} from 'lucide-react';
import { admin as electionsAdmin, ouvrir as electionsOuvrir, cloturer as electionsCloturer } from '@/routes/elections';
import votes from '@/routes/votes';
import { index as candidaturesIndex, create as candidaturesCreate } from '@/routes/candidatures';
import { show as resultatsShow } from '@/routes/resultats';
import { depouiller as depouillementDepouiller } from '@/routes/depouillement';
import { router } from '@inertiajs/react';
import type { PageProps } from '@/types/app';

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

interface Props extends PageProps {
    election: Election;
    totalVotes: number;
    totalVoters: number;
    totalCandidatures: number;
    candidaturesValidees: Candidature[];
}

export default function ElectionAdmin() {
    const { election } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState('informations');

    // État pour les données dynamiques
    const [stats, setStats] = useState({
        totalVotes: 0,
        totalVoters: 0,
        totalCandidatures: 0,
        candidaturesValidees: 0,
        participationRate: 0,
    });
    const [candidatures, setCandidatures] = useState<Candidature[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Récupérer les statistiques en temps réel (toutes les 2 secondes)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/elections/${election.id_election}/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
            }
        };

        // Charger les stats au montage du composant
        fetchStats();
        setIsLoading(false);

        // Rafraîchir les stats toutes les 2 secondes
        const interval = setInterval(fetchStats, 2000);

        return () => clearInterval(interval);
    }, [election.id_election]);

    // Récupérer les candidatures validées en temps réel (toutes les 3 secondes)
    useEffect(() => {
        const fetchCandidatures = async () => {
            try {
                const response = await fetch(`/api/elections/${election.id_election}/candidatures`);
                if (response.ok) {
                    const data = await response.json();
                    setCandidatures(data.data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des candidatures:', error);
            }
        };

        // Charger les candidatures au montage du composant
        fetchCandidatures();

        // Rafraîchir les candidatures toutes les 3 secondes
        const interval = setInterval(fetchCandidatures, 3000);

        return () => clearInterval(interval);
    }, [election.id_election]);

    const handleOuvrir = () => {
        if (confirm('Êtes-vous sûr de vouloir ouvrir cette élection ?')) {
            router.post(electionsOuvrir.url({ election: election.id_election }));
        }
    };

    const handleCloturer = () => {
        if (confirm('Êtes-vous sûr de vouloir clôturer cette élection ?')) {
            router.post(electionsCloturer.url({ election: election.id_election }));
        }
    };

    const handleGenererListe = () => {
        router.get(`/elections/${election.id_election}/generer-liste`);
    };

    const handleVoirListe = () => {
        router.get(`/elections/${election.id_election}/liste-electorale`);
    };

    const handleDepouiller = () => {
        if (confirm('Êtes-vous sûr de vouloir dépouiller cette élection ?')) {
            router.post(depouillementDepouiller.url({ election: election.id_election }));
        }
    };

    const handleConfigurerSecondTour = () => {
        if (confirm('Êtes-vous sûr de vouloir configurer un second tour pour cette élection ?')) {
            router.get(`/elections/${election.id_election}/second-tour`);
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'brouillon':
                return <Badge variant="secondary">Brouillon</Badge>;
            case 'liste_generee':
                return <Badge variant="default" className="bg-blue-500">Liste générée</Badge>;
            case 'ouverte':
                return <Badge variant="default" className="bg-green-500">Ouverte</Badge>;
            case 'second_tour':
                return <Badge variant="default" className="bg-orange-500">Second tour</Badge>;
            case 'terminee':
                return <Badge variant="destructive">Terminée</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const tabs = [
        { id: 'informations', label: 'Informations', icon: Settings },
        { id: 'candidatures', label: 'Candidatures', icon: Users },
        { id: 'vote', label: 'Vote', icon: Vote },
        { id: 'resultats', label: 'Résultats', icon: Trophy },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'live', label: 'Live', icon: Radio },
    ];

    return (
        <AppLayout>
            <Head title={`Administration - ${election.titre}`} />
            <div className="container mt-5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{election.titre}</h1>
                        <p className="text-gray-600 mt-1">{election.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatutBadge(election.statut)}
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Retour
                        </Button>
                    </div>
                </div>

                {/* Navigation par onglets */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenu des onglets conditionnel */}
                {activeTab === 'informations' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <p className="text-lg">{election.type === 'ufr' ? 'UFR' : 'Promotion'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Statut</label>
                                    <div className="text-lg">{getStatutBadge(election.statut)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date de début</label>
                                    <p className="text-lg flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(election.date_debut).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date de fin</label>
                                    <p className="text-lg flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(election.date_fin).toLocaleDateString()}
                                    </p>
                                </div>
                                {election.ufr && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">UFR</label>
                                        <p className="text-lg flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {election.ufr.nom}
                                        </p>
                                    </div>
                                )}
                                {election.filiere && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Filière</label>
                                        <p className="text-lg flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {election.filiere.nom}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-3">Actions administratives</h3>
                                <div className="flex flex-wrap gap-2">
                                    {/* Actions disponibles uniquement en brouillon */}
                                    {election.statut === 'brouillon' && (
                                        <>
                                            <Button onClick={handleGenererListe} variant="outline">
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Générer liste électorale
                                            </Button>
                                            <Button onClick={handleVoirListe} variant="outline">
                                                <Users className="h-4 w-4 mr-2" />
                                                Voir liste électorale
                                            </Button>
                                        </>
                                    )}

                                    {/* Actions disponibles uniquement quand liste est générée */}
                                    {election.statut === 'liste_generee' && (
                                        <>
                                            <Button onClick={handleVoirListe} variant="outline">
                                                <Users className="h-4 w-4 mr-2" />
                                                Voir liste électorale
                                            </Button>
                                            <Button onClick={handleOuvrir} className="bg-green-600 hover:bg-green-700">
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Ouvrir l'élection
                                            </Button>
                                        </>
                                    )}

                                    {/* Actions disponibles uniquement quand l'élection est ouverte */}
                                    {election.statut === 'ouverte' && (
                                        <>
                                            <Button onClick={handleVoirListe} variant="outline">
                                                <Users className="h-4 w-4 mr-2" />
                                                Voir liste électorale
                                            </Button>
                                            <Button onClick={handleCloturer} variant="destructive">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Clôturer l'élection
                                            </Button>
                                        </>
                                    )}

                                    {/* Actions disponibles uniquement quand l'élection est terminée */}
                                    {election.statut === 'terminee' && (
                                        <>
                                            <Button onClick={handleDepouiller} className="bg-blue-600 hover:bg-blue-700">
                                                <Trophy className="h-4 w-4 mr-2" />
                                                Dépouiller l'élection
                                            </Button>
                                            <Button onClick={handleConfigurerSecondTour} variant="outline">
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Configurer second tour
                                            </Button>
                                        </>
                                    )}

                                    {/* Actions disponibles pour tous les statuts */}
                                    <Button onClick={handleVoirListe} variant="outline">
                                        <Users className="h-4 w-4 mr-2" />
                                        Voir liste électorale
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'candidatures' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Candidatures ({stats.totalCandidatures})</CardTitle>
                            <Button asChild>
                                <a href={candidaturesCreate.url()}>
                                    Ajouter une candidature
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {candidatures.length > 0 ? (
                                <div className="space-y-4">
                                    {candidatures.map((candidature) => (
                                        <div key={candidature.id_candidature} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{candidature.user.name}</h4>
                                                    <p className="text-sm text-gray-600">{candidature.user.email}</p>
                                                    {candidature.programme && (
                                                        <p className="text-sm mt-2">{candidature.programme}</p>
                                                    )}
                                                </div>
                                                <Badge variant="default">Validée</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Aucune candidature validée pour le moment.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="mt-4">
                                <Button variant="outline" asChild className="w-full">
                                    <a href={candidaturesIndex.url()}>
                                        Voir toutes les candidatures
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'vote' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion du vote</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">{stats.totalVoters}</div>
                                    <div className="text-sm text-gray-600">Électeurs inscrits</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">{stats.totalVotes}</div>
                                    <div className="text-sm text-gray-600">Votes exprimés</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600">{stats.participationRate}%</div>
                                    <div className="text-sm text-gray-600">Participation</div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-3">Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild>
                                        <a href={votes.candidats.url({ election: election.id_election })}>
                                            <Vote className="h-4 w-4 mr-2" />
                                            Voir les candidats
                                        </a>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href={votes.live.show.url({ election: election.id_election })}>
                                            <Radio className="h-4 w-4 mr-2" />
                                            Vote en direct
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'resultats' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Résultats de l'élection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {election.statut === 'terminee' ? (
                                <div className="space-y-4">
                                    <Alert>
                                        <AlertDescription>
                                            L'élection est terminée. Vous pouvez consulter les résultats détaillés.
                                        </AlertDescription>
                                    </Alert>
                                    <Button asChild className="w-full">
                                        <a href={resultatsShow.url({ election: election.id_election })}>
                                            <Trophy className="h-4 w-4 mr-2" />
                                            Voir les résultats détaillés
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Les résultats seront disponibles après la fin de l'élection.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'dashboard' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tableau de bord administratif</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Statistiques (En temps réel)</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Total candidatures:</span>
                                            <span className="font-semibold">{stats.totalCandidatures}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Candidatures validées:</span>
                                            <span className="font-semibold text-green-600">{stats.candidaturesValidees}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taux de participation:</span>
                                            <span className="font-semibold">{stats.participationRate}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Actions rapides</h3>
                                    <div className="space-y-2">
                                        {election.statut === 'preparation' && (
                                            <Button onClick={handleOuvrir} className="w-full">
                                                Ouvrir l'élection
                                            </Button>
                                        )}
                                        {election.statut === 'ouverte' && (
                                            <Button onClick={handleCloturer} variant="destructive" className="w-full">
                                                Clôturer l'élection
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={handleGenererListe} className="w-full">
                                            Générer liste électorale
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'live' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Vote en temps réel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <AlertDescription>
                                    Accédez au suivi en temps réel du vote pour cette élection.
                                </AlertDescription>
                            </Alert>
                            <Button asChild className="w-full mt-4">
                                <a href={votes.live.show.url({ election: election.id_election })}>
                                    <Radio className="h-4 w-4 mr-2" />
                                    Ouvrir le suivi en direct
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
