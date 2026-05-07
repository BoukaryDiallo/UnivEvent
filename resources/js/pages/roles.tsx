import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard, roles } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type RoleUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    est_actif: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Roles',
        href: roles(),
    },
];

export default function Roles() {
    const { users } = usePage<{ users: RoleUser[] }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Roles" />
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h2 className="mb-4 text-xl font-bold">Liste des utilisateurs</h2>
                    <Button variant="default">Ajouter un utilisateur</Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.est_actif ? 'Actif' : 'Inactif'}</TableCell>
                                <TableCell>
                                    <Button variant="default">Modifier</Button>
                                    <Button variant="destructive" className="ml-2">
                                        Supprimer
                                    </Button>
                                    <Button variant="secondary" className="ml-2">
                                        {user.est_actif ? 'Actif' : 'Inactif'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
