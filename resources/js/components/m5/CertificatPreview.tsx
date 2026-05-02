import { cn } from '@/lib/utils';
import { DownloadIcon, CheckCircle2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CertificatData = {
    nom_participant: string;
    prenom_participant: string;
    titre_evenement: string;
    date_evenement: string;
    type_certificat: string;
    numero_serie: string;
    token_verification: string;
    logo_universite_url?: string;
    signature_url?: string;
    president_jury_nom?: string;
};

type CertificatPreviewProps = {
    certificat: CertificatData;
    mode?: 'preview' | 'print';
};

export default function CertificatPreview({ certificat, mode = 'preview' }: CertificatPreviewProps) {
    const handleDownload = () => {
        // Implementation for downloading the PDF
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className={cn(
                "relative bg-white border-[12px] border-indigo-900 shadow-2xl mx-auto overflow-hidden",
                "aspect-[1.41/1] max-w-4xl", // A4 Landscape ratio
                mode === 'print' ? 'shadow-none border-[8px]' : ''
            )}>
                {/* Internal Decorative Border */}
                <div className="absolute inset-4 border-2 border-indigo-200 pointer-events-none" />
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <span className="text-[12rem] font-black text-indigo-900/5 rotate-45 select-none tracking-tighter">
                        UJKZ
                    </span>
                </div>

                <div className="relative h-full flex flex-col p-12 text-center items-center justify-between">
                    {/* Header */}
                    <div className="space-y-2">
                        {certificat.logo_universite_url ? (
                            <img src={certificat.logo_universite_url} alt="Logo UJKZ" className="h-20 mx-auto" />
                        ) : (
                            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-indigo-600 font-bold">UJKZ</span>
                            </div>
                        )}
                        <h1 className="text-xl font-bold text-gray-900 tracking-[0.2em] uppercase">
                            Université Joseph KI-ZERBO
                        </h1>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                            Module UnivEvent — Gestion des Conférences & Concours
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6 w-full">
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.3em]">
                            CERTIFIE QUE
                        </p>
                        
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-indigo-950 uppercase">
                                {certificat.prenom_participant} {certificat.nom_participant}
                            </h2>
                            <div className="h-0.5 w-64 bg-indigo-100 mx-auto" />
                        </div>

                        <div className="space-y-4">
                            <p className="text-lg text-gray-600 italic">
                                {certificat.type_certificat === 'concours' 
                                    ? 'a remporté le prix d\'excellence lors du' 
                                    : 'a participé avec succès à la conférence'}
                            </p>
                            <h3 className="text-2xl font-bold text-indigo-800 italic">
                                "{certificat.titre_evenement}"
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                                Fait le {certificat.date_evenement} à Ouagadougou
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full flex justify-between items-end">
                        {/* Left: Serial & Verification */}
                        <div className="text-left space-y-3">
                            <div className="w-20 h-20 bg-gray-50 border border-gray-100 p-1 flex items-center justify-center">
                                <div className="size-full bg-slate-200 animate-pulse flex items-center justify-center text-[8px] text-gray-400 text-center px-1">
                                    QR CODE VERIFICATION
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-gray-400 font-mono">N° {certificat.numero_serie}</p>
                                <p className="text-[10px] text-indigo-400 font-medium">univevent.ujkz.bf/verify/{certificat.token_verification}</p>
                            </div>
                        </div>

                        {/* Center: Seal */}
                        <div className="relative">
                            <div className="size-24 rounded-full border-4 border-indigo-100/50 flex items-center justify-center">
                                <div className="size-20 rounded-full border-2 border-indigo-50 flex flex-col items-center justify-center">
                                    <span className="text-[8px] font-bold text-indigo-200/50 uppercase text-center leading-tight">
                                        OFFICIAL SEAL<br/>UNIVEVENT
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Signature */}
                        <div className="text-right space-y-2 w-48">
                            <div className="h-16 flex items-end justify-end border-b border-indigo-100">
                                {certificat.signature_url ? (
                                    <img src={certificat.signature_url} alt="Signature" className="h-full object-contain" />
                                ) : (
                                    <span className="text-gray-300 italic text-sm mb-1">Signature autorisée</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">{certificat.president_jury_nom || 'Le Président de l\'Université'}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Président du Jury / Autorité</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {mode === 'preview' && (
                <div className="flex justify-center gap-4">
                    <Button 
                        onClick={handleDownload}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
                    >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Télécharger le PDF
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => window.print()}
                        className="rounded-xl"
                    >
                        Imprimer
                    </Button>
                </div>
            )}
        </div>
    );
}
