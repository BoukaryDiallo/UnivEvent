import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { formatDate } from '@/components/edt/formatDate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { 
        title: 'Dashboard', 
        href: dashboard() 
    },
    { 
        title: 'Mon Emploi du Temps', 
        href: '#' 
    },
];

export default function EnseigantEdt({ seances }: { seances: any[] }) {

    const edtId = seances?.[0]?.emploi_du_temps?.id
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon Emploi du Temps" />

            <div className="p-6">

                <div className='flex items-center justify-between'>

                {seances.length > 0 && (
                    <p className=' text-gray-400'>
                        Période du
                        <span className='font-bold mx-2'>{formatDate(seances?.[0]?.emploi_du_temps?.date_debut) || 'N/A'}</span> au 
                        <span className='font-bold mx-2'>{formatDate(seances?.[0]?.emploi_du_temps?.date_fin) || 'N/A'}</span>
                    </p>
                )}

                <Button variant={'default'}
                    disabled={!edtId}
                    onClick={() => edtId && (window.location.href = `/emploie-du-temps/${edtId}/pdf-enseignant`)}
                >
                    <Download className='mr-1' />Télécharger PDF
                </Button>

                </div>

                <Card className='my-6'>
                    <CardHeader>
                        <CardTitle>Grille Hebdomadaire</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="overflow-x-auto">
                            {/* <table className="w-full border text-center"> */}
                                <TableHeader className='bg-gray-600/50 '>
                                    <TableRow className=''>
                                        <TableHead className="text-center border">Jour</TableHead>
                                        <TableHead className="text-center border">Module</TableHead>
                                        <TableHead className="text-center border">Salle</TableHead>
                                        <TableHead className="text-center border">Type de seance</TableHead>
                                        <TableHead className="text-center border">Heures</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className='text-center'>
                                    
                                    {seances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                                Aucune seance pour l'instant.
                                            </TableCell>
                                        </TableRow>
                                    ): seances.map((s: any) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="py-5 border">{s?.jour_semaine || 'N/A'}</TableCell>
                                            <TableCell className="py-5 border">{s.matiere?.intitule || 'N/A'}</TableCell>
                                            <TableCell className="py-5 border">{s.salle?.nom || 'N/A'}</TableCell>
                                            <TableCell className="py-5 border">
                                                {s?.type_seance === 'TD' && ('Travaux Dirigés')}
                                                {s?.type_seance === 'TP' && ('Travaux Pratiques')}
                                                {s?.type_seance === 'CM' && ('Cours Magistral')}
                                                {s?.type_seance === 'Examen' && ('Examen (Devoir)')}
                                            </TableCell>
                                            <TableCell className="py-5 border">{s.creneau?.libelle || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}

                                
                                    
                                </TableBody>
                            </Table>
                        {/* </div> */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}