import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Users, Building2, GraduationCap, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Etudiant {
    id_etudiant: number;
    matricule: string;
    INE: string;
    niveau: string;
    statut: string;
    user: {
        name: string;
        email: string;
    };
    filiere: {
        nom: string;
        departement: {
            nom: string;
            ufr: {
                nom: string;
            };
        };
    };
}

interface ListeElectoraleItem {
    id_liste_electorale: number;
    statut_snapshot: string;
    etudiant: Etudiant;
}

interface Props extends PageProps {
    election: Election;
    listeElectorale: ListeElectoraleItem[];
}

export default function ListeElectorale() {
    const { election, listeElectorale } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title={`Liste électorale - ${election.titre}`} />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <Button 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{election.titre}</h2>
                                    <p className="text-blue-100 mt-1">Liste électorale générée</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Users className="h-5 w-5" />
                                Liste des électeurs autorisés
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {listeElectorale.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <AlertCircle className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        Aucune liste électorale
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Aucune liste électorale n'a encore été générée pour cette élection.
                                    </p>
                                    <Button asChild className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                                        <a href={`/elections/${election.id_election}/generer-liste`}>
                                            <Users className="h-4 w-4 mr-2" />
                                            Générer la liste électorale
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">
                                            La liste électorale contient {listeElectorale.length} électeur{listeElectorale.length > 1 ? 's' : ''} autorisés à participer à cette élection.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-gray-50 border-b border-gray-200">
                                                    <TableRow>
                                                        <TableHead className="font-semibold text-gray-700">INE</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">Nom complet</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">Email</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">Niveau</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">Filière</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">Département</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">UFR</TableHead>
                                                        <TableHead className="font-semibold text-gray-700">Statut</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {listeElectorale.map((item, index) => (
                                                        <TableRow key={item.id_liste_electorale} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <TableCell className="font-mono text-sm border-r border-gray-100">
                                                                {item.etudiant.INE}
                                                            </TableCell>
                                                            <TableCell className="font-medium border-r border-gray-100">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <span className="text-xs font-semibold text-blue-600">
                                                                            {item.etudiant.user?.name?.charAt(0).toUpperCase() || 'N'}
                                                                        </span>
                                                                    </div>
                                                                    {item.etudiant.user?.name || 'N/A'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm border-r border-gray-100">
                                                                {item.etudiant.user?.email || 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="border-r border-gray-100">
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    {item.etudiant.niveau}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="border-r border-gray-100">
                                                                <div className="flex items-center gap-1">
                                                                            <GraduationCap className="h-4 w-4 text-purple-500" />
                                                                            {item.etudiant.filiere?.nom || '-'}
                                                                        </div>
                                                            </TableCell>
                                                            <TableCell className="border-r border-gray-100">
                                                                <div className="flex items-center gap-1">
                                                                            <Building2 className="h-4 w-4 text-orange-500" />
                                                                            {item.etudiant.filiere?.departement?.nom || '-'}
                                                                        </div>
                                                            </TableCell>
                                                            <TableCell className="border-r border-gray-100">
                                                                <div className="flex items-center gap-1">
                                                                            <Building2 className="h-4 w-4 text-green-500" />
                                                                            {item.etudiant.filiere?.departement?.ufr?.nom || '-'}
                                                                        </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge 
                                                                    variant={item.statut_snapshot === 'actif' ? 'default' : 'secondary'}
                                                                    className={item.statut_snapshot === 'actif' 
                                                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                                                    }
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        {item.statut_snapshot === 'actif' ? (
                                                                            <CheckCircle className="h-3 w-3" />
                                                                        ) : (
                                                                            <AlertCircle className="h-3 w-3" />
                                                                        )}
                                                                        {item.statut_snapshot}
                                                                    </div>
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-500">
                                                Total : <span className="font-semibold text-gray-700">{listeElectorale.length}</span> électeur{listeElectorale.length > 1 ? 's' : ''}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>Liste validée et prête pour l'élection</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => window.history.back()}
                                                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Retour
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
                                            >
                                                <Download className="h-4 w-4" />
                                                Exporter
                                            </Button>
                                            <Button 
                                                asChild 
                                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-lg"
                                            >
                                                <a href={`/elections/${election.id_election}/prepare`} className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Retour à la préparation
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}