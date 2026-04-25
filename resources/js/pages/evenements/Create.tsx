import { Head } from '@inertiajs/react';
import { EventFormWizard } from '@/components/evenements/EventFormWizard';
import AppLayout from '@/layouts/app-layout';
import { index, store } from '@/routes/evenements';
import type { BreadcrumbItem, EventFormMeta, EventFormValues } from '@/types';

type CreateProps = {
    meta: EventFormMeta;
};

const initialValues: EventFormValues = {
    titre: '',
    description: '',
    type: 'conference',
    date_debut: '',
    date_fin: '',
    lieu: '',
    lien_live: '',
    visibilite: 'public',
    public_cible: 'tous',
    roles: ['etudiant', 'enseignant'],
    statut: 'brouillon',
    inscription_requise: true,
    capacite_max: '',
    checkin_active: false,
    comments_enabled: true,
    comment_replies_enabled: true,
    comment_reactions_enabled: true,
    comment_policy: 'accepted_participants',
    messages_enabled: true,
    evenement_certifie: false,
    allow_participant_result_tracking: false,
    certificate_template_schema: null,
    certificate_template_version: 'template_v1',
    competition_status: 'configuration',
    jury_config: {
        president_user_id: null,
        admission_average: 10,
        seats_count: null,
        ranking_mode: 'final_note',
        tie_break_rule: 'name',
        criteria: [],
    },
    programmes: [],
    assigned_users: {
        organisateur: [],
        participant: [],
        intervenant: [],
        jury: [],
    },
    media: null,
};

export default function EvenementsCreate({ meta }: CreateProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: index() },
        { title: 'Creation', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Creer un evenement" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Creer un evenement</h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Construisez un evenement conference ou concours avec un parcours de creation clair, moderne et pret pour la production.
                    </p>
                </div>
                <EventFormWizard mode="create" meta={meta} action={store().url} initialValues={initialValues} cancelHref={index()} />
            </div>
        </AppLayout>
    );
}
