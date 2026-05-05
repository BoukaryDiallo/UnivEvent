import { Head, useForm, router } from '@inertiajs/react';
import {
    UserPlus, Users as UsersIcon, GraduationCap, Shield, RefreshCw, Mail, Lock, User
} from 'lucide-react';
import { useEffect, useState } from 'react';
// shadcn UI
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Gestion des utilisateurs', href: '#' },
];

export default function Users({ users, roles }: any) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    
    const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: string[] }>(() => {
        const init: { [key: number]: string[] } = {};
        users.forEach((u: any) => {
            init[u.id] = u.roles.map((r: any) => r.name);
        });

        return init;
    });

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState<{ [key: number]: boolean }>({});
    const [loadingPromote, setLoadingPromote] = useState<{ [key: number]: boolean }>({});

    function ajoutUser(e: any) {
        e.preventDefault();
        post('/admin/users', {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                reset();
                setOpenCreateDialog(false);
            }
        });
    }

   

    
    function updateRoles(userId: number) {
        setLoadingRoles(prev => ({ ...prev, [userId]: true }));
        router.post(`/admin/users/${userId}/roles`, {
            roles: selectedRoles[userId] ?? [],
        }, {
            preserveScroll: true,
            preserveState: true, 
            onFinish: () => setLoadingRoles(prev => ({ ...prev, [userId]: false })),
        });
    }

    
    function promouvoir(userId: number) {
        setLoadingPromote(prev => ({ ...prev, [userId]: true }));
        router.post(`/admin/users/${userId}/promote-user`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                
                setSelectedRoles(prev => ({
                    ...prev,
                    [userId]: [...(prev[userId] ?? []).filter(r => r !== 'enseignant'), 'enseignant']
                }));
            },
            onFinish: () => setLoadingPromote(prev => ({ ...prev, [userId]: false })),
        });
    }

    function getInitials(name: string) {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    function getRoleColor(roleName: string) {
        const colors: { [key: string]: string } = {
            'admin': 'destructive',
            'enseignant': 'default',
            'etudiant': 'secondary',
        };

        return colors[roleName.toLowerCase()] || 'outline';
    }

    useEffect(() => {
        setSelectedRoles(prev => {
            const updated = { ...prev };
            users.forEach((u: any) => {
                if (!(u.id in updated)) {
                    updated[u.id] = u.roles.map((r: any) => r.name);
                }

                if (!(u.id in updated)) {
                    updated[u.id] = u.roles.map((r: any) => r.name);
                }
            });

            return updated;
        });
    }, [users]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des utilisateurs" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
                        <p className="text-muted-foreground">Gérez les utilisateurs, leurs rôles et permissions</p>
                    </div>

                    <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Nouvel utilisateur
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Créer un utilisateur</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations pour créer un nouvel utilisateur
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={ajoutUser}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nom complet</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="name" placeholder="Jean Dupont" className="pl-9"
                                                value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="email" type="email" placeholder="jean@exemple.com" className="pl-9"
                                                value={data.email} onChange={e => setData('email', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Mot de passe</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="password" type="password" placeholder="••••••••" className="pl-9"
                                                value={data.password} onChange={e => setData('password', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Rôles</Label>
                                        <div className="rounded-lg border p-4 space-y-2">
                                            {roles.map((role: any) => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`create-role-${role.name}`}
                                                        checked={data.roles.includes(role.name)}
                                                        onCheckedChange={(checked) => {
                                                            setData('roles', checked
                                                                ? [...data.roles, role.name]
                                                                : data.roles.filter(r => r !== role.name)
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`create-role-${role.name}`} className="cursor-pointer">
                                                        {role.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpenCreateDialog(false)}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? "Création..." : "Créer"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UsersIcon className="h-5 w-5" />
                            Liste des utilisateurs
                        </CardTitle>
                        <CardDescription>Total : {users.length} utilisateur(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="space-y-4">
                                {users.map((user: any) => (
                                    <Card key={user.id} className="overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col divide-y">
                                                <div className="flex items-start gap-4 p-4 md:items-center">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                            <div>
                                                                <h3 className="font-semibold">{user.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(selectedRoles[user.id] ?? []).map((roleName: string) => (
                                                                    <Badge key={roleName} variant={getRoleColor(roleName) as any}>
                                                                        {roleName === 'enseignant' && <GraduationCap className="mr-1 h-3 w-3" />}
                                                                        {roleName === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                                                                        {roleName}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
                                                    <div className="flex-1 space-y-2">
                                                        <Label className="text-sm font-medium">Modifier les rôles</Label>
                                                        <div className="flex flex-wrap gap-4">
                                                            {roles.map((role: any) => (
                                                                <div key={role.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`${user.id}-${role.name}`}
                                                                        checked={(selectedRoles[user.id] ?? []).includes(role.name)}
                                                                        onCheckedChange={(checked) => {
                                                                            setSelectedRoles(prev => {
                                                                                const current = prev[user.id] ?? [];

                                                                                return {
                                                                                    ...prev,
                                                                                    [user.id]: checked
                                                                                        ? [...current, role.name]
                                                                                        : current.filter(r => r !== role.name)
                                                                                };
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`${user.id}-${role.name}`} className="text-sm">
                                                                        {role.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline"
                                                            onClick={() => updateRoles(user.id)}
                                                            disabled={loadingRoles[user.id]}
                                                            className="gap-2">
                                                            <RefreshCw className={`h-3 w-3 ${loadingRoles[user.id] ? 'animate-spin' : ''}`} />
                                                            Mettre à jour les rôles
                                                        </Button>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="secondary" className="gap-2"
                                                                    disabled={(selectedRoles[user.id] ?? []).includes('enseignant') || loadingPromote[user.id]}>
                                                                    <GraduationCap className="h-3 w-3" />
                                                                    Promouvoir enseignant
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirmation</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Êtes-vous sûr de vouloir promouvoir {user.name} en tant qu'enseignant ?
                                                                        Cette action lui donnera des permissions supplémentaires.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => promouvoir(user.id)}>
                                                                        Confirmer
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}