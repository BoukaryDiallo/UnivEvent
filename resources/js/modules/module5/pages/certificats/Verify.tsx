import { Head } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type CertificatsVerifyProps = {
    certificat?: any;
    message?: string;
    verified?: boolean;
};

export default function CertificatsVerify({ certificat, message, verified }: CertificatsVerifyProps) {
    console.log('CertificatsVerify props:', { certificat, message, verified });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <Head title="Vérification de Certificat" />

            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    {verified && certificat ? (
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-green-100 p-3">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold">Certificat Valide</h2>
                                <p className="text-muted-foreground mt-2">Ce certificat a été vérifié avec succès</p>
                            </div>

                            <div className="space-y-2 text-left bg-slate-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Événement</p>
                                    <p className="font-semibold">{certificat?.event_title || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Participant</p>
                                    <p className="font-semibold">{certificat?.user_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Date d'émission</p>
                                    <p className="font-semibold">
                                        {certificat?.created_at
                                            ? new Date(certificat.created_at).toLocaleDateString('fr-FR')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-red-100 p-3">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold">Certificat Invalide</h2>
                                <p className="text-muted-foreground mt-2">{message || 'Ce certificat n\'a pas pu être vérifié'}</p>
                            </div>
                        </div>
                    )}

                    <Button className="w-full mt-6" asChild>
                        <a href="/">Retour à l'accueil</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
