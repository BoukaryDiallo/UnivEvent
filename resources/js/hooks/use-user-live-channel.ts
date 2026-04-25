import { useEffect, useEffectEvent } from 'react';
import { getEcho } from '@/lib/echo';

type LiveHandlers = Record<string, (payload: unknown) => void>;

export function useUserLiveChannel(userId: number | null | undefined, handlers: LiveHandlers, enabled = true) {
    const handlerKeys = Object.keys(handlers).sort().join('|');
    const dispatch = useEffectEvent((eventName: string, payload: unknown) => {
        handlers[eventName]?.(payload);
    });

    useEffect(() => {
        if (!enabled || !userId) {
            return;
        }

        const echo = getEcho();

        if (!echo) {
            return;
        }

        const channelName = `user.${userId}`;
        const channel = echo.private(channelName);

        Object.keys(handlers).forEach((eventName) => {
            channel.listen(`.${eventName}`, (payload: unknown) => {
                dispatch(eventName, payload);
            });
        });

        return () => {
            echo.leave(channelName);
        };
    }, [enabled, handlerKeys, handlers, userId]);
}
