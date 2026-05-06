import { usePage } from '@inertiajs/react';
import { IntervenantDashboard } from '@/modules/module5/components/IntervenantDashboard';
import { JuryDashboard } from '@/modules/module5/components/JuryDashboard';
import { OrganizerDashboard } from '@/modules/module5/components/OrganizerDashboard';
import { ParticipantDashboard } from '@/modules/module5/components/ParticipantDashboard';
import type { EventDetail, EventJuryPanel, EventResult } from '@/types';
import type { Auth } from '@/types/auth';

type ControlPanelLayoutProps = {
    event: EventDetail;
    juryPanel?: EventJuryPanel | null;
    myResult?: EventResult | null;
    userRoles: string[];
    permissions: {
        canManage: boolean;
        canManageMessages: boolean;
        canJuryMember: boolean;
        canPresident: boolean;
    };
};

export function ControlPanelLayout({
    event,
    juryPanel,
    myResult,
    userRoles,
    permissions,
}: ControlPanelLayoutProps) {
    const { auth } = usePage().props as unknown as { auth: Auth };
    const currentUserId = auth.user?.id ?? null;

    const isOrganizer =
        event.team.organisateur.some((member) => member.user_id === currentUserId) ||
        userRoles.includes('organisateur') ||
        permissions.canManage;
    const isJuryMember =
        event.team.jury.some((member) => member.user_id === currentUserId) ||
        userRoles.includes('jury') ||
        permissions.canJuryMember;
    const isPresident = juryPanel?.president_user_id === currentUserId || permissions.canPresident;
    const isIntervenant =
        event.team.intervenant.some((member) => member.user_id === currentUserId) ||
        userRoles.includes('intervenant');
    const isParticipant =
        event.current_inscription?.backend_statut === 'accepte' ||
        event.participants.some((participant) => participant.user_id === currentUserId) ||
        userRoles.includes('participant');

    if (isOrganizer) {
        return <OrganizerDashboard event={event} canManage />;
    }

    if (isPresident || isJuryMember) {
        return (
            <JuryDashboard
                event={event}
                juryPanel={juryPanel ?? event.jury ?? null}
                canJuryMember={isJuryMember}
                canPresident={isPresident}
            />
        );
    }

    if (isIntervenant) {
        return <IntervenantDashboard event={event} canManageMessages={permissions.canManageMessages} />;
    }

    if (isParticipant) {
        return <ParticipantDashboard event={event} myResult={myResult ?? event.my_result ?? null} />;
    }

    return <ParticipantDashboard event={event} myResult={myResult ?? event.my_result ?? null} />;
}
