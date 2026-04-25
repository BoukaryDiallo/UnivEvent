/**
 * Fonctions utilitaires pour la gestion des images
 */

import { getFileUrl } from './fileHelpers';

/**
 * Génère l'URL pour les images avec fallback
 */
export function getImageUrl(path: string | null | undefined, fallback: string = '/placeholder.svg'): string {
    if (!path) {
        return fallback;
    }

    const url = getFileUrl(path);

    // Vérifier si c'est une image valide
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext =>
        path.toLowerCase().endsWith(ext)
    );

    if (!hasImageExtension) {
        return fallback;
    }

    return url;
}

/**
 * Vérifie si une URL est une image valide
 */
export function isValidImage(path: string | null | undefined): boolean {
    if (!path) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
}

/**
 * Génère une URL de placeholder pour les images manquantes
 */
export function getPlaceholderImage(size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
        small: '/placeholder-small.svg',
        medium: '/placeholder.svg',
        large: '/placeholder-large.svg'
    };
    return sizes[size];
}
