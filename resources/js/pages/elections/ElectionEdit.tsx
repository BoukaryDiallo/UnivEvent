import { Head, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ElectionForm from '@/components/elections/ElectionForm';
import { Button } from '@/components/ui/button';
import { NavigationBreadcrumb } from '@/components/ui/navigation-breadcrumb';
import { TextLink } from '@/components/ui/text-link';
import AppLayout from '@/layouts/app-layout';
import elections from '@/routes/elections';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    type: string;
    id_ufr?: number;
    id_filiere?: number;
    statut: string;
}

interface Ufr {
    id_ufr: number;
    nom: string;
}

interface Filiere {
    id_filiere: number;
    nom: string;
}

interface Props extends PageProps {
    election: Election;
    ufrs: Ufr[];
    filieres: Filiere[];
}

export default function ElectionEdit() {
    const { election, ufrs, filieres } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        titre: election.titre,
        description: election.description,
        date_debut: new Date(election.date_debut).toISOString().slice(0, 16),
        date_fin: new Date(election.date_fin).toISOString().slice(0, 16),
        type: election.type,
        id_ufr: election.id_ufr?.toString() || '',
        id_filiere: election.id_filiere?.toString() || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(elections.update.url({election: election.id_election}));
    };

    const onCancel = () => {
        router.get(elections.show.url({ election: election.id_election }));
    };

    return (
        <AppLayout>
            <Head title="Modifier une Élection" />
            <div className="container mt-5">
                <NavigationBreadcrumb
                    items={[
                        { label: 'Élections', href: '/elections' },
                        { label: election.titre, href: `/elections/${election.id_election}` },
                        { label: 'Modifier', current: true }
                    ]}
                    className="mb-6"
                />
                
                <ElectionForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    ufrs={ufrs}
                    filieres={filieres}
                    mode="edit"
                    election={election}
                    submitLabel="Mettre à jour"
                    title="Modifier une Élection"
                    onCancel={onCancel}
                />
            </div>
        </AppLayout>
    );
}