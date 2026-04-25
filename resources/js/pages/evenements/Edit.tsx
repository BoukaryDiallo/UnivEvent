import { Head, router } from '@inertiajs/react';
import { EventFormWizard } from '@/components/evenements/EventFormWizard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index, show, update } from '@/routes/evenements';
import type { BreadcrumbItem, EventFormMeta, EventFormValues } from '@/types';

type EditProps = {
    meta: EventFormMeta;
    evenement: Omit<EventFormValues, 'media'> & {
        id: number;
        media: null;
        medias: Array<{ id: number; type: string; url: string; name: string | null }>;
        programmes: EventFormValues['programmes'];
    };
};

export default function EvenementsEdit({ meta, evenement }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: index() },
        { title: evenement.titre, href: show(evenement.id) },
        { title: 'Modification', href: '#' },
    ];

    const initialValues: EventFormValues = {
        titre: evenement.titre,
        description: evenement.description || '',
        type: evenement.type,
        date_debut: evenement.date_debut,
        date_fin: evenement.date_fin || '',
        lieu: evenement.lieu || '',
        lien_live: evenement.lien_live || '',
        visibilite: evenement.visibilite,
        public_cible: evenement.public_cible || '',
        roles: evenement.roles,
        statut: evenement.statut,
        inscription_requise: evenement.inscription_requise,
        capacite_max: evenement.capacite_max || '',
        checkin_active: evenement.checkin_active,
        comments_enabled: evenement.comments_enabled,
        comment_replies_enabled: evenement.comment_replies_enabled,
        comment_reactions_enabled: evenement.comment_reactions_enabled,
        comment_policy: evenement.comment_policy,
        messages_enabled: evenement.messages_enabled,
        evenement_certifie: evenement.evenement_certifie,
        allow_participant_result_tracking: evenement.allow_participant_result_tracking,
        certificate_template_schema: evenement.certificate_template_schema,
        certificate_template_version: evenement.certificate_template_version,
        competition_status: evenement.competition_status,
        jury_config: evenement.jury_config,
        programmes: evenement.programmes,
        assigned_users: evenement.assigned_users,
        media: null,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${evenement.titre}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Modifier l evenement</h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Mettez a jour les details, les restrictions d acces et la presentation de l evenement sans sortir du flux de travail.
                    </p>
                </div>
                {evenement.statut !== 'cloture' ? (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => router.post(`/evenements/${evenement.id}/archiver`, {}, { preserveScroll: true })}
                        >
                            Archiver l evenement
                        </Button>
                    </div>
                ) : null}
                <EventFormWizard
                    mode="edit"
                    meta={meta}
                    action={update(evenement.id).url}
                    method="put"
                    initialValues={initialValues}
                    cancelHref={show(evenement.id)}
                />
            </div>
        </AppLayout>
    );
}
