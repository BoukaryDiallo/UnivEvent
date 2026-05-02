import { cn } from '@/lib/utils';
import { 
    DownloadIcon, 
    ImageIcon, 
    FileIcon, 
    VideoIcon, 
    LockIcon, 
    EyeIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EventMedia } from '@/types/evenements';

type MediaGalleryProps = {
    medias: EventMedia[];
    currentUserRoles?: string[];
};

export default function MediaGallery({ medias, currentUserRoles = [] }: MediaGalleryProps) {
    // Filter based on visibility and user roles
    const visibleMedias = medias.filter(media => {
        if (!media.confidentialite || media.confidentialite === 'public') return true;
        // Basic role check: if confidentialite is 'inscrits' and user is logged in
        // In a real app, this would be more complex
        return currentUserRoles.length > 0;
    });

    if (visibleMedias.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Aucun média disponible ou accès restreint.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMedias.map((media) => (
                <div 
                    key={media.id} 
                    className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800"
                >
                    {/* Media Preview */}
                    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden dark:bg-slate-900">
                        {media.type === 'image' ? (
                            <img 
                                src={media.url || ''} 
                                alt={media.name || ''} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                {media.type === 'pdf' ? (
                                    <FileIcon className="h-12 w-12 text-rose-500 opacity-40" />
                                ) : (
                                    <VideoIcon className="h-12 w-12 text-sky-500 opacity-40" />
                                )}
                            </div>
                        )}

                        {/* Badges overlay */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            {media.confidentialite !== 'public' && (
                                <span className="bg-black/60 text-white p-1.5 rounded-full backdrop-blur-md">
                                    <LockIcon className="h-3 w-3" />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {media.name || 'Document sans titre'}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                {media.type} • {(media.size || 0) > 1024 * 1024 
                                    ? `${((media.size || 0) / (1024 * 1024)).toFixed(1)} Mo` 
                                    : `${Math.round((media.size || 0) / 1024)} Ko`}
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                <DownloadIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
