import { User } from './auth';

export type Etudiant = {
    id: number;
    id_user: number;
    matricule: string;
    telephone: string | null;
    photo: string | null;
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
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type Filiere = {
    id_filiere: number;
    nom: string;
    id_departement: number;
    departement?: {
        id_departement: number;
        nom: string;
        id_ufr: number;
        ufr?: {
            id_ufr: number;
            nom: string;
        };
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type Departement = {
    id_departement: number;
    nom: string;
    id_ufr: number;
    ufr?: {
        id_ufr: number;
        nom: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type Ufr = {
    id_ufr: number;
    nom: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};
