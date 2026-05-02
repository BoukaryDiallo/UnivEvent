import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import JuryPanel from '@/components/m5/JuryPanel';

type JuryPanelPageProps = {
    concours: any;
    candidatures: any[];
    criteres: any[];
};

export default function JuryPanelPage({ concours, candidatures, criteres }: JuryPanelPageProps) {
    const handleSaveEvaluation = (id: number, data: any) => {
        console.log("Saving evaluation for", id, data);
        // Inertia.post('/m5/evaluations', { candidature_id: id, ...data });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/m5/dashboard/jury' },
        { title: 'Évaluation', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Évaluation - ${concours.titre}`} />
            
            <div className="max-w-7xl mx-auto px-4 py-8 h-full">
                <JuryPanel 
                    concours={concours}
                    candidatures={candidatures}
                    criteres={criteres}
                    onSave={handleSaveEvaluation}
                />
            </div>
        </AppLayout>
    );
}
