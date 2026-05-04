import { Link } from '@inertiajs/react';
import { Bell, CalendarClock, CalendarRange, Eye, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';

type Onglet = {
    titre: string;
    href: string;
    icon: typeof CalendarClock;
};

const enseignantOnglets: Onglet[] = [
    { titre: 'Disponibilités', href: '/dispos', icon: CalendarClock },
    { titre: 'Exceptions', href: '/ecarts', icon: CalendarRange },
    { titre: 'Mes réservations', href: '/mes-reservations', icon: NotebookPen },
    { titre: 'Mes notifications', href: '/mes-notifications', icon: Bell },
];

const adminOnglets: Onglet[] = [
    { titre: 'Consultation', href: '/consultation', icon: Eye },
    { titre: 'Notifications', href: '/consultation/notifications', icon: Bell },
];

export function OngletsDispo({
    role,
    courant,
}: {
    role: 'enseignant' | 'admin';
    courant: string;
}) {
    const onglets = role === 'admin' ? adminOnglets : enseignantOnglets;

    return (
        <div className="flex flex-wrap gap-2">
            {onglets.map((onglet) => {
                const actif = courant === onglet.href;

                return (
                    <Link
                        key={onglet.href}
                        href={onglet.href}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                            actif ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted',
                        )}
                    >
                        <onglet.icon className="size-4" />
                        <span>{onglet.titre}</span>
                    </Link>
                );
            })}
        </div>
    );
}
