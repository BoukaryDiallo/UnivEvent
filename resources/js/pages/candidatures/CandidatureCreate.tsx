import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { store as candidaturesStore } from '@/routes/candidatures';
import type { PageProps } from '@/types/app';

type Props = PageProps<{
    users: any[];
    elections: any[];
}>;

export default function CandidatureCreate() {
    const { users, elections } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        id_user: '',
        id_election: '',
        programme: '',
        photo: null as File | null,
        cnib_pdf: null as File | null,
        casier_judiciaire_pdf: null as File | null,
        attestation_inscription_pdf: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(candidaturesStore.url());
    };

    return (
        <AppLayout>
            <Head title="Déposer une Candidature" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Déposer une Candidature</CardTitle>
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
                                <Label htmlFor="id_user">Candidat</Label>
                                <Select value={data.id_user} onValueChange={(value) => setData('id_user', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Sélectionner un utilisateur --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user: any) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="id_election">Élection</Label>
                                <Select value={data.id_election} onValueChange={(value) => setData('id_election', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Sélectionner une élection --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {elections.map((election: any) => (
                                            <SelectItem key={election.id_election} value={election.id_election.toString()}>
                                                {election.titre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cnib_pdf">CNIB (PDF)</Label>
                                <Input
                                    id="cnib_pdf"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setData('cnib_pdf', e.target.files?.[0] || null)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="casier_judiciaire_pdf">Casier judiciaire (PDF)</Label>
                                <Input
                                    id="casier_judiciaire_pdf"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setData('casier_judiciaire_pdf', e.target.files?.[0] || null)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="attestation_inscription_pdf">Attestation d'inscription (PDF)</Label>
                                <Input
                                    id="attestation_inscription_pdf"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setData('attestation_inscription_pdf', e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="text-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Soumettre Candidature
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}