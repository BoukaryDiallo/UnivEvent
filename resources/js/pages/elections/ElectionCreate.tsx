import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ElectionForm from '@/components/elections/ElectionForm';
import { TextLink } from '@/components/ui/text-link';
import { NavigationBreadcrumb } from '@/components/ui/navigation-breadcrumb';
import { store as electionsStore } from '@/routes/elections';
import type { PageProps } from '@/types/app';

interface Ufr {
    id_ufr: number;
    nom: string;
}

interface Filiere {
    id_filiere: number;
    nom: string;
}

interface CandidatQualifie {
    id_candidature: number;
    user: {
        name: string;
        photo?: string;
    };
    slogan?: string;
}

interface Props extends PageProps {
    ufrs: Ufr[];
    filieres: Filiere[];
    election?: {
        id_election: number;
        titre: string;
        description?: string;
        type?: string;
        id_ufr?: number;
        id_filiere?: number;
    };
    mode?: 'second_tour';
    candidatsQualifies?: CandidatQualifie[];
}

export default function ElectionCreate() {
    const { ufrs, filieres, election, mode, candidatsQualifies } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        titre: election?.titre || '',
        description: election?.description || '',
        date_debut: '',
        date_fin: '',
        type: election?.type || '',
        id_ufr: election?.id_ufr?.toString() || '',
        id_filiere: election?.id_filiere?.toString() || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'second_tour') {
            post(`/elections/${election?.id_election}/second-tour`);
        } else {
            post(electionsStore.url());
        }
    };

    const title = mode === 'second_tour' ? "Configuration du Second Tour" : "Créer une Élection";
    const submitLabel = mode === 'second_tour' ? 'Configurer Second Tour' : 'Créer Élection';

    return (
        <AppLayout>
            <Head title={title} />
            <div className="container mt-5">
                <NavigationBreadcrumb
                    items={[
                        { label: 'Élections', href: '/elections' },
                        { label: title, current: true }
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
                    mode={mode || 'create'}
                    election={election}
                    candidatsQualifies={candidatsQualifies}
                    submitLabel={submitLabel}
                    title={title}
                    onCancel={() => router.visit('/elections')}
                />
            </div>
        </AppLayout>
    );
}