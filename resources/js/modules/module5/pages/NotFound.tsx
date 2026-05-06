import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function NotFound() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: '404', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Page non trouvée" />

            <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 rounded-xl p-4">
                <div className="text-center space-y-4">
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
                    
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">404</h1>
                        <p className="text-lg text-muted-foreground">Page non trouvée</p>
                    </div>
                    
                    <p className="text-muted-foreground max-w-md mx-auto">
                        La page que vous recherchez n'existe pas ou n'est pas accessible en ce moment.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/module5/dashboard">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Retour au tableau de bord
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}
