import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import Pagination from '@/components/edt/paginate';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Emplois du Temps', href: '/emploie-du-temps' },
];

export default function EtudiantEdt({ emplois, filieres, filters = {} }: { 
    emplois: any; 
    filieres: any[];
    filters?: any;
}) {

   const [filiereId, setFiliereId] = useState(filters.id_filiere || '')
    const handleFilter = (value: string) => {
        setFiliereId(value)
        router.get('/emploie-du-temps/edt-etudiant', 
            value === 'choisir' ? {} : { id_filiere: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes Emplois du Temps" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Emplois du Temps Disponibles</h1>

                <div className="flex gap-4">
                    <Select value={filiereId} onValueChange={handleFilter}>
                        <SelectTrigger className="w-80">
                            <SelectValue placeholder="Filtrer par filière" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="choisir">Toutes les filières</SelectItem>
                            {filieres.map((f: any) => (
                                <SelectItem key={f.id_filiere} value={f.id_filiere.toString()}>
                                    {f.nom} ({f.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Emplois du Temps ({emplois.total > 9 ? emplois.total : `0${emplois.total}`} résultats)</CardTitle>
                    </CardHeader>
                    <CardContent>

                        {emplois.total === 0 ? (
                            <div className='space-y-10 text-center text-gray-400'>
                                <p>Aucun emploi du temps trouvé</p>
                            </div>

                        ): emplois.data.map((edt: any) => (
                            <div key={edt.id} className="border-b py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{edt?.titre || 'Emploi du temps'}</p>
                                    <p className="text-sm text-gray-500">
                                        {edt.filiere?.nom} • {edt.niveau?.nom} • {edt.semestre} {edt.groupe ?`• ${edt.groupe}` : ''} 
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button asChild variant="outline">
                                        <Link href={`/emploie-du-temps/${edt.id}/vue`}>
                                            <Eye className="mr-2 h-4 w-4" /> Voir les séances
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.href = `/emploie-du-temps/${edt.id}/pdf`}
                                    >
                                        <Download className="mr-2 h-4 w-4" /> PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Pagination links={emplois.links} />
            </div>
        </AppLayout>
    );
}