import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

// shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from '@/layouts/app-layout';

export default function Permissions({ permissions, roles }: any) {

    const { data, setData, post, reset } = useForm({
        name: ''
    });

    // const assignRoleForm = useForm({
    //     role: '',
    //     permissions: [] as string[],
    // });

    const [selected, setSelected] = useState<{[key:string]: string[]}>({});

    
    function handlePermissionSubmit (e:any) {
        e.preventDefault();
        post('/admin/permissions', {
            onSuccess: () => reset()
        });
    };

    
    function assignRole(roleName: string) {
    router.post('/admin/permissions/assign', {
        role: roleName,
        permissions: selected[roleName] || []
    });
};

    return (
        <AppLayout>
            <div className="p-6 space-y-6">

                
                <Card>
                    <CardHeader>
                        <CardTitle>Créer permission</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handlePermissionSubmit} className="flex gap-2">
                            <Input
                                placeholder="ex: publish cours"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            <Button>Ajouter</Button>
                        </form>
                    </CardContent>
                </Card>

                
                {roles.map((role:any) => (
                    <Card key={role.id}>
                        <CardHeader>
                            <CardTitle>{role.name}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">

                            {permissions.map((perm:any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        defaultChecked={role.permissions.some((p:any)=>p.name === perm.name)}
                                        onCheckedChange={(checked) => {
                                            setSelected(prev => {
                                                const current = prev[role.name] || role.permissions.map((p:any)=>p.name);

                                                let updated;

                                                if (checked) {
                                                    updated = [...new Set([...current, perm.name])];
                                                } else {
                                                    updated = current.filter(p => p !== perm.name);
                                                }

                                                return {
                                                    ...prev,
                                                    [role.name]: updated
                                                };
                                            });
                                        }}
                                    />
                                    <Label>{perm.name}</Label>
                                </div>
                            ))}

                            <Button onClick={() => assignRole(role.name)}>
                                Sauvegarder
                            </Button>

                        </CardContent>
                    </Card>
                ))}

            </div>
        </AppLayout>
    );
}