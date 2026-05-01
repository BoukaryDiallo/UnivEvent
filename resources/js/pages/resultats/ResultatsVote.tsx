import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Users, 
    Calendar, 
    CheckCircle, 
    Clock, 
    FileText, 
    TrendingUp,
    UserPlus,
    BarChart3,
    Trophy,
    Eye,
    Edit,
    Trash2,
    Plus,
    ArrowRight,
    ArrowLeft,
    UserCheck,
    List,
    Vote,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import type { Election, WorkflowData, ElectionStats } from '@/types/election';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import candidaturesRoutes from '@/routes/candidatures';
import votesRoutes from '@/routes/votes';
import resultatsRoutes from '@/routes/resultats';
import ResultatsOfficiels from '@/components/resultats/ResultatsOfficiels';

interface TimelinePost {
    id: number;
    author: string;
    content: string;
    created_at: string;
}

interface Props {
    workflow?: WorkflowData;
    stats?: ElectionStats;
    election?: Election;
    posts?: TimelinePost[];
    resultatsOfficiels?: any;
    resultatsBrouillons?: any;
    resultatsAffiches?: any;
    totalVotes?: number;
    totalVoters?: number;
    participationRate?: number;
    showPublishButton?: boolean;
    etatResultats?: {
        winner: any;
        secondTourNeeded: boolean;
        equality: boolean;
        majority: boolean;
        type: 'elected' | 'second_tour' | 'no_majority' | 'no_results';
    };
}

export default function ResultatsVote() {
    const { workflow, stats, election, posts, resultatsAffiches, totalVotes, totalVoters, participationRate, showPublishButton, etatResultats } = usePage<Props>().props;

    // Si on affiche une seule élection (vue détaillée)
    if (election && resultatsAffiches) {
        return (
            <AppLayout>
                <Head title={`Résultats - ${election.titre}`} />

                <div className="container mt-4 space-y-6">
                    {/* Bouton retour */}
                    <div className="mb-4">
                        <Link href="/espace-elections" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour aux élections
                        </Link>
                    </div>

                    {/* Composant des résultats officiels */}
                    <ResultatsOfficiels
                        election={election}
                        resultats={resultatsAffiches}
                        totalVotes={totalVotes || 0}
                        totalVoters={totalVoters || 0}
                        participationRate={participationRate || 0}
                        showPublishButton={showPublishButton}
                        etatResultats={etatResultats}
                    />
                </div>
            </AppLayout>
        );
    }

    // Vue principale avec sections (sans onglets)
    
    // Définition des fonctions pour les boutons
   const handleCandidater = (election: Election) => {
        console.log("🚀 handleCandidater appelé");
        console.log("📋 Élection reçue:", election);
        console.log("🆔 ID élection:", election.id_election);
        
        // Vérifier les routes Wayfinder
        console.log("🔍 Routes candidatures:", candidaturesRoutes);
        console.log("🔍 Routes create:", candidaturesRoutes.create);
        console.log("🔍 Routes create.election:", candidaturesRoutes.create?.election);
        
        // Générer l'URL
        const url = candidaturesRoutes.create.election.url({ election: election.id_election });
        console.log("🌐 URL générée:", url);
        console.log("🌐 Type d'URL:", typeof url);
        
        // Vérifier router
        console.log("🔧 Router disponible:", typeof router);
        console.log("🔧 Router visit:", typeof router.visit);
        
        console.log("📡 Tentative de redirection vers:", url);
        
        try {
            router.visit(url);
            console.log("✅ router.visit appelé avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de router.visit:", error);
        }
    };

    const handleVoter = (election: Election) => {
        router.visit(votesRoutes.candidats.url({ election: election.id_election }));
    };

    const handleVoirResultats = (election: Election) => {
        router.visit(resultatsRoutes.show.url({ election: election.id_election }));
    };

    const handleVoterSecondTour = (election: Election) => {
        router.visit(votesRoutes.candidats.url({ election: election.id_election }));
    };

    return (
        <AppLayout>
            <Head title="Espace Élections" />
            
            {/* Header principal */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Espace Élections</h1>
                        <p className="text-xl mb-8 text-blue-100">Participez à la vie démocratique de votre université</p>
                        
                        {/* Statistiques principales */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <Users className="h-12 w-12 mx-auto mb-3 text-blue-200" />
                                    <div className="text-3xl font-bold">{stats.total_elections}</div>
                                    <div className="text-blue-100">Élections totales</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-200" />
                                    <div className="text-3xl font-bold">{stats.ouvertes}</div>
                                    <div className="text-green-100">Élections actives</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                    <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-200" />
                                    <div className="text-3xl font-bold">{stats.terminees || 0}</div>
                                    <div className="text-yellow-100">Élections terminées</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenu principal - Sections sans onglets */}
            <div className="container mx-auto px-4 py-8 space-y-12">
                
                {/* 🟡 Section Candidatures ouvertes */}
                {workflow?.liste_generee && workflow.liste_generee.length > 0 && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold text-blue-800">Candidatures ouvertes</h3>
                                    <p className="text-blue-600 text-sm">Déposez votre dossier pour devenir candidat</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workflow.liste_generee.map((election: Election) => (
                                <Card key={election.id_election} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{election.titre}</CardTitle>
                                                <Badge variant="secondary" className="mt-1">
                                                    {election.type}
                                                </Badge>
                                            </div>
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                Candidatures
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600 text-sm">{election.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Fin: {new Date(election.date_fin).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Limite: {new Date(election.date_fin_candidatures).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleCandidater(election)}
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Candidater
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🟢 Section Élections ouvertes au vote */}
                {workflow?.ouverte && workflow.ouverte.length > 0 && (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Vote className="h-6 w-6 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-green-800">Élections ouvertes au vote</h3>
                                    <p className="text-green-600 text-sm">Votez maintenant pour les candidats de votre choix</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workflow.ouverte.map((election: Election) => (
                                <Card key={election.id_election} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{election.titre}</CardTitle>
                                                <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                                                    {election.type}
                                                </Badge>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {election.statut}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600 text-sm">{election.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Fin: {new Date(election.date_fin).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{election.candidatures?.length || 0} candidats</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleVoter(election)}
                                            >
                                                <Vote className="h-4 w-4 mr-2" />
                                                Voter
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🏆 Section Résultats officiels publiés */}
                {workflow?.terminee && workflow.terminee.length > 0 && (
                    <div className="space-y-6">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6 text-purple-600" />
                                <div>
                                    <h3 className="font-semibold text-purple-800">Résultats officiels publiés</h3>
                                    <p className="text-purple-600 text-sm">Consultez les résultats des élections terminées</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workflow.terminee.map((election: Election) => (
                                <Card key={election.id_election} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{election.titre}</CardTitle>
                                                <Badge variant="default" className="mt-1 bg-purple-100 text-purple-800">
                                                    {election.type}
                                                </Badge>
                                            </div>
                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                Terminée
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600 text-sm">{election.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Terminée: {new Date(election.date_fin).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>{election.candidatures?.length || 0} candidats</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                onClick={() => handleVoirResultats(election)}
                                            >
                                                <Trophy className="h-4 w-4 mr-2" />
                                                Voir résultats
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🔄 Section Élections en second tour */}
                {workflow?.ouverte && workflow.ouverte.filter((e: Election) => e.statut === 'second_tour').length > 0 && (
                    <div className="space-y-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                                <div>
                                    <h3 className="font-semibold text-orange-800">Élections en second tour</h3>
                                    <p className="text-orange-600 text-sm">Votez pour le second tour des élections</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workflow.ouverte.filter((e: Election) => e.statut === 'second_tour').map((election: Election) => (
                                <Card key={election.id_election} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{election.titre}</CardTitle>
                                                <Badge variant="default" className="mt-1 bg-orange-100 text-orange-800">
                                                    Second Tour
                                                </Badge>
                                            </div>
                                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                                {election.statut}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600 text-sm">{election.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Fin: {new Date(election.date_fin).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{election.candidatures?.length || 0} candidats</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                                onClick={() => handleVoterSecondTour(election)}
                                            >
                                                <Vote className="h-4 w-4 mr-2" />
                                                Voter (2ème tour)
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message si aucune élection disponible */}
                {(!workflow?.liste_generee || workflow.liste_generee.length === 0) &&
                 (!workflow?.ouverte || workflow.ouverte.length === 0) &&
                 (!workflow?.terminee || workflow.terminee.length === 0) && (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune élection disponible</h3>
                        <p className="text-gray-500">Revenez plus tard pour les prochaines élections</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
