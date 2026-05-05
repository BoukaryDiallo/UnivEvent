/**
 * Fonctions utilitaires pour l'affichage des fichiers
 */

/**
 * Génère l'URL correcte pour les fichiers stockés
 */
export function getFileUrl(path: string | null | undefined): string {
    if (!path) {
        return '/placeholder.svg'; // Image par défaut
    }

    // Si le chemin commence déjà par /storage, le retourner tel quel
    if (path.startsWith('/storage/')) {
        return path;
    }

    // Sinon, ajouter le préfixe /storage/
    return `/storage/${path}`;
}

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
 * Génère l'URL pour les PDF avec fallback
 */
export function getPdfUrl(path: string | null | undefined): string {
    if (!path) {
        return '#';
    }

    const url = getFileUrl(path);

    // Vérifier si c'est un PDF
    if (!path.toLowerCase().endsWith('.pdf')) {
        return '#';
    }

    return url;
}

/**
 * Vérifie si un fichier est une image
 */
export function isImageFile(path: string | null | undefined): boolean {
    if (!path) {
return false;
}

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

    return imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
}

/**
 * Vérifie si un fichier est un PDF
 */
export function isPdfFile(path: string | null | undefined): boolean {
    if (!path) {
return false;
}

    return path.toLowerCase().endsWith('.pdf');
}

/**
 * Affiche le nom du fichier avec l'icône appropriée
 */
export function getFileInfo(path: string | null | undefined): { name: string; icon: string; isPdf: boolean; isImage: boolean } {
    if (!path) {
        return { name: 'Aucun fichier', icon: '📄', isPdf: false, isImage: false };
    }

    const fileName = path.split('/').pop() || path;
    const isPdf = isPdfFile(path);
    const isImage = isImageFile(path);

    let icon = '📄';

    if (isPdf) {
icon = '📑';
} else if (isImage) {
icon = '🖼️';
}

    return { name: fileName, icon, isPdf, isImage };
}

