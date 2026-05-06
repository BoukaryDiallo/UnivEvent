import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { JuryDashboard } from '@/modules/module5/components/JuryDashboard';
import type { BreadcrumbItem } from '@/types';

type JuryPanelProps = {
    concours: any;
    candidatures: any[];
    criteres: any[];
};

export default function JuryPanel({ concours, candidatures, criteres }: JuryPanelProps) {
    console.log('JuryPanel props:', { concours, candidatures, criteres });
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Jury', href: '/module5/jury' },
        { title: concours?.titre || 'Concours', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Évaluation - ${concours?.titre || 'Concours'}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">{concours?.titre || 'Concours'}</h1>
                        <p className="text-muted-foreground">Panel d'évaluation</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/module5/jury">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                </div>

                {/* Jury Dashboard */}
                <div className="mb-8">
                    <JuryDashboard
                        event={concours}
                        juryPanel={concours?.juryPanel ?? null}
                        canJuryMember={true}
                        canPresident={false}
                    />
                </div>

                {/* Critères */}
                {criteres && criteres.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Critères d'Évaluation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {criteres.map((crit: any) => (
                                    <div key={crit.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                        <span className="font-medium">{crit.name || crit.titre}</span>
                                        <Badge>{crit.max_score || '100'} points</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Candidatures */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Candidatures à Évaluer</h2>
                    
                    {candidatures && candidatures.length > 0 ? (
                        <div className="grid gap-4">
                            {candidatures.map((cand: any) => (
                                <Card key={cand.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">{cand.nom}</CardTitle>
                                                <p className="text-sm text-muted-foreground">ID: {cand.id}</p>
                                            </div>
                                            {cand.statut_evaluation === 'evalué' ? (
                                                <Badge>
                                                    <CheckIcon className="mr-2 h-4 w-4" />
                                                    Évalué
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">En attente</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {cand.fichier_url && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={cand.fichier_url} target="_blank" rel="noreferrer">
                                                    Voir le fichier
                                                </a>
                                            </Button>
                                        )}
                                        <Button className="w-full">
                                            Évaluer cette candidature
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">Aucune candidature à évaluer</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
