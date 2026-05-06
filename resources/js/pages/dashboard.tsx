import { Head, Link } from '@inertiajs/react';
import { Calendar, LayoutDashboard, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DashboardProps = {
    isAdmin: boolean;
};

export default function Dashboard({ isAdmin }: DashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tableau de bord',
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur votre portail</h1>
                    <p className="text-muted-foreground">
                        Accédez aux différents modules de la plateforme UnivEvent.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Module 5: Événements */}
                    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        <div className="space-y-4">
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300">
                                <Calendar className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Gestion des Événements</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Consultez les conférences, concours, et gérez vos participations.
                                </p>
                            </div>
                        </div>
                        <Button asChild className="mt-6 w-full rounded-full" variant="outline">
                            <Link href="/module5/dashboard">
                                <LayoutDashboard className="mr-2 size-4" />
                                Dashboard Événements
                            </Link>
                        </Button>
                    </div>

                    {/* Placeholder for other modules */}
                    {isAdmin && (
                        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                            <div className="space-y-4">
                                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Administration</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Gérez les utilisateurs, les rôles et les paramètres système.
                                    </p>
                                </div>
                            </div>
                            <Button asChild className="mt-6 w-full rounded-full" variant="outline">
                                <Link href="/roles">
                                    <Settings className="mr-2 size-4" />
                                    Gérer les rôles
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
