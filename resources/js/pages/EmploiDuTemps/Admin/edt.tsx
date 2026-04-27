import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {Table, TableBody, TableHeader, TableHead, TableRow, TableCell} from '@/components/ui/table'
import { Button } from '@/components/ui/button';
import { Plus, Eye, Download, LayoutGrid, Search, Share, Trash2, Edit, PlusSquare, CheckCircle2, AlertCircle, Timer, Mail } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { dashboard, roles } from '@/routes';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from 'react';
import {useForm} from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import Pagination from '@/components/edt/paginate';
import { formatDate, inputDate } from '@/components/edt/formatDate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    { 
        title: 'Emploi du Temps', 
        href: '/emploie-du-temps' 
    },
];

export default function Edt({ emplois, matieres, totalCreneau, filieres, salles, niveaux,
    filieresData, niveauxData, anneesData, userEnseignants, creneaux, matieresSeance, sallesSeance
}: { emplois: any[], matieres: number, totalCreneau: number, filieres: number, salles: number, niveaux: number 
    filieresData: any[], niveauxData: any[], anneesData: any[],
    userEnseignants: any[], creneaux: any[], matieresSeance: any[], sallesSeance: any[]
}) {
    
    
    const [action, setAction] = useState< null | string>(null)
    const [select, setSelect] = useState<any>(null)

    const salle = useForm({
        nom: ''
    })

    const creneau = useForm({
        heure_debut: '',
        heure_fin: ''
    })

    const matiere = useForm({
        code: '',
        intitule: '',
        volume_horaire_cm: 0,
        volume_horaire_tp: 0,
        volume_horaire_td: 0,
    })

    const niveau = useForm({
        nom: '',
        code: '',
        ordre: 1,
    })

    const form = useForm({
        titre: '',
        semestre: 'S5',
        annee_academique_id: '',
        filiere_id: '',
        niveau_id: '',
        groupe: '',
        date_debut: '',
        date_fin: '',
    });

    const [dispo, setDispo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingSend, setLoadingSend] = useState(false);

    const formSeance = useForm({
        jour_semaine: 'Lundi',
        type_seance: 'CM',
        creneau_id: '',
        salle_id: '',
        matiere_id: '',
        enseignant_id: '',
        description: '',
        check_date: '2026-04-21',
        check_debut: '08:00',
        check_fin: '10:00',
    });

    const [search, setSearch] = useState<string>("")

    const filtreData = useMemo(()=>{

        if(!emplois.data || !Array.isArray(emplois.data)) return []

        let resultat = emplois.data
        
        if(search.trim()){
            const s = search.toLowerCase()

            resultat = resultat.filter((e)=>(
                e.titre.toLowerCase().includes(s) ||
                e.semestre.toLowerCase().includes(s)
            ))

        }

        return resultat


    },[search, emplois.data])


    function PublierEdt(e: React.FormEvent){
        e.preventDefault()
        if(!select?.id) return
        form.post(`/emploie-du-temps/${select?.id}/publier`,{
            onSuccess: () => {
                setAction(null)
                form.reset()
                toast.success('Emploi du temps publié')},

            onError: () => toast.error('Erreur! Veuillez réessayer')
        })
    }


    function validateEdt(){

        if(!form.data.titre.trim()) return false
        if(!form.data.semestre.trim()) return false
        if(!form.data.annee_academique_id) return false
        if(!form.data.filiere_id) return false
        if(!form.data.niveau_id) return false
        if(!form.data.date_debut) return false
        if(!form.data.date_fin) return false

        return true
    }

    function handleCreerEdt(e: React.FormEvent){
        e.preventDefault();
        if(!validateEdt()) return
        form.post('/emploie-du-temps/ajouter', {
            onSuccess: () => {
                setAction(null)
                form.reset()
                toast.success('Emploi du temps créé')},

            onError: () => toast.error('Erreur! Veuillez réessayer')
        });
    };

    function handleModifEdt(e: React.FormEvent){
        e.preventDefault();
        if(!validateEdt()) return
        form.put(`/emploie-du-temps/${select?.id}/modifier`, {
            onSuccess: () => {
                setAction(null)
                form.reset()
                toast.success('Emploi du temps mis à jour')},

            onError: () => toast.error('Erreur! Veuillez réessayer')
        });
    };

    function handleAjout(item: string){
        setAction(item)
    }


    async function ajouterSalle(e: React.FormEvent) {
        e.preventDefault()
        if (!salle.data.nom.trim()) return

        salle.post('/salles/ajouter',{
            onSuccess: (()=>{
                toast.success('Salle ajoutée avec succès')
                setAction(null)
                salle.reset()

            }),

            onError: (()=>{
                toast.error(salle.errors.nom || 'Erreur lors de l\'ajout de la salle')
                
            })
        })
        
    }

    function validateCreneau(){

        if(creneau.data.heure_fin < creneau.data.heure_debut) return false

        return true
    }

    async function ajouterCreneau(e: React.FormEvent) {
        e.preventDefault()
        if (!validateCreneau()) return

        creneau.post('/creneaux/ajouter',{
            onSuccess: (()=>{
                toast.success('Creneua créé avec succès')
                setAction(null)
                creneau.reset()

            }),

            onError: (()=>{
                toast.error('Erreur Veuillez ressayer')
                
            })
        })
        
    }

    function validateMatiere(){

        if(!matiere.data.code.trim()) return false
        if(!matiere.data.intitule.trim()) return false
        if(matiere.data.volume_horaire_cm < 0) return false
        if(matiere.data.volume_horaire_td < 0) return false
        if(matiere.data.volume_horaire_tp < 0) return false

        return true
    }

    function validateNiveau(){

        if(!niveau.data.code.trim()) return false
        if(!niveau.data.nom.trim()) return false
        if(niveau.data.ordre < 1) return false

        return true
    }

    async function checkDisponibilite() {
        if (!formSeance.data.enseignant_id) {
            toast.info("Veuillez sélectionner un enseignant");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                user_id: formSeance.data.enseignant_id,
                date: formSeance.data.check_date,
                debut: formSeance.data.check_debut,
                fin: formSeance.data.check_fin,
            });
            

            const response = await fetch(`/api/dispos/etat?${params}`);
            const data = await response.json();
            
            setDispo(data);
        } catch (error) {
            setDispo({ ok: false, message: "Erreur de connexion" });
        } finally {
            setLoading(false);
        }
    };

    function validateSeance() {
    if (!formSeance.data.enseignant_id) {
        toast.error('Veuillez sélectionner un enseignant');
        return false;
    }
    if (!formSeance.data.creneau_id) {
        toast.error('Veuillez sélectionner un créneau');
        return false;
    }
    if (!formSeance.data.matiere_id) {
        toast.error('Veuillez sélectionner un module');
        return false;
    }
    if (!formSeance.data.salle_id) {
        toast.error('Veuillez sélectionner une salle');
        return false;
    }
    if (!formSeance.data.jour_semaine) {
        toast.error('Veuillez sélectionner un jour');
        return false;
    }
    return true;
    }


    
    async function ajouterSeance(e: React.FormEvent) {
        e.preventDefault()
        if (!validateSeance()) return;
        if (!dispo?.ok) {
            toast.error('Veuillez vérifier la disponibilité de l\'enseignant');
            return;
        }

        router.post(`/emploie-du-temps/${select?.id}/ajouter-seance`, {
            jour_semaine:  formSeance.data.jour_semaine,
            type_seance:   formSeance.data.type_seance,
            creneau_id:    formSeance.data.creneau_id,
            salle_id:      formSeance.data.salle_id,
            matiere_id:    formSeance.data.matiere_id,
            enseignant_id: formSeance.data.enseignant_id,
            description:   formSeance.data.description,
           
            user_id:       formSeance.data.enseignant_id,
            check_date:    formSeance.data.check_date,
            check_debut:   formSeance.data.check_debut,
            check_fin:     formSeance.data.check_fin,
            niveau:        dispo.niveau,
        }, {
            onSuccess: () => {
                toast.success('Séance ajoutée avec succès !');
                setDispo(null);
                formSeance.reset();
                setAction(null);
            },
            onError: (errors) => {
                if (errors.conflit) {
                    toast.error(errors.conflit);
                } else {
                    toast.error('Erreur lors de la création de la séance');
                }
            }
        });
    }


    async function ajouterMatiere(e: React.FormEvent) {
        e.preventDefault()
        if (!validateMatiere()) return

        matiere.post('/matieres/ajouter',{
            onSuccess: (()=>{
                toast.success('Cours ajoutée avec succès')
                setAction(null)
                matiere.reset()

            }),

            onError: (()=>{
                toast.error('Erreur lors de l\'ajout du cours')
                
            })
        })
        
    }



    async function ajouterNiveau(e: React.FormEvent) {
        e.preventDefault()
        if (!validateNiveau()) return

        niveau.post('/niveaux/ajouter',{
            onSuccess: (()=>{
                toast.success('Niveau d\'étude ajouté avec succès')
                setAction(null)
                niveau.reset()

            }),

            onError: (()=>{
                toast.error('Erreur lors de l\'ajout du cours')
                
            })
        })
        
    }


    async function supprimerEdt(e: React.FormEvent) {
        e.preventDefault()
        if(!select?.id) return

        form.delete(`/emploie-du-temps/${select?.id}/supprimer`,{
            
            onSuccess: (()=>{
                toast.success('Emplois du temps supprimée avec succès')
                setAction(null)
                setSelect(null)
                form.reset()

            }),

            onError: ((e)=>{
                
                toast.error('Erreur lors de la suppression')
                
            })
        })


        
    }


    function envoyezEdtParEmail(e: any) {
        e.preventDefault();
        if (!select?.id || loadingSend) return;

        setLoadingSend(true);

        router.post(`/emploie-du-temps/${select?.id}/envoyer-email`, {}, {

            onSuccess: () => {
                toast.success('Emails envoyés avec succès !');
                setAction(null);
                setSelect(null);
            },
            onError: () => {
                toast.error("Erreur lors de l'envoi des emails");
            },
            onFinish: () => {
                setLoadingSend(false);
            }
        });
    }

    

  

    return (
        <>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Gestion des Emplois du Temps" />

            <div className="space-y-6 p-6">

                <div className='grid grid-cols-5 gap-5'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Modules (matière)</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-5'>
                            <div className='text-xl'>
                                {matieres > 9 ? matieres : `0${matieres}`}
                            </div>

                            <div className='flex items-center justify-left gap-3'>
                                <Button onClick={()=>handleAjout('matieres')}>
                                    <Plus />Ajouter
                                </Button>
                                <Link href='/matieres/listes' >
                                    <Button variant={'secondary'}>
                                        
                                            <Eye />Consulter
                                    
                                    </Button>
                                 </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filières</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-5'>
                            <div className='text-xl'>
                                {filieres > 9 ? filieres : `0${filieres}`}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cycle (niveau d'etude)</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-5'>
                            <div className='text-xl'>
                                {niveaux > 9 ? niveaux : `0${niveaux}`}
                            </div>

                            <div className='flex items-center justify-left gap-3'>
                                <Button onClick={()=>handleAjout('niveaux')}>
                                    <Plus />Ajouter
                                </Button>
                                <Link href='/niveaux/listes' >
                                    <Button variant={'secondary'}>
                                        
                                            <Eye />Consulter
                                    
                                    </Button>
                                 </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Salles</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-5'>
                            <div className='text-xl'>
                                {salles > 9 ? salles : `0${salles}`}
                            </div>

                            <div className='flex items-center justify-left gap-3'>
                                <Button onClick={()=>handleAjout('salles')}>
                                    <Plus />Ajouter
                                </Button>
                                <Link href='/salles/listes' >
                                    <Button variant={'secondary'}>
                                        
                                            <Eye />Consulter
                                    
                                    </Button>
                                 </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Créneau horaires</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-5'>
                            <div className='text-xl'>
                                {totalCreneau > 9 ? totalCreneau : `0${totalCreneau}`}
                            </div>

                            <div className='flex items-center justify-left gap-3'>
                                <Button onClick={()=>handleAjout('creneaux')}>
                                    <Plus />Ajouter
                                </Button>
                                <Link href='/creneaux/listes' >
                                    <Button variant={'secondary'}>
                                        
                                            <Eye />Consulter
                                    
                                    </Button>
                                 </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex items-center justify-between">
                    <div className='relative w-xl'>
                        <Input type='text' value={search}
                            onChange={(e)=>{setSearch(e.target.value)}}
                            placeholder='Rechercher un emploi du temps...'
                            className=' px-8 py-5'
                        />
                        <Search className='absolute top-4 left-2 h-4 w-4 text-gray-400' />
                    </div>
                    <Button onClick={()=>handleAjout('edt')}>
                        <Plus />Nouvel Emploi du temps
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Emplois du Temps</CardTitle>
                        <div className='flex items-center gap-3 mt-2'>
                            <div className='flex items-center gap-1'>
                                <PlusSquare className=' h-4 w-4 text-black'/>
                                <p className='text-xs'>Ajouter une séance</p>
                            </div>
                            <div className='flex items-center gap-1'>
                                <Share className=' h-4 w-4 text-green-600'/>
                                <p className='text-xs'>Publier l'emploi du temps</p>
                            </div>
                            <div className='flex items-center gap-1'>
                                <Edit className=' h-4 w-4 text-blue-600'/>
                                <p className='text-xs'>Modifier l'emploi du temps</p>
                            </div>
                            <div className='flex items-center gap-1'>
                                <Trash2 className=' h-4 w-4 text-red-600'/>
                                <p className='text-xs'>Supprimer l'emploi du temps</p>
                            </div>
                            <div className='flex items-center gap-1'>
                                <Eye className=' h-4 w-4 text-gray-400'/>
                                <p className='text-xs'>Voir les seances</p>
                            </div>
                            <div className='flex items-center gap-1'>
                                <Download className=' h-4 w-4 text-gray-600'/>
                                <p className='text-xs'>Télécharger (pdf)</p>
                            </div>
                             <div className='flex items-center gap-1'>
                                <Mail className=' h-4 w-4 text-orange-500'/>
                                <p className='text-xs'>Envoyer aux enseignants</p>
                            </div>
                            
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table className="">
                            <TableHeader className='bg-gray-600/50 '>
                                <TableRow className="">
                                    <TableHead className="text-center">Titre</TableHead>
                                    <TableHead className="text-center">Filière - Niveau</TableHead>
                                    <TableHead className="text-center">Semestre</TableHead>
                                    <TableHead className="text-center">Groupe</TableHead>
                                    <TableHead className="text-center">Dates</TableHead>
                                    <TableHead className="text-center">Statut</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                   
                                </TableRow>
                            </TableHeader>
                            <TableBody className='text-center'>
                                {filtreData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className='py-5 text-center text-gray-400'>
                                            {search.trim() ? 'Aucune résultat' : 'Pas encore d\'emploi du temps'}
                                        </TableCell>
                                    </TableRow>
                                ):filtreData.map((edt: any) => (
                                    <TableRow key={edt.id} className="">
                                        <TableCell className="py-5">{edt.titre}</TableCell>
                                        <TableCell className="py-5">{edt.filiere?.nom} - {edt.niveau?.code}</TableCell>
                                        <TableCell className="py-5">{edt.semestre}</TableCell>
                                        <TableCell className="py-5">{edt.groupe || '-'}</TableCell>
                                        <TableCell className="py-5">{formatDate(edt.date_debut)} au {formatDate(edt.date_fin)}</TableCell>
                                        <TableCell className="py-5">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full
                                                ${edt.statut === 'Publié' ? 'bg-green-100 text-green-700' : 
                                                  edt.statut === 'Archivé' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {edt.statut}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5 space-x-3">
                                            
                                            <Button 
                                            className={`${edt?.statut === 'Archivé' ? 'hidden' : ''}`}
                                                variant={'default'}
                                                onClick={() => {
                                                    setAction('ajout-seance')
                                                    setSelect(edt)
                                                }}
                                            >
                                                <PlusSquare />
                                            </Button>
                                             {edt.statut === 'Brouillon' && (
                                                <Button 
                                                    variant={'secondary'}
                                                    onClick={() => {
                                                        setAction('pub')
                                                        setSelect(edt)
                                                    }}
                                                    className="bg-green-600 text-white font-bold hover:bg-green-500"
                                                >
                                                    <Share />
                                                </Button>
                                            )}
                                            <Button 
                                                onClick={() => {
                                                    setAction('modif')
                                                    setSelect(edt)
                                                    form.setData('filiere_id', edt.filiere?.id_filiere?.toString() ?? '')
                                                    form.setData('annee_academique_id', edt.annee_academique_id?.toString() ?? '')
                                                    form.setData('niveau_id', edt.niveau_id?.toString() ?? '')
                                                    form.setData('titre', edt.titre)
                                                    form.setData('semestre', edt.semestre)
                                                    form.setData('date_debut', inputDate(edt.date_debut))
                                                    form.setData('date_fin', inputDate(edt.date_fin))
                                                    form.setData('groupe', edt.groupe)
                                                }}
                                                
                                                className={`${edt?.statut === 'Archivé' ? 'hidden' : ''} bg-blue-600 text-white font-bold hover:bg-blue-500`}
                                            >
                                                <Edit />
                                            </Button>
                                            <Button 
                                                variant={'destructive'}
                                                 onClick={() =>{
                                                    setSelect(edt)
                                                    setAction('sup')
                                                } }
                                            >
                                                <Trash2 />
                                            </Button>
                                            <Button 
                                                variant={'secondary'}
                                            >
                                                
                                                <Link
                                                href={`/emploie-du-temps/${edt.id}/vue-admin`}>
                                                    <Eye className="" />
                                                </Link>
                                            </Button>
                                            <Button 
                                            className={`${edt?.statut === 'Archivé' ? 'hidden' : ''}`}
                                                variant={'outline'}
                                                onClick={() => window.location.href = `/emploie-du-temps/${edt.id}/pdf`}
                                            >
                                                <Download />
                                            </Button>
                                            <Button
                                                className={`${edt?.statut === 'Archivé' ? 'hidden' : ''} bg-orange-500`}
                                                // variant="outline"
                                                
                                                onClick={() =>{
                                                    setSelect(edt)
                                                    setAction('send-email')
                                                } }
                                            >
                                                <Mail className='text-white'/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Pagination links={emplois.links}/>
            </div>
        </AppLayout>

        
            <Dialog open={action === 'matieres'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={ajouterMatiere} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau cours</DialogTitle>
                        <DialogDescription>
                        Définir differents types de cours avec un code unique.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                        <Label htmlFor="intitule">Initulé du cours</Label>
                        <Input id="intitule" name="intitule" value={matiere.data.intitule} 
                            onChange={(e)=>{matiere.setData('intitule', e.target.value)}} placeholder='Nom du cours' />
                        </Field>

                        <Field>
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" name="code" value={matiere.data.code} 
                            onChange={(e)=>{matiere.setData('code', e.target.value)}} placeholder='Code unique du cours' />
                            <InputError message={matiere.errors.code} />
                        </Field>

                        
                        <div className='space-y-6'>
                            <p className='text-gray-300 italic'>Définissez un volume Horaire</p>
                            <Field>
                            <Label htmlFor="volume_horaire_cm">Cours magistrale (CM)</Label>
                            <Input type='number' id="volume_horaire_cm" name="volume_horaire_cm" value={matiere.data.volume_horaire_cm}
                                onChange={(e) => matiere.setData('volume_horaire_cm', Number(e.target.value))}/>
                            </Field>
                            
                            <div className='flex items-center  gap-5'>
                                

                                <Field>
                                <Label htmlFor="volume_horaire_td">Travaux dirigés (TD)</Label>
                                <Input type='number' id="volume_horaire_td" name="volume_horaire_td"  
                                      value={matiere.data.volume_horaire_td}
                                    onChange={(e)=>matiere.setData('volume_horaire_td', Number(e.target.value))}/>
                                </Field>

                                <Field>
                                <Label htmlFor="volume_horaire_tp">Travaux pratiques (TP)</Label>
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
        
        <Dialog open={action === 'edt'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
            <DialogContent className="sm:max-w-xl">
                <form onSubmit={handleCreerEdt} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouvel emploi du temps</DialogTitle>
                        <DialogDescription>
                            Après la creation d'un emploi du temps, vous pourrez ajouter des séances
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label>Libellé</Label>
                            <Input
                                value={form.data.titre}
                                onChange={(e) => form.setData('titre', e.target.value)}
                                placeholder="Ex: EDT L3 Génie Logiciel - Semestre 5"
                                className="mt-2"
                            />
                        </Field>

                        <div className='flex items-center justify-between gap-3'>
                        <Field>
                            <Label>Année Académique</Label>
                            <Select onValueChange={(value) => form.setData('annee_academique_id', value)}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Sélectionner une année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {anneesData.map((annee: any) => (
                                        <SelectItem key={annee.id} value={annee.id.toString()}>
                                            {annee.libelle} {annee.est_courante && '(En cours)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label>Semestre</Label>
                                <Select value={form.data.semestre} onValueChange={(value) => form.setData('semestre', value)}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'].map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        
                            <div className='flex items-center justify-between gap-3'>
                                

                                <Field>
                                    <Label>Filière</Label>
                                    <Select onValueChange={(value) => form.setData('filiere_id', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Sélectionner une filière" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filieresData.map((f: any) => (
                                                <SelectItem key={f.id_filiere} value={f.id_filiere.toString()}>
                                                    {f.nom} ({f.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Niveau</Label>
                                    <Select onValueChange={(value) => form.setData('niveau_id', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Sélectionner un niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {niveauxData.map((n: any) => (
                                                <SelectItem key={n.id} value={n.id.toString()}>
                                                    {n.code} - {n.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                
                            </div>
                            
                            <Field>
                                <Label>Groupe (optionnel)</Label>
                                <Input
                                    value={form.data.groupe}
                                    onChange={(e) => form.setData('groupe', e.target.value)}
                                    placeholder="A, B, Unique ou laisser vide"
                                    className="mt-2"
                                />
                            </Field>

                            <div className="flex items-center justify-between gap-3">
                                <Field>
                                    <Label>Date de début</Label>
                                    <Input
                                        type="date"
                                        value={form.data.date_debut}
                                        onChange={(e) => form.setData('date_debut', e.target.value)}
                                        className="mt-2"
                                    />
                                </Field>
                                <Field>
                                    <Label>Date de fin</Label>
                                    <Input
                                        type="date"
                                        value={form.data.date_fin}
                                        onChange={(e) => form.setData('date_fin', e.target.value)}
                                        className="mt-2"
                                    />
                                </Field>
                            </div>

                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button type="submit"
                                disabled={form.processing || !validateEdt()}
                            >
                                {form.processing ? <Spinner /> : 'Enregistrer'}</Button>
                        </DialogFooter>
                    </form>
            </DialogContent>
                
        </Dialog>


        <Dialog open={action === 'modif'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
            <DialogContent className="sm:max-w-xl">
                <form onSubmit={handleModifEdt} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Modifier l'emploi du temps</DialogTitle>
                        <DialogDescription>
                            Cela n'affecte en aucun cas les seances programméses
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label>Libellé</Label>
                            <Input
                                value={form.data.titre}
                                onChange={(e) => form.setData('titre', e.target.value)}
                                placeholder="Ex: EDT L3 Génie Logiciel - Semestre 5"
                                className="mt-2"
                            />
                        </Field>

                        <div className='flex items-center justify-between gap-3'>
                        <Field>
                            <Label>Année Académique</Label>
                            <Select value={form.data.annee_academique_id} onValueChange={(value) => form.setData('annee_academique_id', value)}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Sélectionner une année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {anneesData.map((annee: any) => (
                                        <SelectItem key={annee.id} value={annee.id.toString()}>
                                            {annee.libelle} {annee.est_courante && '(En cours)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label>Semestre</Label>
                                <Select value={form.data.semestre} onValueChange={(value) => form.setData('semestre', value)}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'].map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        
                            <div className='flex items-center justify-between gap-3'>
                                

                                <Field>
                                    <Label>Filière</Label>
                                    <Select value={form.data.filiere_id} onValueChange={(value) => form.setData('filiere_id', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Sélectionner une filière" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filieresData.map((f: any) => (
                                                <SelectItem key={f.id_filiere} value={f.id_filiere.toString()}>
                                                    {f.nom} ({f.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label>Niveau</Label>
                                    <Select value={form.data.niveau_id} onValueChange={(value) => form.setData('niveau_id', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Sélectionner un niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {niveauxData.map((n: any) => (
                                                <SelectItem key={n.id} value={n.id.toString()}>
                                                    {n.code} - {n.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                
                            </div>
                            
                            <Field>
                                <Label>Groupe (optionnel)</Label>
                                <Input
                                    value={form.data.groupe}
                                    onChange={(e) => form.setData('groupe', e.target.value)}
                                    placeholder="A, B, Unique ou laisser vide"
                                    className="mt-2"
                                />
                            </Field>

                            <div className="flex items-center justify-between gap-3">
                                <Field>
                                    <Label>Date de début</Label>
                                    <Input
                                        type="date"
                                        value={form.data.date_debut}
                                        onChange={(e) => form.setData('date_debut', e.target.value)}
                                        className="mt-2"
                                    />
                                </Field>
                                <Field>
                                    <Label>Date de fin</Label>
                                    <Input
                                        type="date"
                                        value={form.data.date_fin}
                                        onChange={(e) => form.setData('date_fin', e.target.value)}
                                        className="mt-2"
                                    />
                                </Field>
                            </div>

                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline" onClick={()=> {
                                form.reset()
                            }}>Annuler</Button>
                            </DialogClose>
                            <Button type="submit"
                                disabled={form.processing || !validateEdt()}
                            >
                                {form.processing ? <Spinner /> : 'Enregistrer'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
                
        </Dialog>
        

        
            <Dialog open={action === 'niveaux'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={ajouterNiveau} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Ajouter un niveau d'etude</DialogTitle>
                        <DialogDescription>
                        Référence à la classe. Exemple: Licence, Master, Doctorat
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                        <Label htmlFor="intitule">Cycle</Label>
                        <Input id="nom" name="nom" value={niveau.data.nom} 
                            onChange={(e)=>{niveau.setData('nom', e.target.value)}} placeholder='Ex: Licence 1' />
                            <InputError message={niveau.errors.nom} />
                        </Field>

                        <Field>
                        <Label htmlFor="code">Code de référence</Label>
                        <Input id="code" name="code" value={niveau.data.code} 
                            onChange={(e)=>{niveau.setData('code', e.target.value)}} placeholder='Ex: Licence 1 aura comme code L1' />
                            <InputError message={niveau.errors.code} />
                        </Field>

                        <Field>
                            <Label htmlFor="ordre">Ordre chronologique</Label>
                            <Input type='number' id="ordre" name="ordre" value={niveau.data.ordre}
                                onChange={(e) => niveau.setData('ordre', Number(e.target.value))}/>
                            </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline" onClick={()=> setAction(null)}>Annuler</Button>
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
                if (!open) setAction(null)
            }}>
                    
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={supprimerEdt} className='space-y-6'>
                        <DialogHeader>
                            <DialogTitle>Suppression de l'emploi du temps'</DialogTitle>
                            <DialogDescription>
                                Cette action est irréversible, Cela supprimera toutes les seances liées à cet emploi du temps. Êtes-vous sûr ?.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button type="submit"
                            variant={'destructive'}
                                disabled={form.processing || !select?.id}
                            >
                                {form.processing ? <Spinner /> : 'Supprimer'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
                    
            </Dialog>

            <Dialog open={action === 'send-email'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                    
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={envoyezEdtParEmail} className='space-y-6'>
                        <DialogHeader>
                            <DialogTitle>Envoie de l'emploie du temps</DialogTitle>
                            <DialogDescription>
                                Envoyer cet emplois du temps par email à tous les enseignants concernés ?
                            </DialogDescription>
                        </DialogHeader>
                        
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="default"
                                disabled={!select?.id || loadingSend}
                            >
                                {loadingSend ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Envoi...
                                    </>
                                ) : (
                                    "Envoyer"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
                    
            </Dialog>

            <Dialog open={action === 'pub'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                    
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={PublierEdt} className='space-y-6'>
                        <DialogHeader>
                            <DialogTitle>Publication de l'emploi du temps</DialogTitle>
                            <DialogDescription>
                                Voulez-vous vraiment publier cet emploi du temps ?
                            </DialogDescription>
                        </DialogHeader>
                        
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button type="submit"
                                
                                disabled={form.processing || !select?.id}
                            >
                                {form.processing ? <Spinner /> : 'Publier'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
                    
            </Dialog>

        
            <Dialog open={action === 'salles'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={ajouterSalle} className='space-y-6'>
                            <DialogHeader>
                                <DialogTitle>Ajouter une nouvelle salle</DialogTitle>
                                <DialogDescription>
                                    Bâtiments adéquats dans le cadre d'instruction.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="nom">Nom de la salle</Label>
                                    <Input id="nom" name="nom" value={salle.data.nom}
                                        onChange={(e)=>{salle.setData('nom', e.target.value)}} placeholder='Ex: Amphi H' />
                                    {/* <InputError message={salle.errors.nom} /> */}
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button type="submit"
                                    disabled={salle.processing || !salle.data.nom.trim()}
                                >
                                    {salle.processing ? <Spinner /> : 'Enregistrer'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                
            </Dialog>

            <Dialog open={action === 'creneaux'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={ajouterCreneau} className='space-y-6'>
                            <DialogHeader>
                                <DialogTitle>Ajouter un nouveau créneau</DialogTitle>
                                <DialogDescription>
                                    Destiné pour les seénaces.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="heure_debut">Heure de début</Label>
                                    <Input 
                                        type='time'
                                        id="heure_debut" name="heure_debut" value={creneau.data.heure_debut}
                                        onChange={(e)=>{creneau.setData('heure_debut', e.target.value)}} />
                                    
                                </Field>
                                 <Field>
                                    <Label htmlFor="heure_fin">Heure de fin</Label>
                                    <Input 
                                        type='time'
                                        id="heure_fin" name="heure_fin" value={creneau.data.heure_fin}
                                        onChange={(e)=>{creneau.setData('heure_fin', e.target.value)}} />
                                    
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                <Button variant="outline"
                                    onClick={()=>{
                                        creneau.reset()
                                    }}
                                >Annuler</Button>
                                </DialogClose>
                                <Button type="submit"
                                    disabled={creneau.processing || !validateCreneau()}
                                >
                                    {creneau.processing ? <Spinner /> : 'Enregistrer'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                
            </Dialog>

            <Dialog open={action === 'ajout-seance'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
                <DialogContent className="sm:max-w-xl">
                    <form onSubmit={ajouterSeance} className='space-y-6'>
                        <DialogHeader>
                            <DialogTitle>Ajouter une seance</DialogTitle>
                            <DialogDescription>
                                Vous pouvez ajouter plusieurs seances après un enregistrement réussie
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label>Enseignant</Label>
                                <Select onValueChange={(v) => formSeance.setData('enseignant_id', v)}>
                                
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Sélectionner un enseignant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userEnseignants.map((ens: any) => (
                                            <SelectItem key={ens.id} value={ens.id.toString()}>
                                                {ens.name || 'N/A'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <div className='flex items-center justify-between gap-3'>


                                    
                                <Field>
                                    <Label>Créneau</Label>
                                    <Select 
                                        value={formSeance.data.creneau_id} 
                                        onValueChange={(value) => {
                                            
                                            const selectedCreneau = creneaux.find(c => c.id.toString() === value);
                                            if (selectedCreneau) {
                                                
                                                formSeance.setData('creneau_id', value);
                                                formSeance.setData('check_debut', selectedCreneau.heure_debut);
                                                formSeance.setData('check_fin', selectedCreneau.heure_fin);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Choisir un créneau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {creneaux.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.libelle || `${c.heure_debut} - ${c.heure_fin}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                    <Field>
                                        <Label>Module (cours)</Label>
                                        <Select onValueChange={(v) => formSeance.setData('matiere_id', v)}>
                                            <SelectTrigger className="mt-2">
                                                <SelectValue placeholder="Sélectionner un module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {matieresSeance.map((m: any) => (
                                                    <SelectItem key={m.id} value={m.id.toString()}>
                                                        {m.intitule || 'N/A'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    
                                </div>

                            <div className='flex items-center justify-between gap-3'>
                            <Field>
                                <Label>Jour de la semaine</Label>
                                <Select value={formSeance.data.jour_semaine} onValueChange={(v) => formSeance.setData('jour_semaine', v)}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map(j => (
                                            <SelectItem key={j} value={j}>{j}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label>Type de séance</Label>
                                <Select value={formSeance.data.type_seance} onValueChange={(v) => formSeance.setData('type_seance', v)}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CM">CM</SelectItem>
                                        <SelectItem value="TD">TD</SelectItem>
                                        <SelectItem value="TP">TP</SelectItem>
                                        <SelectItem value="Examen">Examen (Devoir)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            </div>

                            
                                
                                
                                <div className='flex items-center justify-between gap-3'>
                                <Field>
                                    <Label>Date de vérification</Label>
                                    <Input
                                        type="date"
                                        value={formSeance.data.check_date}
                                        onChange={(e) => formSeance.setData('check_date', e.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <Label>Salle</Label>
                                    <Select onValueChange={(v) => formSeance.setData('salle_id', v)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Sélectionner une salle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sallesSeance.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.nom || 'N/A'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="description">Description (optionnel)</FieldLabel>
                                    <Textarea id="description" name='description'
                                        value={formSeance.data.description} onChange={(e) => {formSeance.setData('description', e.target.value)}}
                                        placeholder="Une brève description du cours..." />
                                </Field>

                                <div className='space-y-6'>
                                    <Button 
                                        type='button'
                                        onClick={checkDisponibilite} 
                                        disabled={loading || !formSeance.data.enseignant_id}
                                        className="w-full"
                                    >
                                        {loading ? <Spinner className='animate-spin' /> : 'Vérifier la disponibilité de l\'enseignant'}
                                    </Button>

                                    {dispo && (
                                        <div className={`p-4 rounded-lg flex gap-3 ${dispo.ok ? 'bg-green-50 border border-green-200 text-green-500' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                                            {dispo.ok ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                                            <div>
                                                <p className="font-medium">{dispo.ok ? 'Disponible' : 'Cet enseignant est indisponible pour le moment'}</p>
                                                <p className="text-sm">{dispo.reason}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </FieldGroup>
                            <DialogFooter className=''>
                                <DialogClose asChild>
                                    <Button variant="outline"
                                        onClick={()=>{
                                            formSeance.setData({
                                                enseignant_id: '',
                                                jour_semaine: '',
                                                type_seance: '',
                                                creneau_id: '',
                                                matiere_id: '',
                                                salle_id: '',
                                                check_date: '',
                                                check_debut: '',
                                                check_fin: '',
                                                description: ''
                                            })
                                            setDispo(null)
                                            formSeance.reset(),
                                            setAction(null)
                                            setSelect(null)
                                        }}
                                    >Annuler</Button>
                                </DialogClose>
                                <Button type="submit"
                                    disabled={!dispo?.ok || formSeance.processing}
                                >
                                    {formSeance.processing ? <Spinner className='animate-spin' /> : 'Enregistrer la séance'}</Button>
                            
                            </DialogFooter>
                        </form>
                </DialogContent>
                    
            </Dialog>
        
        </>
    );
}