// import { Head, useForm, Link, router } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
// import { useState } from 'react';
// import type { BreadcrumbItem } from '@/types';
// import { dashboard } from '@/routes';
// import { toast, Toaster } from 'sonner';

// const breadcrumbs: BreadcrumbItem[] = [
//     { title: 'Dashboard', href: dashboard() },
//     { title: 'Emploi du Temps', href: '/emploie-du-temps' },
//     { title: 'Ajouter une Séance', href: '#' },
// ];

// export default function AjouterSeance({ edt, enseignants, creneaux, userEnseignants }: { edt: any; enseignants: any[]; creneaux: any[]; userEnseignants: any[] }) {
//     const [dispo, setDispo] = useState<any>(null);
//     const [loading, setLoading] = useState(false);

//     const form = useForm({
//         jour_semaine: 'Lundi',
//         type_seance: 'CM',
//         creneau_id: '',
//         salle_id: '',
//         matiere_id: '',
//         enseignant_id: '',
//         description: '',
//         check_date: '2026-04-21',
//         check_debut: '08:00',
//         check_fin: '10:00',
//     });


//     async function checkDisponibilite() {
//         if (!form.data.enseignant_id) {
//             toast.info("Veuillez sélectionner un enseignant");
//             return;
//         }

//         setLoading(true);
//         try {
//             const params = new URLSearchParams({
//                 user_id: form.data.enseignant_id,
//                 date: form.data.check_date,
//                 debut: form.data.check_debut,
//                 fin: form.data.check_fin,
//             });

//             const response = await fetch(`/api/dispos/etat?${params}`);
//             const data = await response.json();
//             setDispo(data);
//         } catch (error) {
//             setDispo({ ok: false, message: "Erreur de connexion" });
//         } finally {
//             setLoading(false);
//         }
//     };


//     async function reserveSeance () {
//         if (!dispo?.ok) return;

//         try {
//             const response = await fetch('/api/dispos/prises', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
//                 },
//                 body: JSON.stringify({
//                     user_id: form.data.enseignant_id,
//                     date: form.data.check_date,
//                     debut: form.data.check_debut,
//                     fin: form.data.check_fin,
//                     source: 'emploi du temps',
//                     ref: `seance-edt-${edt.id}`,
//                     motif: '',
//                     niveau: dispo.niveau
//                 }),
//             });
//             const data = await response.json();

//             if (response.ok) {
//                 router.post(`/emploie-du-temps/${edt.id}/seances`, {
//                     jour_semaine: form.data.jour_semaine,
//                     type_seance: form.data.type_seance,
//                     creneau_id: form.data.creneau_id,
//                     salle_id: form.data.salle_id,
//                     matiere_id: form.data.matiere_id,
//                     enseignant_id: form.data.enseignant_id,
//                     description: form.data.description,
//                     prise_id: data.id,
//                 }, {

//                 onSuccess: () => {
//                     toast.success('Séance ajoutée avec succès !');
//                     setDispo(null);
//                     form.reset();
//                 },
            
//                 onError: () => toast.error('Erreur lors de la création de la séance'),
//             })};
                
//         } catch (error) {
//             toast.error('Erreur lors de la réservation');
//         }
//     };


    

//     return (
//         <AppLayout breadcrumbs={breadcrumbs}>
//             <Toaster />
//             <Head title="Ajouter une Séance" />

//             <div className=" max-w-2xl p-10">
//                 <div className="flex items-center gap-4 mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold">Ajout d'une nouvelle séance sur l'emploi du temps {edt.titre}</h1>
//                         {/* <p className="text-muted-foreground"></p> */}
//                     </div>
//                 </div>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Informations de la Séance / Vérification</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <Label>Enseignant</Label>
//                                 <Select onValueChange={(v) => form.setData('enseignant_id', v)}>
//                                     <SelectTrigger className="mt-2">
//                                         <SelectValue placeholder="Sélectionner un enseignant" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {userEnseignants.map((ens: any) => (
//                                             <SelectItem key={ens.id} value={ens.id.toString()}>
//                                                 {ens.name || 'N/A'}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div>
//                                 <Label>Jour de la semaine</Label>
//                                 <Select value={form.data.jour_semaine} onValueChange={(v) => form.setData('jour_semaine', v)}>
//                                     <SelectTrigger className="mt-2">
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map(j => (
//                                             <SelectItem key={j} value={j}>{j}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-3 gap-4">
//                             <div>
//                                 <Label>Type de séance</Label>
//                                 <Select value={form.data.type_seance} onValueChange={(v) => form.setData('type_seance', v)}>
//                                     <SelectTrigger className="mt-2">
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="CM">CM</SelectItem>
//                                         <SelectItem value="TD">TD</SelectItem>
//                                         <SelectItem value="TP">TP</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div>
//                                 <Label>Date de vérification</Label>
//                                 <Input
//                                     type="date"
//                                     value={form.data.check_date}
//                                     onChange={(e) => form.setData('check_date', e.target.value)}
//                                 />
//                             </div>
//                             <div>
//                                 <Label>Créneau</Label>
//                                 <Select onValueChange={(v) => {
//                                     const [id, heures] = v.split('|');
//                                     const [debut, fin] = v.split('-');
//                                     // console.log('debut', debut);
//                                     // console.log('fin0', fin);
//                                     form.setData({ creneau_id: id, check_debut: debut, check_fin: fin });
                                    
//                                     // form.setData({ check_debut: debut, check_fin: fin });
//                                 }}>
//                                     <SelectTrigger className="mt-2">
//                                         <SelectValue placeholder="Choisir un créneau" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {creneaux.map(c => (
//                                             <SelectItem key={c.id} value={`${c.id}|${c.heure_debut}-${c.heure_fin}`}>
//                                                 {c.libelle}
//                                             </SelectItem>
//                                         ))}
//                                         {/* <SelectItem value="08:00-10:00">08:00 - 10:00</SelectItem>
//                                         <SelectItem value="10:00-12:00">10:00 - 12:00</SelectItem>
//                                         <SelectItem value="14:00-16:00">14:00 - 16:00</SelectItem> */}
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         <Button 
//                             onClick={checkDisponibilite} 
//                             disabled={loading || !form.data.enseignant_id}
//                             className="w-full"
//                         >
//                             {loading ? 'Vérification en cours...' : 'Vérifier Disponibilité'}
//                         </Button>

//                         {dispo && (
//                             <div className={`p-4 rounded-lg flex gap-3 ${dispo.ok ? 'bg-green-50 border border-green-200 text-green-500' : 'bg-red-50 border border-red-200 text-red-600'}`}>
//                                 {dispo.ok ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
//                                 <div>
//                                     <p className="font-medium">{dispo.ok ? 'Disponible' : 'Indisponible pour le moment'}</p>
//                                     <p className="text-sm">{dispo.reason}</p>
//                                 </div>
//                             </div>
//                         )}

//                         <Button 
//                             onClick={reserveSeance} 
//                             disabled={!dispo?.ok}
//                             className="w-full"
//                             size="lg"
//                         >
//                             Réserver ce créneau
//                         </Button>

//                         <Button variant="outline" asChild className="w-full">
//                             <Link href="/emploie-du-temps">Retour à la liste</Link>
//                         </Button>
//                     </CardContent>
//                 </Card>
//             </div>
//         </AppLayout>
//     );
// }