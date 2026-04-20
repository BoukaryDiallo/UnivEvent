import { Head } from '@inertiajs/react';
import { DispoShell } from '@/components/dispo/entete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import type { LigneReservation, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mes reservations', href: '/mes-reservations' },
];

export default function ReservationsPage({
    user,
    resume,
    reservations,
}: {
    user: UserDispo;
    resume: ResumeDispo;
    reservations: LigneReservation[];
}) {
    return (
        <DispoShell title="Mes reservations" description="Consultez les creneaux deja reserves sur votre agenda." breadcrumbs={breadcrumbs} resume={resume} user={user} showResume={false}>
            <Head title="Mes reservations" />
            <Card>
                <CardHeader>
                    <CardTitle>Historique des reservations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Plage</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Niveau</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Etat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.debut} - {item.fin}</TableCell>
                                    <TableCell>{item.source}</TableCell>
                                    <TableCell>{item.niveau}</TableCell>
                                    <TableCell>{item.ref ?? '-'}</TableCell>
                                    <TableCell>{item.libere_at ? 'Liberee' : 'Active'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DispoShell>
    );
}
