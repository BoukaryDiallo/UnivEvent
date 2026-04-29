import { useCallback } from 'react';

export type CleanupFn = () => void;

export function useMobileNavigation(): CleanupFn {
    return useCallback(() => {
        // Supprimer le style pointer-events du corps...
        document.body.style.removeProperty('pointer-events');
    }, []);
}
