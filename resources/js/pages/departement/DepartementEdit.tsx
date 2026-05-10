import { Head, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeftIcon, SaveIcon, Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {index as departementIndex,update as departementUpdate} from '@/routes/departement';
import type { BreadcrumbItem } from '@/types';

type Ufr = {
  id_ufr: number;
  code: string;
  nom: string;
};

type Departement = {
  id_departement: number;
  nom: string;
  id_ufr: number;
};

type Props = {
  departement: Departement;
  ufrs: Ufr[];
}

export default function DepartementEdit() {
  const { departement, ufrs } = usePage<{
    departement: Departement;
    ufrs: Ufr[];
  }>().props;

  const { data, setData, put, processing, errors, setError } = useForm({
    nom: departement.nom || '',
    id_ufr: departement.id_ufr?.toString() || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(departementUpdate.url(departement.id_departement));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Départements', href: departementIndex.url() },
    { title: 'Modifier' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Modifier Département" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Modifier le Département</h1>
                <p className="text-blue-100 mt-2">Mettre à jour les informations du département</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <a href={departementIndex.url()}>
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Retour à la liste
                </a>
              </Button>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Modifier les informations
              </CardTitle>
              <CardDescription className="text-gray-600">
                Mettez à jour les informations du département
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                    Nom du département <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.nom ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Département d'Informatique"
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.nom}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_ufr" className="text-sm font-medium text-gray-700">
                    UFR de rattachement <span className="text-red-500">*</span>
                  </Label>
                  <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                    <SelectTrigger 
                      id="id_ufr" 
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.id_ufr ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                      }`}
                    >
                      <SelectValue placeholder="Sélectionner un UFR" />
                    </SelectTrigger>
                    <SelectContent className="border-2 shadow-lg">
                      {ufrs.map((ufr) => (
                        <SelectItem key={ufr.id_ufr} value={ufr.id_ufr.toString()} className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-600">{ufr.code}</span>
                            <span className="text-gray-400">-</span>
                            <span>{ufr.nom}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.id_ufr && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.id_ufr}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200" 
                    asChild
                  >
                    <a href={departementIndex.url()}>
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                      Annuler
                    </a>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={processing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    {processing ? 'Mise à jour...' : 'Mettre à jour'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

