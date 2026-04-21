import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    candidatures: Candidature[];
}

interface Candidature {
    id_candidature: number;
    programme: string;
    user: { name: string };
}

interface Props extends PageProps {
    election: Election;
}

export default function VoteCreate() {
    const { election } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        id_election: election.id_election,
        id_candidature: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('votes.store'));
    };

    return (
        <AppLayout>
            <Head title="Votez pour votre Délégué" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Votez pour votre Délégué</CardTitle>
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
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label>Choisissez votre candidat :</Label>
                                {election.candidatures.map((candidature) => (
                                    <div key={candidature.id_candidature} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="id_candidature"
                                            value={candidature.id_candidature}
                                            checked={data.id_candidature === candidature.id_candidature.toString()}
                                            onChange={(e) => setData('id_candidature', e.target.value)}
                                            className="mr-2"
                                        />
                                        <Label>
                                            {candidature.user.name}
                                            {candidature.programme && ` – ${candidature.programme.slice(0, 50)}...`}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <div className="text-end">
                                <Button type="submit" disabled={processing}>
                                    Valider mon Vote
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}