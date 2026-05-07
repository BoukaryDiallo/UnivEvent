import { useCallback, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useDebounce } from 'use-debounce';

export default function useEventFilters(initialFilters = {}) {
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        statut: 'all',
        date_from: '',
        date_to: '',
        public_cible: '',
        ...initialFilters
    });

    const [debouncedSearch] = useDebounce(filters.search, 300);

    const setFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            type: 'all',
            statut: 'all',
            date_from: '',
            date_to: '',
            public_cible: '',
        });
    }, []);

    useEffect(() => {
        const queryParams = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '' && v !== 'all')
        );

        // Include the debounced search term
        if (debouncedSearch) {
            queryParams.search = debouncedSearch;
        } else {
            delete queryParams.search;
        }

        router.get('/module5/events', queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, filters.type, filters.statut, filters.date_from, filters.date_to, filters.public_cible]);

    const isFiltered = Object.entries(filters).some(([key, value]) => {
        if (key === 'search') return value !== '';
        return value !== 'all' && value !== '';
    });

    return { filters, setFilter, resetFilters, isFiltered };
}
