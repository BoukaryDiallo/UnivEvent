import { Form, Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Edit, Eye, Search, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import Pagination from '@/components/edt/paginate';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Emplois du Temps', href: '/emploie-du-temps' },
    { title: 'Gestion des salles', href: '/emploie-du-temps/listes' },
];


export default function Salle({ salles }: { salles: any[] }) {

    const [select, setSelect] = useState<null | {}>(null)
    const [action, setAction] = useState< null | string >(null)
    // const [sup, setSup] = useState< boolean >(false)
    const salle = useForm({
        nom: ''
    })
    const [search, setSearch] = useState<string>("")
    
    const filtreData = useMemo(()=>{

        if(!salles.data || !Array.isArray(salles.data)) return []

        let resultat = salles.data
        
        if(search.trim()){
            const s = search.toLowerCase()

            resultat = resultat.filter((salle)=>(
                salle.nom.toLowerCase().includes(s)
            ))

        }

        return resultat


    },[search, salles.data])

    async function modifierSalle(e: React.FormEvent) {
        e.preventDefault()
        if(!select) return

        salle.put(`/salles/${select?.id}/modifier`,{
            
            onSuccess: (()=>{
                toast.success('Salle mise à jour avec succès')
                setAction(null)
                setSelect(null)
                salle.reset()

            }),

            onError: ((e)=>{
                
                toast.error(salle.errors.nom || 'Erreur lors de l\'ajout de la salle')
                
            })
        })


        
    }

    async function supprimerSalle(e: React.FormEvent) {
        e.preventDefault()
        if(!select?.id) return

        salle.delete(`/salles/${select?.id}/supprimer`,{
            
            onSuccess: (()=>{
                toast.success('Salle supprimée avec succès')
                setAction(null)
                setSelect(null)
                salle.reset()

            }),

            onError: ((e)=>{
                
                toast.error(salle.errors.nom || 'Erreur lors de l\'ajout de la salle')
                
            })
        })


        
    }


    return (
        <>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Gestion des salles" />

            <div className="p-6 space-y-6">

                <div className='relative max-w-xl'>
                    <Input type='text' value={search}
                        onChange={(e)=>{setSearch(e.target.value)}}
                        placeholder='Rechercher une salle...'
                        className=' px-8 py-5'
                    />
                    <Search className='absolute top-4 left-2 h-4 w-4 text-gray-400' />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Salles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="">
                            <TableHeader className='bg-gray-600/50'>
                                <TableRow className="">
                                    <TableHead className="text-center">Nom de la salle</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className='text-center'>

                                {filtreData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className='py-5 text-center text-gray-400'>
                                            {search.trim() ? 'Aucune résultat' : 'Pas encore de salle enregistrée'}
                                        </TableCell>
                                    </TableRow>
                                ): filtreData.map((s: any) => (
                                    <TableRow key={s.id} className="">
                                        <TableCell className="py-5">{s.nom || 'N/A'}</TableCell>
                                        <TableCell className="py-5 space-x-3">
                                            <Button 
                                                variant={'default'}
                                                onClick={() => {
                                                    setSelect(s)
                                                    setAction('modif')
                                                    salle.setData('nom', s.nom)
                                                }}
                                            >
                                                <Edit />Modifier
                                            </Button>
                                            <Button 
                                                variant={'destructive'}
                                                onClick={() =>{
                                                    setSelect(s)
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
                <Pagination links={salles.links}/>
            </div>
        </AppLayout>

        
        <Dialog open={action === 'modif'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={modifierSalle} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Modifier la salle</DialogTitle>
                        <DialogDescription>
                            Saisissez de nouvelles informations sur la salle.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="nom">Nom de la salle</Label>
                            <Input id="nom" name="nom" value={salle.data.nom}
                                onChange={(e)=>{salle.setData('nom', e.target.value) }} placeholder='Ex: Amphi H' />
                            <InputError message={salle.errors.nom} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                            disabled={salle.processing || !select?.nom.trim()}
                        >
                            {salle.processing ? <Spinner /> : 'Enregistrer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>


        <Dialog open={action === 'sup'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={supprimerSalle} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Suppression de la salle</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible, Êtes-vous sûr de vouloir supprimer la salle {select?.nom || 'N/A'}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                        variant={'destructive'}
                            disabled={salle.processing || !select?.id}
                        >
                            {salle.processing ? <Spinner /> : 'Supprimer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>
        
        </>
    );
}