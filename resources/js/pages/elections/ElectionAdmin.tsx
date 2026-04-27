import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import ElectionAdminLayout from '@/components/elections/admin/ElectionAdminLayout';
import ElectionAdminInformations from '@/components/elections/admin/ElectionAdminInformations';
import ElectionAdminCandidatures from '@/components/elections/admin/ElectionAdminCandidatures';
import ElectionAdminVote from '@/components/elections/admin/ElectionAdminVote';
import ElectionAdminResultats from '@/components/elections/admin/ElectionAdminResultats';
import ElectionAdminDepouillement from '@/components/elections/admin/ElectionAdminDepouillement';
import { ouvrir as electionsOuvrir, cloturer as electionsCloturer } from '@/routes/elections';
import votes from '@/routes/votes';
import { index as candidaturesIndex } from '@/routes/candidatures';
import { show as resultatsShow } from '@/routes/resultats';
import { show as depouillementShow, depouiller as depouillementDepouiller } from '@/routes/depouillement';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

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
}

export default function ElectionAdmin() {
    const { election, totalVotes, totalVoters, totalCandidatures, candidaturesValidees } = usePage<{ election: Election, totalVotes: number, totalVoters: number, totalCandidatures: number, candidaturesValidees: Candidature[] }>().props;
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
    const handleDepouiller = () => router.post(depouillementDepouiller.url({ election: election.id_election }));
    const handleConfigurerSecondTour = () => router.get(`/elections/${election.id_election}/second-tour`);
    const handleVoirResultatsDepouillement = () => router.get(depouillementShow.url({ election: election.id_election }));

    return (
        <AppLayout>
            <Head title={`Administration - ${election.titre}`} />
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
                    />
                </TabsContent>
            </ElectionAdminLayout>
        <ConfirmDialog />
        </AppLayout>
    );
}
