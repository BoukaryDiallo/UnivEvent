export type EventRole = 'tous' | 'etudiant' | 'enseignant' | 'admin' | string;
export type EventType = 'conference' | 'concours';
export type EventStatus = 'brouillon' | 'publie' | 'en_cours' | 'cloture' | 'archive';
export type ParticipationStatus = 'participe' | 'interesse' | 'refuse';
export type BackendParticipationStatus = 'en_attente' | 'accepte' | 'refuse';
export type EventAssignmentRole = 'organisateur' | 'participant' | 'intervenant' | 'jury';
export type EventTemplateSchema = Record<string, string | number | boolean | null>;

export type EventAssignmentPermissions = {
    can_manage_messages: boolean;
    can_manage_comments: boolean;
    can_edit_event: boolean;
    can_change_visibility: boolean;
    can_manage_participants: boolean;
    can_assign_jury: boolean;
    can_assign_organizers: boolean;
    can_manage_certificates: boolean;
    can_manage_results: boolean;
};

export type EventAssignableUser = {
    id: number;
    name: string | null;
    email: string | null;
    role: string | null;
};

export type EventTeamMember = {
    id: number;
    user_id: number | null;
    name: string | null;
    email: string | null;
    role: string | null;
    is_president_jury?: boolean;
    permissions: EventAssignmentPermissions;
};

export type EventAssignedEntry = {
    user_id: number;
    is_president_jury?: boolean;
    permissions: EventAssignmentPermissions;
};

export type EventAssignedUsers = Record<EventAssignmentRole, EventAssignedEntry[]>;

export type EventValidationStatus = 'pending' | 'approved' | 'rejected';
export type EventWorkflowState = 'draft' | 'pending' | 'published' | 'rejected';

export type EventCompletionSection = {
    key: string;
    label: string;
    weight: number;
    percentage: number;
    status: 'complete' | 'partial' | 'empty';
    missing: string[];
};

export type EventCompletionSummary = {
    percentage: number;
    sections: EventCompletionSection[];
};

export type EventSummary = {
    id: number;
    titre: string;
    description: string | null;
    type: EventType;
    date_debut: string;
    date_fin: string | null;
    lieu: string | null;
    lien_live?: string | null;
    statut: EventStatus;
    validation_status?: EventValidationStatus;
    workflow_state?: EventWorkflowState;
    rejection_reason?: string | null;
    submitted_at?: string | null;
    visibilite: 'public' | 'prive' | 'restreint';
    public_cible: string;
    comments_enabled: boolean;
    comment_replies_enabled: boolean;
    comment_reactions_enabled: boolean;
    comment_policy: string;
    messages_enabled: boolean;
    evenement_certifie: boolean;
    certificate_template_version?: string | null;
    capacite_max: number | null;
    participants_count: number;
    comments_count: number;
    activity_count: number;
    cover_url: string | null;
    roles: EventRole[];
    createur: {
        id: number | null;
        name: string | null;
        role: string | null;
    };
    participation: {
        id: number;
        statut: ParticipationStatus;
        backend_statut?: 'en_attente' | 'accepte' | 'refuse';
    } | null;
    can_join?: boolean;
    management_role?: 'createur' | 'organisateur' | null;
    can_manage?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
    can_submit?: boolean;
    completion?: EventCompletionSummary;
    submission_errors?: string[];
    suggestions?: string[];
    messages_count?: number;
};

export type EventParticipant = {
    id: number;
    statut: ParticipationStatus | BackendParticipationStatus;
    backend_statut?: BackendParticipationStatus;
    user_id: number;
    user: {
        id: number | null;
        name: string | null;
        email: string | null;
        role: string | null;
    };
};

export type EventProgramme = {
    id: number;
    titre: string;
    description: string | null;
    intervenant: string | null;
    date_programme: string | null;
    heure_debut: string | null;
    heure_fin: string | null;
    salle: string | null;
    type_section: string | null;
    ordre: number;
};

export type EventCriterion = {
    id?: number;
    nom: string;
    description: string | null;
    bareme: number | null;
    coefficient: number | null;
    ordre: number | null;
    actif: boolean;
};

export type EventMedia = {
    id: number;
    nom_fichier?: string;
    chemin_fichier?: string;
    type_fichier?: string;
    taille_fichier?: number;
    description?: string | null;
    is_public?: boolean;
    download_allowed?: boolean;
    confidentialite?: 'public' | 'inscrits' | 'participants' | 'organisateur' | 'intervenant' | 'jury' | 'president_jury' | string;
    uploaded_by?: number;
    created_at?: string;
    updated_at?: string;
    type: 'image' | 'pdf' | 'autre' | string;
    name: string | null;
    size: number | null;
    url: string | null;
    can_view?: boolean;
    can_download?: boolean;
};

export type EventProgrammeDraft = {
    id?: number;
    titre: string;
    description: string;
    intervenant: string;
    date_programme: string;
    heure_debut: string;
    heure_fin: string;
    salle: string;
    type_section: string;
    ordre: string;
};

export type EventMediaPreview = {
    id: number;
    type: 'image' | 'pdf' | 'autre';
    name: string | null;
    size: number | null;
    url: string;
};

export type EventResult = {
    id: number;
    note: number;
    classement: number | null;
    admission?: string | null;
    mention?: string | null;
    criteria_breakdown?: Array<{
        criterion_id: number;
        nom: string;
        average: number;
        coefficient: number;
    }>;
    certificate_url: string | null;
    user: {
        id: number | null;
        name: string | null;
        email: string | null;
        role: string | null;
    };
};

export type EventComment = {
    id: number;
    contenu: string;
    created_at: string | null;
    likes_count: number;
    liked_by_me: boolean;
    user: {
        id: number | null;
        name: string | null;
        email: string | null;
        role: string | null;
    };
    replies: Array<{
        id: number;
        contenu: string;
        created_at: string | null;
        likes_count: number;
        liked_by_me: boolean;
        user: {
            id: number | null;
            name: string | null;
            email: string | null;
            role: string | null;
        };
    }>;
};

export type EventMessage = {
    id: number;
    type: string;
    contenu: string;
    status: string;
    is_pinned?: boolean;
    created_at: string | null;
    user: {
        id: number | null;
        name: string | null;
        email: string | null;
        role: string | null;
    };
    replies?: EventMessage[];
};

export type EventActivity = {
    id: number;
    type: string;
    label: string;
    description: string | null;
    created_at: string | null;
    user: {
        id: number | null;
        name: string | null;
        role: string | null;
    };
};

export type EventAccessPass = {
    token: string;
    qr_url: string;
    scan_url: string;
    admin_scan_url?: string;
    checked_in_at: string | null;
    status: ParticipationStatus;
};

export type EventJuryConfig = {
    president_user_id: number | null;
    admission_average: number | null;
    seats_count: number | null;
    ranking_mode: string | null;
    tie_break_rule: string | null;
    criteria: Array<{
        id?: number;
        nom: string;
        description: string | null;
        bareme: number | null;
        coefficient: number | null;
        ordre: number | null;
        actif: boolean;
    }>;
};

export type EventJuryPanel = {
    id: number;
    president_user_id: number | null;
    admission_average: number | null;
    seats_count: number | null;
    ranking_mode: string | null;
    tie_break_rule: string | null;
    criteria_locked: boolean;
    scoring_opened_at?: string | null;
    scoring_closed_at?: string | null;
    validated_at?: string | null;
    criteria: EventJuryConfig['criteria'];
    deliberations: Array<{
        id: number;
        participant_id: number;
        participant_name?: string | null;
        requested_by?: number | null;
        requested_by_name?: string | null;
        status: string;
        reason: string;
        resolved_at: string | null;
        resolved_by_name?: string | null;
    }>;
    score_entries?: Array<{
        participant_id: number;
        criterion_id: number;
        score: number | null;
        commentaire: string | null;
        status: string;
        submitted_at: string | null;
        reopened_at: string | null;
    }>;
    computed_results: Array<{
        participant_id: number;
        participant_name: string | null;
        note: number;
        classement: number;
        admission: string;
        mention: string;
        criteria_breakdown: EventResult['criteria_breakdown'];
    }>;
};

export type EventModeration = {
    restrictions: Array<{
        id: number;
        user_id: number;
        comments_blocked: boolean;
        replies_blocked: boolean;
        messages_blocked: boolean;
        muted: boolean;
        reason: string | null;
        expires_at: string | null;
        created_by: string | null;
    }>;
};

export type EventDetail = {
    id: number;
    titre: string;
    description: string | null;
    type: EventType;
    date_debut: string;
    date_fin: string | null;
    lieu: string | null;
    lien_live: string | null;
    statut: EventStatus;
    visibilite: 'public' | 'prive' | 'restreint';
    public_cible: string;
    inscription_requise: boolean;
    capacite_max: number | null;
    checkin_active: boolean;
    comments_enabled?: boolean;
    comment_replies_enabled?: boolean;
    comment_reactions_enabled?: boolean;
    comment_policy?: string;
    messages_enabled?: boolean;
    evenement_certifie?: boolean;
    certificate_template_schema?: EventTemplateSchema | null;
    certificate_template_version?: string;
    allow_participant_result_tracking?: boolean;
    competition_status?: string;
    validation_status?: EventValidationStatus;
    participants_count: number;
    comments_count: number;
    activity_count: number;
    roles: EventRole[];
    cover_url: string | null;
    createur: {
        id: number | null;
        name: string | null;
        email: string | null;
        role: string | null;
    };
    assignments?: Array<{
        id: number;
        role: EventAssignmentRole;
        user: {
            id: number;
            name: string;
            email: string;
            role: string | null;
        };
    }>;
    current_inscription_id: number | null;
    current_inscription: {
        id: number;
        statut: ParticipationStatus | BackendParticipationStatus;
        backend_statut?: BackendParticipationStatus;
    } | null;
    participation?: {
        id: number;
        statut: ParticipationStatus | BackendParticipationStatus;
        backend_statut?: BackendParticipationStatus;
    } | null;
    participants: EventParticipant[];
    programmes: EventProgramme[];
    activities: EventActivity[];
    comments: EventComment[];
    messages: EventMessage[];
    access: EventAccessPass | null;
    medias: EventMedia[];
    team: Record<EventAssignmentRole, EventTeamMember[]>;
    moderation?: EventModeration;
    jury?: EventJuryPanel | null;
    resultats: EventResult[];
    my_result?: EventResult | null;
    certificate?: {
        id: number;
        url: string;
        statut: string;
    } | null;
};

export type EventFormValues = {
    titre: string;
    description: string;
    type: EventType;
    date_debut: string;
    date_fin: string;
    lieu: string;
    lien_live: string;
    visibilite: 'public' | 'prive' | 'restreint';
    public_cible: string;
    roles: string[];
    statut: EventStatus;
    inscription_requise: boolean;
    capacite_max: string;
    checkin_active: boolean;
    comments_enabled: boolean;
    comment_replies_enabled: boolean;
    comment_reactions_enabled: boolean;
    comment_policy: string;
    messages_enabled: boolean;
    evenement_certifie: boolean;
    allow_participant_result_tracking: boolean;
    certificate_template_schema: EventTemplateSchema | null;
    certificate_template_version: string;
    competition_status: string;
    jury_config: EventJuryConfig;
    programmes: EventProgrammeDraft[];
    assigned_users: EventAssignedUsers;
    media: File | null;
};

export type EventFormMeta = {
    availableRoles: string[];
    assignmentRoles: Array<{ value: EventAssignmentRole; label: string }>;
    commentPolicies: Array<{ value: string; label: string }>;
    assignableUsers: EventAssignableUser[];
    types: Array<{ value: EventType; label: string }>;
    visibilities: Array<{ value: 'public' | 'prive' | 'restreint'; label: string }>;
    statuses: Array<{ value: EventStatus; label: string }>;
};

export type EventFilterState = {
    search: string;
    scope: 'upcoming' | 'ongoing' | 'past';
    type: 'all' | EventType;
    statut?: 'all' | EventStatus;
    date?: 'all' | 'today' | 'week' | 'month';
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedEvents = {
    data: EventSummary[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
};
