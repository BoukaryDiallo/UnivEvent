import { Head, usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard, roles } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';

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

const page = usePage();
console.log(page.props);
    const { users } = usePage().props as any;

    console.log(users);
    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Roles" />
            <div className='p-4'>
                <div className=" flex items-center justify-between">

                    <h2 className="text-xl font-bold mb-4">Liste des utilisateurs</h2>
                    <Button variant={"default"}>Ajouter un utilisateur</Button>
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
                    {users?.map((user: any) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.est_actif ? 'Actif' : 'Inactif'}</TableCell>
                            <TableCell className=''>
                                <Button variant={"default"}>Modifier</Button>
                                <Button variant="destructive" className="ml-2">Supprimer</Button>
                                <Button variant={"secondary"}>{user.est_actif ? 'Actif' : 'Inactif'}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        </AppLayout>
    );
}
