import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { update as candidaturesUpdate, show as candidaturesShow, index as candidaturesIndex } from '@/routes/candidatures';
import type { PageProps } from '@/types/app';

type Candidature = {
    id_candidature: number;
    programme: string;
    photo: string;
    statut: string;
};

type Props = PageProps<{
    candidature: Candidature;
}>;

export default function CandidatureEdit() {
    const { candidature } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        programme: candidature.programme,
        photo: null as File | null,
        statut: candidature.statut,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(candidaturesUpdate.url({ candidature: candidature.id_candidature }));
    };

    return (
        <AppLayout>
            <Head title="Modifier une Candidature" />
            <div className="container mt-5">
                {/* Boutons retour et annuler */}
                <div className="mb-4 flex gap-2">
                    <Button variant="outline" onClick={() => router.get(candidaturesIndex.url())}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à la liste
                    </Button>
                    <Button variant="secondary" onClick={() => router.get(candidaturesShow.url({ candidature: candidature.id_candidature }))}>
                        Annuler
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Modifier une Candidature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(errors).length > 0 && (
                            <Alert className="mb-4 border-red-200 bg-red-50">
                                <AlertDescription>
                                    <ul className="mb-0">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-4">
                            <div>
                                <Label htmlFor="programme">Programme</Label>
                                <textarea
                                    id="programme"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={data.programme}
                                    onChange={(e) => setData('programme', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="photo">Photo</Label>
                                {candidature.photo && (
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-2">Photo actuelle :</p>
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                            <img
                                                src={`/storage/${candidature.photo}`}
                                                alt="Photo actuelle"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="statut">Statut</Label>
                                <Select value={data.statut} onValueChange={(value) => setData('statut', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en_attente">En attente</SelectItem>
                                        <SelectItem value="validee">Validée</SelectItem>
                                        <SelectItem value="rejetee">Rejetée</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => router.get(candidaturesIndex.url())}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => router.get(candidaturesShow.url({ candidature: candidature.id_candidature }))}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Mettre à jour
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}