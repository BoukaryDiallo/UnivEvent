import { Head, router, useForm } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { Lock, Plus, RefreshCcw, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

// shadcn
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/layouts/app-layout';
import { assign as assignPermissions, index as permissionsIndex, store as storePermission } from '@/routes/admin/permissions';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permissions',
        href: permissionsIndex(),
    },
];

export default function Permissions({ permissions, roles }: any) {
    const { data, setData, post, processing, reset } = useForm({ name: '' });

   
    const [selected, setSelected] = useState<{ [key: string]: string[] }>(() => {
        const init: { [key: string]: string[] } = {};
        roles.forEach((role: any) => {
            init[role.name] = role.permissions.map((p: any) => p.name);
        });

        return init;
    });

    const [loadingSave, setLoadingSave] = useState<{ [key: string]: boolean }>({});

    
    useEffect(() => {
        setSelected(prev => {
            const updated = { ...prev };
            roles.forEach((role: any) => {
                if (!(role.name in updated)) {
                    updated[role.name] = role.permissions.map((p: any) => p.name);
                }
            });

            return updated;
        });
    }, [roles, permissions]);

    function handlePermissionSubmit(e: any) {
        e.preventDefault();
        post(storePermission().url, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => reset(),
        });
    }

    function assignRole(roleName: string) {
        setLoadingSave(prev => ({ ...prev, [roleName]: true }));
        router.post(assignPermissions().url, {
            role: roleName,
            permissions: selected[roleName] ?? [],
        }, {
            preserveScroll: true,
            preserveState: true, 
            onFinish: () => setLoadingSave(prev => ({ ...prev, [roleName]: false })),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Permissions & Rôles</h1>
                    <p className="text-muted-foreground">Gérez les permissions et assignez-les aux rôles</p>
                </div>

                <Separator />

                {/* Créer une permission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Créer une permission
                        </CardTitle>
                        <CardDescription>
                            {permissions.length} permission(s) existante(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handlePermissionSubmit} className="flex gap-2">
                            <Input
                                placeholder="ex: publish cours"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={processing} className="gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                {processing ? "Ajout..." : "Ajouter"}
                            </Button>
                        </form>

                        {/* Liste de toutes les permissions existantes */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {permissions.map((perm: any) => (
                                <Badge key={perm.id} variant="outline">
                                    {perm.name}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions par rôle */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {roles.map((role: any) => {
                        const roleSelected = selected[role.name] ?? [];
                        const total = permissions.length;
                        const count = roleSelected.length;

                        return (
                            <Card key={role.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            {role.name}
                                        </CardTitle>
                                        <Badge variant={count === total ? 'default' : 'secondary'}>
                                            {count}/{total}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {count === 0
                                            ? "Aucune permission"
                                            : count === total
                                                ? "Toutes les permissions"
                                                : `${count} permission(s) assignée(s)`}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex flex-col gap-4 flex-1">
                                    <ScrollArea className="h-48">
                                        <div className="space-y-2 pr-3">
                                            {permissions.map((perm: any) => (
                                                <div key={perm.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${role.name}-${perm.name}`}
                                                        // ✅ checked contrôlé, pas defaultChecked
                                                        checked={roleSelected.includes(perm.name)}
                                                        onCheckedChange={(checked) => {
                                                            setSelected(prev => {
                                                                const current = prev[role.name] ?? [];

                                                                return {
                                                                    ...prev,
                                                                    [role.name]: checked
                                                                        ? [...new Set([...current, perm.name])]
                                                                        : current.filter(p => p !== perm.name),
                                                                };
                                                            });
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`${role.name}-${perm.name}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {perm.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>

                                    {/* Tout cocher / décocher */}
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground underline"
                                            onClick={() => setSelected(prev => ({
                                                ...prev,
                                                [role.name]: permissions.map((p: any) => p.name)
                                            }))}
                                        >
                                            Tout sélectionner
                                        </button>
                                        <span className="text-muted-foreground">·</span>
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground underline"
                                            onClick={() => setSelected(prev => ({
                                                ...prev,
                                                [role.name]: []
                                            }))}
                                        >
                                            Tout décocher
                                        </button>
                                    </div>

                                    <Button
                                        onClick={() => assignRole(role.name)}
                                        disabled={loadingSave[role.name]}
                                        className="gap-2 mt-auto"
                                    >
                                        <RefreshCcw className={`h-3 w-3 ${loadingSave[role.name] ? 'animate-spin' : ''}`} />
                                        {loadingSave[role.name] ? "Sauvegarde..." : "Sauvegarder"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
