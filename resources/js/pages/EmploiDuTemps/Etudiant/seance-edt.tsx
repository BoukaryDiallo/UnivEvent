import { Head } from '@inertiajs/react';
import { formatDate } from '@/components/edt/formatDate';
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
    { title: 'Emplois du Temps', href: '/emploie-du-temps/edt-etudiant' },
    { 
        title: 'Seances', 
        href: '#' 
    },
];



export default function SeanceEdt({ seances, emplois }: { seances: any[], emplois: any[] }) {
    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seances" />

            <div className="p-6">
                <p className=' text-xl text-gray-400'>Emploi du temps - Année académique {emplois?.annee_academique?.libelle || 'N/A'}</p>
                <p className=' text-gray-400'>
                    Période du
                    <span className='font-bold mx-2'>{formatDate(emplois?.date_debut) || 'N/A'}</span> au 
                    <span className='font-bold mx-2'>{formatDate(emplois?.date_fin) || 'N/A'}</span>
                </p>

                <Card className='mt-6'>
                    <CardHeader>
                        <CardTitle>
                            <p className='mb-2'>Grille Hebdomadaire</p>
                            <span className='text-red-600 text-sm'>NB: L'emploie du temps peut subir des modification en fonction de la disponibilté des enseignants. Veuillez donc consulter la plateforme regulierment.</span>
                            
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="overflow-x-auto">
                            {/* <table className="w-full border text-center"> */}
                                <TableHeader className='bg-gray-600/50 '>
                                    <TableRow className=''>
                                        <TableHead className="text-center border">Jour</TableHead>
                                        <TableHead className="text-center border">Module</TableHead>
                                        <TableHead className="text-center border">Salle</TableHead>
                                        <TableHead className="text-center border">Type de Séance</TableHead>
                                        <TableHead className="text-center border">Enseignant</TableHead>
                                        <TableHead className="text-center border">Heures</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className='text-center'>
                                    
                                    {seances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                                Aucune seance pour le moment.
                                            </TableCell>
                                        </TableRow>
                                    ): seances.map((s: any) => (
                                        <TableRow key={s.id} className=''>
                                            <TableCell className="py-5 border">{s?.jour_semaine || 'N/A'}</TableCell>
                                            {!s?.prise_id ? (
                                                <>
                                                <TableCell className="py-5 border">-</TableCell>
                                                <TableCell className="py-5 border">-</TableCell>
                                                <TableCell className="py-5 border">-</TableCell>
                                                <TableCell className="py-5 border">-</TableCell>
                                                <TableCell className="py-5 border">-</TableCell>
                                                </>
                                            ):(
                                                <>
                                            <TableCell className="py-5 border">
                                                <div className=''>
                                                    <p>{s.matiere?.intitule || 'N/A'}</p>
                                                    <p className='text-xs text-gray-400'>{s?.description || 'Aucune description'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 border">{s.salle?.nom || 'N/A'}</TableCell>
                                            <TableCell className="py-5 border">
                                                <div className=''>
                                                    <p>{s?.type_seance || 'N/A'}</p>
                                                    <p className='text-xs text-gray-400'>
                                                        {s?.type_seance === 'TD' && ('Travaux Dirigés')}
                                                        {s?.type_seance === 'TP' && ('Travaux Pratiques')}
                                                        {s?.type_seance === 'CM' && ('Cours Magistral')}
                                                        {s?.type_seance === 'Examen' && ('Exaamen (Devoir)')}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 border">
                                                <div className=''>
                                                
                                                <p>{s.enseignant?.nom || 'N/A'} {s.enseignant?.prenom || 'N/A'}</p>
                                                <p className='text-xs text-gray-400'>
                                                    {s.enseignant?.specialite || '-'}
                                                </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 border">{s.creneau?.libelle || 'N/A'}</TableCell>
                                            </>
                                            )}
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