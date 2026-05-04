export type NiveauOption = { id: number | string; nom: string };

export type ResumeDispo = {
    dispos: number;
    ecarts: number;
    reservations: number;
    notifications: number;
};

export type LigneDispo = {
    id: number;
    jour: number;
    debut: string;
    fin: string;
    niveau: string;
    motif?: string | null;
    verrouille?: boolean;
};

export type LigneHistoriqueDisponibilite = {
    id: number;
    dispo_id: number;
    action: string;
    description: string;
    created_at: string;
};

export type LigneEcart = {
    id: number;
    date: string;
    date_fin?: string | null;
    motif?: string | null;
};

export type LigneReservation = {
    id: number;
    date: string;
    debut: string;
    fin: string;
    source: string;
    ref?: string | null;
    niveau: string;
    motif?: string | null;
    libere_at?: string | null;
};

export type LigneNotification = {
    type: string;
    titre: string;
    texte: string;
    lien: string;
    date: string;
};

export type ChargeDispo = {
    id: number;
    semestre: string[];
    nom_semestre: string;
    annee_academique: string;
    max_jour: number | null;
    max_semaine: number | null;
};

export type UserDispo = {
    id: number;
    name: string;
    email: string;
    nom?: string | null;
    prenom?: string | null;
    telephone?: string | null;
    specialite?: string | null;
    nom_complet?: string;
    role?: string;
};
