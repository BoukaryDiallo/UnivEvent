import { User } from './auth';

export type Election = {
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
