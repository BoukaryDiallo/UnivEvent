import {  Head, useForm } from '@inertiajs/react';
import { Edit, Search, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';
import Pagination from '@/components/edt/paginate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Emplois du Temps', href: '/emploie-du-temps' },
    { title: 'Gestion des cycles', href: '/emploie-du-temps/listes' },
];


export default function Niveau({ niveaux }: { niveaux: any[] }) {

    const [select, setSelect] = useState<null | any>(null)
    const [action, setAction] = useState< null | string >(null)
    // const [sup, setSup] = useState< boolean >(false)
    const niveau = useForm({
        nom: '',
        code: '',
        ordre: 1
    })
    const [search, setSearch] = useState<string>("")

    const filtreData = useMemo(()=>{
    
            if(!niveaux.data || !Array.isArray(niveaux.data)) {
return []
}
    
            let resultat = niveaux.data
            
            if(search.trim()){
                const s = search.toLowerCase()
    
                resultat = resultat.filter((n)=>(
                    n.nom.toLowerCase().includes(s) ||
                    n.code.toLowerCase().includes(s)
                ))
    
            }
    
            return resultat
    
    
        },[search, niveaux.data])


    function validateNiveau(){

        if(!niveau.data.code.trim()) {
return false
}

        if(!niveau.data.nom.trim()) {
return false
}

        if(niveau.data.ordre < 1) {
return false
}

        return true
    }
    


    async function modifierNiveau(e: React.FormEvent) {
        e.preventDefault()

        if(!select) {
return
}

        if(!validateNiveau()) {
return
}

        niveau.put(`/niveaux/${select?.id}/modifier`,{
            
            onSuccess: (()=>{
                toast.success('Cycle mis à jour avec succès')
                setAction(null)
                setSelect(null)
                niveau.reset()

            }),

            onError: ((errors)=>{
                if(errors.nom){
                    toast.error(errors.nom)
                }else if(errors.code){
                    toast.error(errors.code)
                }else{
                    toast.error('Erreur lors de la mise à jour')
                }
                
            })
        })


        
    }

    async function supprimerNiveau(e: React.FormEvent) {
        e.preventDefault()

        if(!select?.id) {
return
}

        niveau.delete(`/niveaux/${select?.id}/supprimer`,{
            
            onSuccess: (()=>{
                toast.success('Cycle supprimée avec succès')
                setAction(null)
                setSelect(null)
                niveau.reset()

            }),

            onError: (()=>{
                
                toast.error('Erreur lors de la suppresiion')
                
            })
        })


        
    }


    return (
        <>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Gestion des niveaux" />

            <div className="p-6 space-y-6">
                <div className='relative max-w-xl'>
                    <Input type='text' value={search}
                        onChange={(e)=>{
setSearch(e.target.value)
}}
                        placeholder='Rechercher par libellé, code...'
                        className=' px-8 py-5'
                    />
                    <Search className='absolute top-4 left-2 h-4 w-4 text-gray-400' />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Niveaux d'études (cycle)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="">
                            <TableHeader className='bg-gray-600/50'>
                                <TableRow className="">
                                    <TableHead className="text-center">Libellé</TableHead>
                                    <TableHead className="text-center">Code</TableHead>
                                    <TableHead className="text-center">Ordre hiérarchique</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className='text-center'>
                                {filtreData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className='py-5 text-center text-gray-400'>
                                            {search.trim() ? 'Aucune résultat' : 'Pas encore de cycle enregistrée'}
                                        </TableCell>
                                    </TableRow>
                                ):filtreData.map((n: any) => (
                                    <TableRow key={n.id} className="">
                                        <TableCell className="py-5">{n.nom || 'N/A'}</TableCell>
                                        <TableCell className="py-5">{n.code || 'N/A'}</TableCell>
                                        <TableCell className="py-5">{n.ordre || 'N/A'}</TableCell>
                                        <TableCell className="py-5 space-x-3">
                                            <Button 
                                                variant={'default'}
                                                onClick={() => {
                                                    setSelect(n)
                                                    setAction('modif')
                                                    niveau.setData('nom', n.nom)
                                                    niveau.setData('code', n.code)
                                                    niveau.setData('ordre', Number(n.ordre))
                                                }}
                                            >
                                                <Edit />Modifier
                                            </Button>
                                            <Button 
                                                variant={'destructive'}
                                                onClick={() =>{
                                                    setSelect(n)
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
                <Pagination links={niveaux.links}/>
            </div>
        </AppLayout>

        
        <Dialog open={action === 'modif'} onOpenChange={(open) => {
                if (!open) {
setAction(null)
}
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={modifierNiveau} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Modifier ce Niveau</DialogTitle>
                        <DialogDescription>
                            Saisissez les nouvelles informations sur le niveau.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="nom">Cyle</Label>
                            <Input id="nom" name="nom" value={niveau.data.nom}
                                onChange={(e)=>{
niveau.setData('nom', e.target.value) 
}} placeholder='Ex: Licence 1' />
                            
                        </Field>
                        <Field>
                            <Label htmlFor="code">Code de référence</Label>
                            <Input id="code" name="code" value={niveau.data.code}
                                onChange={(e)=>{
niveau.setData('code', e.target.value) 
}} placeholder='Ex: Licence 1 équivaut à L1' />
                           
                        </Field>
                        <Field>
                            <Label htmlFor="ordre">Ordre chronologique</Label>
                            <Input type='number' id="ordre" name="ordre" value={niveau.data.ordre}
                            onChange={(e) => niveau.setData('ordre', Number(e.target.value))}/>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                            disabled={niveau.processing || !validateNiveau()}
                        >
                            {niveau.processing ? <Spinner /> : 'Enregistrer'}</Button>
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
                <form onSubmit={supprimerNiveau} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Suppression de la niveau</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible, Êtes-vous sûr de vouloir supprimer cet niveau {select?.nom || 'N/A'}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                        variant={'destructive'}
                            disabled={niveau.processing || !select?.id}
                        >
                            {niveau.processing ? <Spinner /> : 'Supprimer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>
        
        </>
    );
}