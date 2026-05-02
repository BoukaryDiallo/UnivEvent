import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2Icon, 
    XCircleIcon, 
    ShieldCheckIcon,
    ArrowLeftIcon,
    ExternalLinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CertificatPreview from '@/components/m5/CertificatPreview';

type CertificatVerifyProps = {
    certificat: any | null;
    token: string;
};

export default function CertificatVerify({ certificat, token }: CertificatVerifyProps) {
    const isValid = certificat && certificat.valide !== false;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
            <Head title="Vérification de Certificat - UnivEvent" />

            {/* Public Header */}
            <header className="bg-white border-b border-gray-100 py-6 dark:bg-slate-900 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-gray-900 dark:text-white uppercase">
                            UnivEvent <span className="text-indigo-600">Verify</span>
                        </span>
                    </div>
                    <Link href="/" className="text-xs font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest transition-colors">
                        <ArrowLeftIcon className="h-3 w-3" />
                        Retour au portail
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 space-y-12">
                {isValid ? (
                    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                        {/* Status Alert */}
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle2Icon className="h-10 w-10 text-emerald-600" />
                            </div>
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Certificat Authentique</h1>
                                <p className="text-sm text-emerald-700/80 leading-relaxed max-w-xl">
                                    Ce document a été officiellement émis par l'Université Joseph KI-ZERBO via UnivEvent. 
                                    Les informations ci-dessous correspondent aux registres de notre base de données.
                                </p>
                            </div>
                            <div className="md:ml-auto">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-12 font-bold uppercase tracking-widest text-xs">
                                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                    Télécharger
                                </Button>
                            </div>
                        </div>

                        {/* Certificate Render */}
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/50 dark:bg-slate-900 dark:shadow-none">
                            <CertificatPreview certificat={certificat} mode="print" />
                        </div>

                        {/* Audit Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-100/50 p-8 rounded-[2rem] border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Détails de l'émission</h3>
                                <dl className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                        <dt className="text-xs text-gray-500">Destinataire</dt>
                                        <dd className="text-xs font-bold text-gray-900 dark:text-white uppercase">{certificat.prenom_participant} {certificat.nom_participant}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                        <dt className="text-xs text-gray-500">Événement</dt>
                                        <dd className="text-xs font-bold text-gray-900 dark:text-white">{certificat.titre_evenement}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-xs text-gray-500">Date d'émission</dt>
                                        <dd className="text-xs font-bold text-gray-900 dark:text-white">{certificat.date_evenement}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="bg-gray-100/50 p-8 rounded-[2rem] border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Sécurité</h3>
                                <dl className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                        <dt className="text-xs text-gray-500">Numéro de série</dt>
                                        <dd className="text-xs font-mono font-bold text-indigo-600">{certificat.numero_serie}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                        <dt className="text-xs text-gray-500">Type de certificat</dt>
                                        <dd className="text-xs font-bold text-gray-900 dark:text-white uppercase">{certificat.type_certificat}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-xs text-gray-500">Token de validation</dt>
                                        <dd className="text-xs font-mono font-bold text-gray-400 truncate max-w-[150px]">{token}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto text-center space-y-8 py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="h-24 w-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-100">
                            <XCircleIcon className="h-12 w-12 text-rose-600" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Certificat Invalide</h1>
                            <p className="text-gray-500 leading-relaxed">
                                Le code de vérification fourni ne correspond à aucun certificat actif dans notre système. 
                                Cela peut être dû à un lien expiré, révoqué ou à une erreur de saisie.
                            </p>
                        </div>
                        <div className="pt-8">
                            <Button asChild variant="outline" className="rounded-2xl h-12 px-8 border-gray-200">
                                <Link href="/">Retourner à l'accueil</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Public Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-slate-900">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                        Vérifié par UnivEvent — Université Joseph KI-ZERBO
                    </p>
                    <p className="text-[9px] text-gray-400">
                        © 2026 UJKZ / IFOAD — L3 Génie Logiciel
                    </p>
                </div>
            </footer>
        </div>
    );
}
