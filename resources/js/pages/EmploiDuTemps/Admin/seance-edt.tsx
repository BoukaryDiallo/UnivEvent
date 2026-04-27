import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/components/edt/formatDate';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast, Toaster } from 'sonner';
import { AlertCircle, CheckCircle2, Edit, Trash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { 
        title: 'Dashboard', 
        href: dashboard() 
    },
    { title: 'Emplois du Temps', href: '/emploie-du-temps' },
    { 
        title: 'Gerer les seances', 
        href: '#' 
    },
];



export default function gestionSeance({ 
    seances, emplois, matieresSeance, sallesSeance, userEnseignants,
    creneaux
}: { 
    seances: any[], emplois: any[], matieresSeance: any[], sallesSeance: any[],
    userEnseignants: any[], creneaux: any[]
}) {
    
    const [select, setSelect] = useState<null | {}>(null)
    const [action, setAction] = useState< null | string >(null)
    const [dispo, setDispo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [champsModifies, setChampsModifies] = useState(false);
const [valeursOriginales, setValeursOriginales] = useState<any>(null);

 const [loadingLib, setLoadingLib] = useState(false);

    const form = useForm({
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

    async function checkDisponibilite() {
        if (!form.data.enseignant_id) {
            toast.info("Veuillez sélectionner un enseignant");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                user_id: form.data.enseignant_id,
                date: form.data.check_date,
                debut: form.data.check_debut,
                fin: form.data.check_fin,
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
        if (!form.data.enseignant_id) {
            toast.error('Veuillez sélectionner un enseignant');
            return false;
        }
        if (!form.data.creneau_id) {
            toast.error('Veuillez sélectionner un créneau');
            return false;
        }
        if (!form.data.matiere_id) {
            toast.error('Veuillez sélectionner un module');
            return false;
        }
        if (!form.data.salle_id) {
            toast.error('Veuillez sélectionner une salle');
            return false;
        }
        if (!form.data.jour_semaine) {
            toast.error('Veuillez sélectionner un jour');
            return false;
        }
        return true;
    }


    async function modifierSeance(e: any) {
        e.preventDefault()
        if (!validateSeance()) return;

        if (aChangeChampsRequisDispo() && !dispo?.ok) {
            toast.error('Veuillez vérifier la disponibilité de l\'enseignant');
            return;
        }

        // Un seul appel — Laravel gère tout
        router.put(`/emploie-du-temps/${select?.id}/modifier-seance`, {
            jour_semaine:  form.data.jour_semaine,
            type_seance:   form.data.type_seance,
            creneau_id:    form.data.creneau_id,
            salle_id:      form.data.salle_id,
            matiere_id:    form.data.matiere_id,
            enseignant_id: form.data.enseignant_id,
            description:   form.data.description,

            user_id:       form.data.enseignant_id,
            check_date:    form.data.check_date,
            check_debut:   form.data.check_debut,
            check_fin:     form.data.check_fin,
            niveau:        dispo?.niveau ?? null,
            champs_modifies: aChangeChampsRequisDispo(), 
        }, {
            onSuccess: () => {
                toast.success('Séance modifiée avec succès !');
                setAction(null);
                setDispo(null);
                setChampsModifies(false);
                form.reset();
            },
            onError: (errors: any) => {
                if (errors.conflit) {
                    toast.error(errors.conflit);
                } else {
                    toast.error('Erreur lors de la modification');
                }
            },
        });
    }

    function aChangeChampsRequisDispo() {
        if (!valeursOriginales) return false;
        return (
            form.data.enseignant_id !== valeursOriginales.enseignant_id ||
            form.data.creneau_id !== valeursOriginales.creneau_id ||
            form.data.jour_semaine !== valeursOriginales.jour_semaine
        );
    }

    async function supprimerSeance(e: any) {
        e.preventDefault()
        if (!select?.id) return

        try {
            const response = await fetch(`/emploie-du-temps/${select?.id}/supprimer-seance`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                if (data?.prise_id) {
                    await fetch(`/api/dispos/prises/${data.prise_id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                    });
                }

                toast.success('Séance supprimée et enseignant libéré !');
                setAction(null);
                setSelect(null);
                router.reload();
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    }

    function libererEns(e: any) {
        e.preventDefault();
        if (!select?.id || loadingLib) return;

        setLoadingLib(true);

        router.post(`/emploie-du-temps/${select?.id}/liberer-enseignant`, {}, {

            onSuccess: () => {
                toast.success('Enseignant de nouveau libre pour d\'autre cours !');
                setAction(null);
                setSelect(null);
            },
            onError: () => {
                toast.error("Erreur Veuillez reessayez");
            },
            onFinish: () => {
                setLoadingLib(false);
            }
        });
    }
    

    return (
        <>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Gerer les Seances" />

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
                            <p>Grille Hebdomadaire</p>
                            
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
                                        {((emplois?.statut === 'Publié') || (emplois?.statut === 'Brouillon')) && (
                                        <TableHead className="text-center border">Actions</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className='text-center'>
                                    
                                    {seances.length === 0 ? (
                                        <TableRow>
                                            {((seances[0]?.emploi_du_temps?.statut === 'Publié') || (seances[0]?.emploi_du_temps?.statut === 'Brouillon')) ? (
                                                <TableCell colSpan={7}
                                                    className="text-center py-6 text-gray-500"
                                                >
                                                    Aucune seance enregistrée pour le moment.
                                                </TableCell>
                                            ):(
                                                <TableCell colSpan={6}
                                                className="text-center py-6 text-gray-500"
                                                >
                                                    Aucune seance enregistrée pour le moment.
                                                </TableCell>
                                            )}
                                            
                                        </TableRow>
                                    ): seances.map((s: any) => (
                                        <TableRow key={s.id} className=''>
                                            <TableCell className="py-5 border">{s?.jour_semaine || 'N/A'}</TableCell>
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
                                                        {s?.type_seance === 'Examen' && ('Examen (Devoir)')}
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
                                            {((s?.emploi_du_temps?.statut === 'Publié') || (s?.emploi_du_temps?.statut === 'Brouillon')) && (
                                                <TableCell className="py-5 space-x-3 border">
                                                    <Button 
                                                        variant={'default'}
                                                        onClick={() => {
                                                            setSelect(s)
                                                            setAction('modif')
                                                            setDispo(null)
                                                            setChampsModifies(false)
                                                            
                                                            const valeurs = {
                                                                enseignant_id: s.enseignant?.user_id?.toString() ?? '',
                                                                creneau_id: s?.creneau?.id?.toString() ?? '',
                                                                matiere_id: s?.matiere?.id?.toString() ?? '',
                                                                salle_id: s?.salle?.id?.toString() ?? '',
                                                                jour_semaine: s?.jour_semaine ?? 'Lundi',
                                                                type_seance: s?.type_seance ?? 'CM',
                                                                description: s?.description ?? '',
                                                                check_date: '2026-04-25',
                                                                check_debut: s?.creneau?.heure_debut?.substring(0, 5) ?? '08:00',
                                                                check_fin: s?.creneau?.heure_fin?.substring(0, 5) ?? '10:00',
                                                            }
                                                            setValeursOriginales(valeurs)
                                                            form.setData(valeurs)
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
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>{
                                                            setSelect(s)
                                                            setAction('liberer')
                                                        } }
                                                        
                                                        disabled={!s.prise_id}
                                                    >
                                                        Libérer
                                                    </Button>
                                                </TableCell>
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

        <Dialog open={action === 'modif'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
                <DialogContent className="sm:max-w-xl">
                    <form onSubmit={modifierSeance} className='space-y-6'>
                        <DialogHeader>
                            <DialogTitle>Modifier la seance</DialogTitle>
                            <DialogDescription>
                                Une fois que vous changer le créneau, l'enseignant ou le jour de semaine, vous serez amené à verifier d'abord la disponibiité de l'enseignant selon le changement.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label>Enseignant</Label>
                                <Select value={form.data.enseignant_id} 
                                    onValueChange={(value) => {
                                        form.setData('enseignant_id', value)
                                        setDispo(null)
                                        setChampsModifies(true)
                                    }}
                                >
                                
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Sélectionner un nouveau enseignant" />
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
                                        value={form.data.creneau_id} 
                                        onValueChange={(value) => {
                                            const selectedCreneau = creneaux.find(c => c.id.toString() === value);
                                            if (selectedCreneau) {
                                                form.setData('creneau_id', value);
                                                form.setData('check_debut', selectedCreneau.heure_debut.substring(0, 5));
                                                form.setData('check_fin', selectedCreneau.heure_fin.substring(0, 5));
                                                setDispo(null)
                                                setChampsModifies(true)
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
                                        <Select value={form.data.matiere_id} onValueChange={(value) => form.setData('matiere_id', value)}>
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
                                <Select value={form.data.jour_semaine} 
                                    onValueChange={(v) => {
                                        form.setData('jour_semaine', v)
                                        setDispo(null)
                                        setChampsModifies(true)
                                    }}
                                >
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
                                <Select value={form.data.type_seance} onValueChange={(v) => form.setData('type_seance', v)}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CM">CM</SelectItem>
                                        <SelectItem value="TD">TD</SelectItem>
                                        <SelectItem value="TP">TP</SelectItem>
                                        <SelectItem value="Examen">Examen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            </div>
                                <div className='flex items-center justify-between gap-3'>
                                <Field>
                                    <Label>Date de vérification</Label>
                                    <Input
                                        type="date"
                                        value={form.data.check_date}
                                        onChange={(e) => form.setData('check_date', e.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <Label>Salle</Label>
                                    <Select value={form.data.salle_id} onValueChange={(value) => form.setData('salle_id', value)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Sélectionner une nouvelle salle" />
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
                                        value={form.data.description} onChange={(e) => {form.setData('description', e.target.value)}}
                                        placeholder="Une brève description du cours..." />
                                </Field>

                                <div className='space-y-6'>
                                    {aChangeChampsRequisDispo() && (
                                        <Button 
                                            type='button'
                                            onClick={checkDisponibilite} 
                                            disabled={loading || !form.data.enseignant_id}
                                            className="w-full"
                                        >
                                            {loading ? <Spinner className='animate-spin' /> : 'Vérifier la disponibilité de l\'enseignant'}
                                        </Button>
                                    )}

                                    {dispo && (
                                        <div className={`p-4 rounded-lg flex gap-3 ${dispo.ok ? 'bg-green-50 border border-green-200 text-green-500' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                                            {dispo.ok ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                                            <div>
                                                <p className="font-medium">{dispo.ok ? 'Disponible' : 'Indisponible'}</p>
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
                                            form.setData({
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
                                            form.reset(),
                                            setAction(null)
                                            setSelect(null)
                                        }}
                                    >Annuler</Button>
                                </DialogClose>
                                <Button type="submit"
                                    disabled={form.processing || (aChangeChampsRequisDispo() && !dispo?.ok)}
                                >
                                    {form.processing ? <Spinner className='animate-spin' /> : 'Modifier la séance'}
                                </Button>
                            </DialogFooter>
                        </form>
                </DialogContent>
                    
            </Dialog>


        <Dialog open={action === 'sup'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={supprimerSeance} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Suppression de la séance</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible, Êtes-vous sûr de vouloir supprimer cette séance ?.
                            Après suppression l'enseingant sera libéré automatiquement.
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

        <Dialog open={action === 'liberer'} onOpenChange={(open) => {
                if (!open) setAction(null)
            }}>
                
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={libererEns} className='space-y-6'>
                    <DialogHeader>
                        <DialogTitle>Liberer cet enseignant</DialogTitle>
                        <DialogDescription>
                            Une fois réussie l'enseignant sera de nouveau disponible sur le même créneau.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button type="submit"
                            variant={'default'}
                                disabled={loadingLib || !select?.id}
                        >
                            {loadingLib ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        En cours...
                                    </>
                                ) : (
                                    "Libérer"
                                )}
                            {/* { ? <Spinner className='mr' /> : 'Liberer l\'enseignant'}*/}
                        </Button> 
                    </DialogFooter>
                </form>
            </DialogContent>
                
        </Dialog>
        </>
    );
}