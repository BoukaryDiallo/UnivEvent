import { User } from './auth';
import type { Election, Candidature } from './election';

export type Vote = {
    id: number;
    id_user: number;
    id_election: number;
    id_candidature: number;
    tour: 1 | 2;
    date_vote: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type VoteResult = {
    id: number;
    name: string;
    photo: string;
    votes: number;
    percentage: number;
    isWinner: boolean;
    resultat: 'second_tour' | 'eliminee' | 'elu' | null;
};

export type VoteStats = {
    totalVotes: number;
    totalVoters: number;
    participationRate: number;
};

export type TimelinePost = {
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
};

export type LiveVoteData = {
    election: Election;
    candidatures: Candidature[];
    results: VoteResult[];
    stats: VoteStats;
    lastUpdate: string;
};
