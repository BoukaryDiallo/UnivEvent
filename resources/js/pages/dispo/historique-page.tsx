import { Head, router } from '@inertiajs/react';
import { History } from 'lucide-react';
import { DispoShell } from '@/components/dispo/entete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import type { LigneHistoriqueDisponibilite, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Historique des disponibilites', href: '/historique-disponibilites' },
];

const badgeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    CREATION: 'default',
    MODIFICATION: 'secondary',
    SUPPRESSION: 'destructive',
    RESTAURATION: 'outline',
};

export default function HistoriquePage({
    user,
    resume,
    historique,
}: {
    user: UserDispo;
    resume: ResumeDispo;
    historique: LigneHistoriqueDisponibilite[];
}) {
    return (
        <DispoShell
            title="Historique des disponibilites"
            description="Consultez les actions effectuees sur vos disponibilites et restaurez un creneau desactive si besoin."
            breadcrumbs={breadcrumbs}
            resume={resume}
            user={user}
            showResume={false}
        >
            <Head title="Historique des disponibilites" />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="size-4" />
                        Contenu de l historique
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {historique.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune action n a encore ete enregistree.</p>
                    ) : (
                        historique.map((ligne) => (
                            <div key={ligne.id} className="flex flex-col gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={badgeVariants[ligne.action] ?? 'secondary'}>{ligne.action}</Badge>
                                        <span className="text-xs text-muted-foreground">[{ligne.created_at}]</span>
                                    </div>
                                    <p className="text-sm">{ligne.description}</p>
                                </div>
                                {ligne.action === 'SUPPRESSION' ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            router.post(`/dispos/${ligne.dispo_id}/restaurer`);
                                        }}
                                    >
                                        Restaurer
                                    </Button>
                                ) : null}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </DispoShell>
    );
}
