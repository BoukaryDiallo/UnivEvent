import { Head,useForm } from '@inertiajs/react';
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
    { title: 'Gestion des cours', href: '/emploie-du-temps/listes' },
];


export default function Niveau({ matieres }: { matieres: any[] }) {

    const [select, setSelect] = useState<null | object>(null)
    const [action, setAction] = useState< null | string >(null)
    // const [sup, setSup] = useState< boolean >(false)
    const matiere = useForm({
        code: '',
        intitule: '',
        volume_horaire_cm: 0,
        volume_horaire_tp: 0,
        volume_horaire_td: 0,
    })

    const [search, setSearch] = useState<string>("")

    const filtreData = useMemo(()=>{

        if(!matieres.data || !Array.isArray(matieres.data)) {
return []
}

        let resultat = matieres.data
        
        if(search.trim()){
            const s = search.toLowerCase()

            resultat = resultat.filter((m)=>(
                m.code.toLowerCase().includes(s) ||
                m.intitule.toLowerCase().includes(s)
            ))

        }

        return resultat


    },[search, matieres.data])


    function validateMatiere(){

        if(!matiere.data.code.trim()) {
return false
}

        if(!matiere.data.intitule.trim()) {
return false
}

        if(matiere.data.volume_horaire_cm < 0) {
return false
}

        if(matiere.data.volume_horaire_td < 0) {
return false
}

        if(matiere.data.volume_horaire_tp < 0) {
return false
}

        return true
    }
    


    async function modifierMatiere(e: React.FormEvent) {
        e.preventDefault()

        if(!select) {
return
}

        if(!validateMatiere()) {
return
}

        matiere.put(`/matieres/${select?.id}/modifier`,{
            
            onSuccess: (()=>{
                toast.success('Cours mis à jour avec succès')
                setAction(null)
                setSelect(null)
                matiere.reset()

            }),

            onError: ((errors)=>{
                if(errors.code){
                    toast.error(errors.code)
                } else if(errors.intitule){
                    toast.error('Erreur lors de la mise à jour')
                }
                
                
                
            })
        })


        
    }

    async function supprimerMatiere(e: React.FormEvent) {
        e.preventDefault()

        if(!select?.id) {
return
}

        matiere.delete(`/matieres/${select?.id}/supprimer`,{
            
            onSuccess: (()=>{
                toast.success('Cours supprimée avec succès')
                setAction(null)
                setSelect(null)
                matiere.reset()

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
            <Head title="Gestion des matieres" />

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
                        <CardTitle>Liste des Cours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="">
                            <TableHeader className='bg-gray-600/50'>
                                <TableRow className="">
                                    <TableHead className="text-center">Libellé</TableHead>
                                    <TableHead className="text-center">Code</TableHead>
                                    <TableHead className="text-center">Volume horaire (CM)</TableHead>
                                    <TableHead className="text-center">Volume horaire (TD)</TableHead>
                                    <TableHead className="text-center">Volume horaire (TP)</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className='text-center'>
                                {filtreData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className='py-5 text-center text-gray-400'>
                                            {search.trim() ? 'Aucune résultat' : 'Pas encore de cours enregistrée'}
                                        </TableCell>
                                    </TableRow>
                                ):filtreData.map((m: any) => (
                                    <TableRow key={m.id} className="">
                                        <TableCell className="py-5">{m.intitule || 'N/A'}</TableCell>
                                        <TableCell className="py-5">{m.code || 'N/A'}</TableCell>
                                        <TableCell className="py-5">{m.volume_horaire_cm || '-'}</TableCell>
                                        <TableCell className="py-5">{m.volume_horaire_td || '-'}</TableCell>
                                        <TableCell className="py-5">{m.volume_horaire_tp || '-'}</TableCell>
                                        <TableCell className="py-5 space-x-3">
                                            <Button 
                                                variant={'default'}
                                                onClick={() => {
                                                    setSelect(m)
                                                    setAction('modif')
                                                    matiere.setData('intitule', m.intitule)
                                                    matiere.setData('code', m.code)
                                                    matiere.setData('volume_horaire_cm', Number(m.volume_horaire_cm))
                                                    matiere.setData('volume_horaire_td', Number(m.volume_horaire_td))
                                                    matiere.setData('volume_horaire_tp', Number(m.volume_horaire_tp))
                                                }}
                                            >
                                                <Edit />Modifier
                                            </Button>
                                            <Button 
                                                variant={'destructive'}
                                                onClick={() =>{
                                                    setSelect(m)
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
                <Pagination links={matieres.links}/>
            </div>
        </AppLayout>

        
        <Dialog open={action === 'modif'} onOpenChange={(open) => {
                if (!open) {
setAction(null)
}
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={modifierMatiere} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Modifier cette Matière</DialogTitle>
                        <DialogDescription>
                            Saisissez les nouvelles informations sur la matiere.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="intitule">Module</Label>
                            <Input id="intitule" name="intitule" value={matiere.data.intitule}
                                onChange={(e)=>{
matiere.setData('intitule', e.target.value) 
}} placeholder='Ex: Algèbre de Bool...' />
                            
                        </Field>
                        <Field>
                            <Label htmlFor="code">Code de référence</Label>
                            <Input id="code" name="code" value={matiere.data.code}
                                onChange={(e)=>{
matiere.setData('code', e.target.value) 
}} placeholder='Ex: NF00L1' />
                            
                        </Field>
                        <div className='space-y-6'>
                            <Field>
                            <Label htmlFor="volume_horaire_cm">Volume Horaire (CM)</Label>
                            <Input type='number' id="volume_horaire_cm" name="volume_horaire_cm" value={matiere.data.volume_horaire_cm}
                                onChange={(e) => matiere.setData('volume_horaire_cm', Number(e.target.value))}/>
                            </Field>
                            
                            <div className='flex items-center  gap-5'>
                                

                                <Field>
                                <Label htmlFor="volume_horaire_td">Volume Horaire (TD)</Label>
                                <Input type='number' id="volume_horaire_td" name="volume_horaire_td"  
                                      value={matiere.data.volume_horaire_td}
                                    onChange={(e)=>matiere.setData('volume_horaire_td', Number(e.target.value))}/>
                                </Field>

                                <Field>
                                <Label htmlFor="volume_horaire_tp">Volume Horaire (TP)</Label>
                                <Input type='number' id="volume_horaire_tp" name="volume_horaire_tp"  
                                      value={matiere.data.volume_horaire_tp}
                                    onChange={(e)=>matiere.setData('volume_horaire_tp', Number(e.target.value))}/>
                                </Field>
                            </div>
                        </div>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                            disabled={matiere.processing || !validateMatiere()}
                        >
                            {matiere.processing ? <Spinner /> : 'Enregistrer'}</Button>
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
                <form onSubmit={supprimerMatiere} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Suppression du module</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible, Êtes-vous sûr de vouloir supprimer cet module {select?.intitule || 'N/A'}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                        variant={'destructive'}
                            disabled={matiere.processing || !select?.id}
                        >
                            {matiere.processing ? <Spinner /> : 'Supprimer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>
        
        </>
    );
}