import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
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
        id_ufr: election?.id_ufr || '',
        id_filiere: election?.id_filiere || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'second_tour') {
            post(`/elections/${election?.id_election}/second-tour`);
        } else {
            post(electionsStore.url());
        }
    };

    return (
        <AppLayout>
            <Head title={mode === 'second_tour' ? "Configuration Second Tour" : "Créer une Élection"} />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">
                            {mode === 'second_tour' ? "Configuration du Second Tour" : "Créer une Élection"}
                        </CardTitle>
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
                        
                        {/* Afficher les candidats qualifiés en mode second tour */}
                        {mode === 'second_tour' && candidatsQualifies && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Candidats qualifiés pour le second tour</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {candidatsQualifies.map((candidat, index) => (
                                        <div key={candidat.id_candidature} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm bg-gray-50">
                                                    {candidat.user.photo ? (
                                                        <img
                                                            src={`/storage/${candidat.user.photo}`}
                                                            alt={candidat.user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{candidat.user.name}</h4>
                                                    {candidat.slogan && (
                                                        <p className="text-sm text-gray-600 italic mt-1">"{candidat.slogan}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* En mode second tour, n'afficher que les dates */}
                            {mode === 'second_tour' ? (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>Information :</strong> Le second tour opposera uniquement les deux candidats ci-dessus. 
                                            Configurez simplement la période de vote.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="date_debut">Date de début du second tour</Label>
                                        <Input
                                            id="date_debut"
                                            type="datetime-local"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date_fin">Date de fin du second tour</Label>
                                        <Input
                                            id="date_fin"
                                            type="datetime-local"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <Label htmlFor="titre">Titre</Label>
                                        <Input
                                            id="titre"
                                            type="text"
                                            value={data.titre}
                                            onChange={(e) => setData('titre', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            className="form-control"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date_debut">Date de début</Label>
                                        <Input
                                            id="date_debut"
                                            type="datetime-local"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date_fin">Date de fin</Label>
                                        <Input
                                            id="date_fin"
                                            type="datetime-local"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Type d'élection</Label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="ufr"
                                                    checked={data.type === 'ufr'}
                                                    onChange={(e) => setData('type', e.target.value)}
                                                    className="mr-2"
                                                />
                                                UFR
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="promotion"
                                                    checked={data.type === 'promotion'}
                                                    onChange={(e) => setData('type', e.target.value)}
                                                    className="mr-2"
                                                />
                                                Promotion
                                            </label>
                                        </div>
                                    </div>
                                    {data.type === 'ufr' && (
                                        <div>
                                            <Label htmlFor="id_ufr">UFR</Label>
                                            <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="-- Sélectionner UFR --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ufrs.map((ufr) => (
                                                        <SelectItem key={ufr.id_ufr} value={ufr.id_ufr.toString()}>
                                                            {ufr.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {data.type === 'promotion' && (
                                        <div>
                                            <Label htmlFor="id_filiere">Filière</Label>
                                            <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="-- Sélectionner filière --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filieres.map((filiere) => (
                                                        <SelectItem key={filiere.id_filiere} value={filiere.id_filiere.toString()}>
                                                            {filiere.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="text-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {mode === 'second_tour' ? 'Configurer Second Tour' : 'Créer Élection'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}