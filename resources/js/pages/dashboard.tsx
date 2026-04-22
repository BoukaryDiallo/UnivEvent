import { Head, Link } from '@inertiajs/react';
import { Bell, CalendarClock, CalendarRange, NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const couleurs: Record<string, string> = {
    prefere: 'bg-emerald-500/90 hover:bg-emerald-500 transition-colors',
    acceptable: 'bg-amber-400/90 hover:bg-amber-400 transition-colors',
    non_definie: 'bg-slate-200 hover:bg-slate-300 transition-colors dark:bg-slate-700',
    reserve: 'bg-blue-500/90 hover:bg-blue-500 transition-colors',
    vide: 'bg-muted/50',
};

export default function Dashboard({
    role,
    resume,
    reservations = [],
    grille = null,
}: {
    role: string;
    resume: Record<string, number>;
    reservations?: Array<{
        id: number;
        date: string;
        debut: string;
        fin: string;
        source: string;
        niveau: string;
        libere_at?: string | null;
    }>;
    grille?: {
        jours: string[];
        heures: string[];
        cells: Array<{ jour: string; heure: string; niveau: string }>;
    } | null;
}) {
    if (role !== 'enseignant') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-muted-foreground/20" />
                            </div>
                        ))}
                    </div>
                    <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-muted-foreground/20" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard enseignant" />
            <div className="space-y-8 p-6">
                {/* Navigation améliorée */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                    {[
                        { href: '/dispos', label: 'Mes disponibilités' },
                        { href: '/ecarts', label: 'Mes exceptions' },
                        { href: '/mes-reservations', label: 'Mes réservations' },
                        { href: '/mes-notifications', label: 'Mes notifications' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Cartes de statistiques */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibilités</CardTitle>
                            <CalendarClock className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{resume.dispos}</div>
                            <p className="text-xs text-muted-foreground mt-1">heures disponibles</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Exceptions</CardTitle>
                            <CalendarRange className="size-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{resume.ecarts}</div>
                            <p className="text-xs text-muted-foreground mt-1">périodes exceptionnelles</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Réservations</CardTitle>
                            <NotebookPen className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{resume.reservations}</div>
                            <p className="text-xs text-muted-foreground mt-1">cours planifiés</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
                            <Bell className="size-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{resume.notifications}</div>
                            <p className="text-xs text-muted-foreground mt-1">notif</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tableau et diagramme */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Dernières réservations */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Dernières réservations</CardTitle>
                            <p className="text-sm text-muted-foreground">Vos 5 dernières réservations actives</p>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">Plage horaire</TableHead>
                                            <TableHead className="font-semibold">Source</TableHead>
                                            <TableHead className="font-semibold">État</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservations.slice(0, 5).map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium">{item.date}</TableCell>
                                                <TableCell>{item.debut} - {item.fin}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                        {item.source}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {item.libere_at ? (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            Libérée
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            Active
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {reservations.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    Aucune réservation récente
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Diagramme hebdomadaire */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Planning hebdomadaire</CardTitle>
                            <p className="text-sm text-muted-foreground">Visualisation de vos disponibilités</p>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-x-auto">
                            <div className="min-w-[700px] overflow-x-auto">
                                <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${grille?.jours.length ?? 0}, minmax(80px, 1fr))` }}>
                                    <div className="font-medium text-muted-foreground">Heures</div>
                                    {grille?.jours.map((jour) => (
                                        <div key={jour} className="text-center text-sm font-semibold text-foreground">{jour}</div>
                                    ))}
                                    {grille?.heures.map((heure) => (
                                        <div key={heure} className="contents">
                                            <div className="pt-2 text-sm font-medium text-muted-foreground">{heure}</div>
                                            {grille.jours.map((jour) => {
                                                const cell = grille.cells.find((item) => item.jour === jour && item.heure === heure);
                                                return (
                                                    <div
                                                        key={`${jour}-${heure}`}
                                                        className={`h-12 rounded-lg border border-border/50 transition-all duration-200 cursor-help ${couleurs[cell?.niveau ?? 'non_definie']}`}
                                                        title={`${jour} ${heure} : ${cell?.niveau === 'non_definie' ? 'non défini' : cell?.niveau ?? 'non défini'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Légende améliorée */}
                            <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
                                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="size-3 rounded-sm bg-emerald-500/90" />
                                    Préféré
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="size-3 rounded-sm bg-amber-400/90" />
                                    Acceptable
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
                                    Non défini
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="size-3 rounded-sm bg-blue-500/90" />
                                    Réservé
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}