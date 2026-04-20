import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';

type Departement = {
  id_departement: number;
  code: string;
  nom: string;
};

type Props = {
  departements: Departement[];
}

export default function FiliereCreate() {
  const { departements } = usePage<{ departements: Departement[] }>().props;

  const { data, setData, post, processing, errors } = useForm({
    nom: '',
    id_departement: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('filiere.store'));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Filières', href: '/filiere' },
    { title: 'Créer' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Créer Filière" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Créer une Filière</h1>
          <Button variant="outline" asChild>
            <a href="/filiere">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour à la liste
            </a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de la Filière</CardTitle>
            <CardDescription>Complétez les champs suivants</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom <span className="text-destructive">*</span></Label>
                <Input
                  id="nom"
                  name="nom"
                  value={data.nom}
                  onChange={(e) => setData('nom', e.target.value)}
                  className={errors.nom ? 'ring-2 ring-destructive' : ''}
                />
                {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_departement">Département <span className="text-destructive">*</span></Label>
                <Select value={data.id_departement} onValueChange={(value) => setData('id_departement', value)}>
                  <SelectTrigger id="id_departement" className={errors.id_departement ? 'ring-2 ring-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departements.map((departement) => (
                      <SelectItem key={departement.id_departement} value={departement.id_departement.toString()}>
                        {departement.code} - {departement.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_departement && <p className="text-sm text-destructive">{errors.id_departement}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
                <Button type="submit" disabled={processing}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

