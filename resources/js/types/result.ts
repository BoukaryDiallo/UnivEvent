import { Election, Candidature } from './election';
import { VoteResult, VoteStats } from './vote';

export type ResultatProps = {
    workflow?: {
        liste_generee: Election[];
        planifiee: Election[];
        ouverte: Election[];
        cloturee: Election[];
        terminee: Election[];
    };
    stats?: {
        total_elections: number;
        ouvertes: number;
        cloturees: number;
        terminees: number;
    };
    election?: Election;
    posts?: Array<{
        type: 'candidatures_ouvertes' | 'candidats_publies' | 'liste_generee' | 'vote_ouvert' | 'vote_cloture' | 'resultats_publies';
        date: string;
        title: string;
        content?: string;
        candidates?: Array<{
            id: number;
            name: string;
            photo: string;
            slogan?: string;
        }>;
        results?: VoteResult[];
        total_votes?: number;
        election_id?: number;
    }>;
};

export type FormatedElection = {
    id_election: number;
    titre: string;
    description: string | null;
    date_debut: string;
    date_fin: string;
    type: 'ufr' | 'promotion';
    id_ufr: number | null;
    id_filiere: number | null;
    statut: 'liste_generee' | 'planifiee' | 'ouverte' | 'cloturee' | 'second_tour_planifie' | 'second_tour' | 'terminee';
    tour: 1 | 2;
    created_at: string;
    updated_at: string;
    candidatures: Candidature[];
    totalVotes: number;
    totalVoters: number;
    participationRate: number;
    ufr?: {
        id_ufr: number;
        nom: string;
    };
    filiere?: {
        id_filiere: number;
        nom: string;
    };
};
