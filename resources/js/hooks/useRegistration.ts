import { useForm } from '@inertiajs/react';
import { useCallback } from 'react';

export default function useRegistration(event = null) {
    const { post, patch, processing, errors } = useForm({
        evenement_id: event?.id,
    });

    const register = useCallback((eventId) => {
        post(`/m5/events/${eventId}/register`);
    }, [post]);

    const cancelRegistration = useCallback((participationId) => {
        patch(`/m5/participations/${participationId}/cancel`);
    }, [patch]);

    return {
        register,
        cancelRegistration,
        isLoading: processing,
        errors,
        isRegistered: !!event?.participation,
        participationStatus: event?.participation?.statut,
        positionAttente: event?.participation?.waitlist_position,
    };
}
