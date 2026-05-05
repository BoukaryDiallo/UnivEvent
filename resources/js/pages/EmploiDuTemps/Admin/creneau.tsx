import { Head, useForm } from '@inertiajs/react';
import { Edit,Trash } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import Pagination from '@/components/edt/paginate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell,TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Emplois du Temps', href: '/emploie-du-temps' },
    { title: 'Gestion des creneaux', href: '/emploie-du-temps/listes' },
];


export default function Creneau({ creneaux }: { creneaux: any[] }) {

    const [select, setSelect] = useState<null | object>(null)
    const [action, setAction] = useState< null | string >(null)
    // const [sup, setSup] = useState< boolean >(false)
    const creneau = useForm({
        heure_debut: '',
        heure_fin: ''
    })
    

     function validateCreneau(){

        if(creneau.data.heure_fin < creneau.data.heure_debut) {
return false
}

        return true
    }

    async function modifierSalle(e: React.FormEvent) {
        e.preventDefault()

        if(!select) {
return
}

        if(!validateCreneau()) {
return
}

        creneau.put(`/creneaux/${select?.id}/modifier`,{
            
            onSuccess: (()=>{
                toast.success('Creneau mise à jour avec succès')
                setAction(null)
                setSelect(null)
                creneau.reset()

            }),

            onError: (()=>{
                
                toast.error('Erreur Veuilez reesayer')
                
            })
        })


        
    }

    async function supprimerCreneau(e: React.FormEvent) {
        e.preventDefault()

        if(!select?.id) {
return
}

        creneau.delete(`/creneaux/${select?.id}/supprimer`,{
            
            onSuccess: (()=>{
                toast.success('Creneau supprimée avec succès')
                setAction(null)
                setSelect(null)
                creneau.reset()

            }),

            onError: (()=>{
                
                toast.error('Erreur Veuillez reessayer')
                
            })
        })


        
    }



   


    return (
        <>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Gestion des creneaux" />

            <div className="p-6 space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Creneaux</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="">
                            <TableHeader className='bg-gray-600/50'>
                                <TableRow className="">
                                    <TableHead className="text-center">Libelle</TableHead>
                                    <TableHead className="text-center">Heure de début</TableHead>
                                    <TableHead className="text-center">Heure de fin</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className='text-center'>

                                {creneaux.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className='py-5 text-center text-gray-400'>
                                            Pas encore de creneau enregistrée
                                        </TableCell>
                                    </TableRow>
                                ): creneaux.data.map((c: any) => (
                                    <TableRow key={c.id} className="">
                                        <TableCell className="py-5">{c.libelle || 'N/A'}</TableCell>
                                        <TableCell className="py-5">{c.heure_debut || 'N/A'}</TableCell>
                                        <TableCell className="py-5">{c.heure_fin || 'N/A'}</TableCell>
                                        <TableCell className="py-5 space-x-3">
                                            <Button 
                                                variant={'default'}
                                                onClick={() => {
                                                    setSelect(c)
                                                    setAction('modif')
                                                    creneau.setData('heure_debut', c.heure_debut)
                                                    creneau.setData('heure_fin', c.heure_fin)
                                                }}
                                            >
                                                <Edit />Modifier
                                            </Button>
                                            <Button 
                                                variant={'destructive'}
                                                onClick={() =>{
                                                    setSelect(c)
                                                    setAction('sup')
                                                } }
                                            >
                                                <Trash />Supprimer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                        
                        
                    </CardContent>
                </Card>
                <Pagination links={creneaux.links}/>
            </div>
        </AppLayout>

        
        <Dialog open={action === 'modif'} onOpenChange={(open) => {
                if (!open) {
setAction(null)
}
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={modifierSalle} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Modifier le creneau</DialogTitle>
                        <DialogDescription>
                            Saisissez de nouvelles informations sur la creneau.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="heure_debut">Nom de la creneau</Label>
                            <Input type='time' id="heure_debut" name="heure_debut" value={creneau.data.heure_debut}
                                onChange={(e)=>{
creneau.setData('heure_debut', e.target.value) 
}} />
                            
                        </Field>

                        <Field>
                            <Label htmlFor="heure_fin">Nom de la creneau</Label>
                            <Input type='time' id="heure_fin" name="heure_fin" value={creneau.data.heure_fin}
                                onChange={(e)=>{
creneau.setData('heure_fin', e.target.value) 
}} />
                            
                        </Field>

                        <Field>
                            <Label htmlFor="libelle">Libelle</Label>
                            <Input disabled id="libelle" name="libelle" value={select?.libelle} />
                            
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                            disabled={creneau.processing || !validateCreneau()}
                        >
                            {creneau.processing ? <Spinner /> : 'Enregistrer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>


        <Dialog open={action === 'sup'} onOpenChange={(open) => {
                if (!open) {
setAction(null)
}
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={supprimerCreneau} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Suppression du creneau</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible, Êtes-vous sûr de vouloir supprimer ce creneau: {select?.libelle || 'N/A'}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                        variant={'destructive'}
                            disabled={creneau.processing || !select?.id}
                        >
                            {creneau.processing ? <Spinner /> : 'Supprimer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>
        
        </>
    );
}