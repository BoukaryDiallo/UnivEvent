import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    AwardIcon, 
    DownloadIcon, 
    Share2Icon, 
    EyeIcon, 
    SearchIcon,
    FileTextIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CertificatPreview from '@/components/m5/CertificatPreview';

type CertificatsIndexProps = {
    certificats: any[];
    auth: { user: any };
};

export default function CertificatsIndex({ certificats, auth }: CertificatsIndexProps) {
    const [selectedCert, setSelectedCert] = useState(certificats[0] || null);

    const breadcrumbs = [
        { title: 'UnivEvent', href: '/' },
        { title: 'Mes Certificats', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes Certificats - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Certificates List */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Mes Certificats
                            </h1>
                            <p className="text-sm text-gray-500">Gérez vos reconnaissances académiques.</p>
                        </div>

                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Rechercher un certificat..." 
                                className="pl-10 rounded-2xl h-12 border-gray-100 bg-gray-50 dark:bg-slate-900 dark:border-slate-800"
                            />
                        </div>

                        <div className="space-y-4">
                            {certificats.map((cert) => (
                                <div 
                                    key={cert.id}
                                    onClick={() => setSelectedCert(cert)}
                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                                        selectedCert?.id === cert.id 
                                        ? 'bg-indigo-50 border-indigo-600 dark:bg-indigo-950/20' 
                                        : 'bg-white border-gray-50 hover:border-gray-100 dark:bg-slate-950 dark:border-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                            cert.type_certificat === 'excellence' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                            <AwardIcon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{cert.evenement_titre}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{cert.date_evenement}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            cert.type_certificat === 'excellence' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                                        }`}>
                                            {cert.type_certificat}
                                        </span>
                                        <p className="text-[10px] font-mono text-gray-400">N° {cert.numero_serie}</p>
                                    </div>
                                </div>
                            ))}
                            {certificats.length === 0 && (
                                <div className="text-center py-12 px-6 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <FileTextIcon className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm text-gray-400">Vous n'avez pas encore de certificats.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-2">
                        {selectedCert ? (
                            <div className="space-y-8 sticky top-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Prévisualisation</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="rounded-xl h-10 px-4">
                                            <Share2Icon className="mr-2 h-4 w-4" />
                                            Partager
                                        </Button>
                                    </div>
                                </div>
                                
                                <CertificatPreview 
                                    certificat={{
                                        ...selectedCert,
                                        nom_participant: auth.user.nom || auth.user.name,
                                        prenom_participant: auth.user.prenom || '',
                                    }} 
                                />
                                
                                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">À propos de ce certificat</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                        Ce certificat est une preuve officielle de votre réussite ou participation à l'événement. 
                                        Il comporte un code de vérification unique permettant aux employeurs ou institutions de valider son authenticité.
                                    </p>
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                                        Lien de vérification : 
                                        <span className="font-mono bg-indigo-50 px-2 py-1 rounded dark:bg-indigo-950/40">univevent.ujkz.bf/verify/{selectedCert.token_verification}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                <AwardIcon className="h-16 w-16 text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">Sélectionnez un certificat</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
