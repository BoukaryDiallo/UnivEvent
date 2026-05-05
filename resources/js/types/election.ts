import type { User } from './auth';

export type Election = {
    id_election: number;
    titre: string;
    description: string | null;
    date_debut: string;
    date_fin: string;
    type: 'ufr' | 'promotion';
    id_ufr: number | null;
    id_filiere: number | null;
    statut: 'liste_generee' | 'planifiee' | 'ouverte' | 'cloturee' | 'second_tour_requis' | 'second_tour_planifie' | 'second_tour' | 'terminee';
    tour: 1 | 2;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    ufr?: {
        id_ufr: number;
        nom: string;
    };
    filiere?: {
        id_filiere: number;
        nom: string;
    };
    candidatures?: Candidature[];
    listesElectorales?: ListeElectorale[];
};

export type Candidature = {
    id_candidature: number;
    id_election: number;
    id_user: number;
    slogan: string | null;
    programme: string | null;
    statut: 'en_attente' | 'validee' | 'refusee';
    resultat: 'second_tour' | 'eliminee' | 'elu' | null;
    user: User;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type ListeElectorale = {
    id: number;
    id_election: number;
    id_etudiant: number;
    etudiant: {
        id: number;
        id_user: number;
        user: User;
        filiere?: {
            id_filiere: number;
            nom: string;
            departement?: {
                id_departement: number;
                nom: string;
                ufr?: {
                    id_ufr: number;
                    nom: string;
                };
            };
        };
    };
    created_at: string;
    updated_at: string;
};

// Types pour les formulaires
export type ElectionFormData = {
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    type: string;
    id_ufr: string;
    id_filiere: string;
};

// Types pour les entités liées
export type Ufr = {
    id_ufr: number;
    nom: string;
};

export type Filiere = {
    id_filiere: number;
    nom: string;
};

export type CandidatQualifie = {
    id_candidature: number;
    user: {
        name: string;
        photo?: string;
    };
    slogan?: string;
};

// Types pour les statistiques et données de workflow
export type WorkflowData = {
    liste_generee: Election[];
    planifiee: Election[];
    ouverte: Election[];
    cloturee: Election[];
    terminee: Election[];
};

export type ElectionStats = {
    total_elections: number;
    ouvertes: number;
    cloturees: number;
    terminees: number;
};

export type ElectionAdminStats = {
    totalVoters: number;
    totalVotes: number;
    totalCandidatures: number;
    candidaturesValidees: number;
    participationRate: number;
};

// Types pour les composants d'administration
export type ElectionAdminInformationsProps = {
    election: Election;
    onGenererListe: () => void;
    onVoirListe: () => void;
    onCloturerCandidatures: () => void;
    onOuvrir: () => void;
    onCloturer: () => void;
};

export type ElectionAdminCandidaturesProps = {
    candidatures: Candidature[];
    totalCandidatures: number;
    candidaturesIndexUrl: string;
};

export type ElectionAdminVoteProps = {
    stats: {
        totalVoters: number;
        totalVotes: number;
        participationRate: number;
    };
    electionId: number;
    candidatsUrl: string;
    voteLiveUrl: string;
};

export type ElectionAdminResultatsProps = {
    electionStatut: string;
    resultatsUrl: string;
};

export type ElectionAdminDepouillementProps = {
    election: Election;
    stats: {
        totalVotes: number;
        totalVoters: number;
        participationRate: number;
    };
    onDepouiller: () => void;
    onVoirResultatsDepouillement: () => void;
    onConfigurerSecondTour: () => void;
    resultatsUrl: string;
};

export type ElectionAdminLayoutProps = {
    election: Election;
    children: React.ReactNode;
    onBack: () => void;
};

export type ElectionFormProps = {
    data: ElectionFormData;
    setData: (field: keyof ElectionFormData, value: string) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    ufrs: Ufr[];
    filieres: Filiere[];
    mode?: 'create' | 'edit' | 'second_tour';
    election?: Election;
    candidatsQualifies?: CandidatQualifie[];
    submitLabel: string;
    title: string;
    onCancel: () => void;
};

// Types pour les pages de vote
export type VoteElection = {
    id_election: number;
    titre: string;
    description: string;
    candidatures: Candidature[];
};

export type LiveElection = {
    title: string;
    status: string;
    votes_count: number;
};
