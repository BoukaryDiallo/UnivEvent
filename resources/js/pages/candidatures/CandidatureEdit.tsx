import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
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
        put(route('candidatures.update', candidature.id_candidature));
    };

    return (
        <AppLayout>
            <Head title="Modifier une Candidature" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Modifier une Candidature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(errors).length > 0 && (
                            <div className="alert alert-danger mb-4">
                                <ul className="mb-0">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-4">
                            <div>
                                <Label htmlFor="programme">Programme</Label>
                                <textarea
                                    id="programme"
                                    className="form-control"
                                    value={data.programme}
                                    onChange={(e) => setData('programme', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="photo">Photo</Label>
                                {candidature.photo && (
                                    <div className="mb-2">
                                        <img
                                            src={`/storage/${candidature.photo}`}
                                            alt="Photo actuelle"
                                            className="w-20 h-20 rounded"
                                        />
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
                            <div className="text-end">
                                <Button type="submit" disabled={processing}>
                                    Mettre à jour
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}