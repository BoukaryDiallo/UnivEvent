import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';

type Departement = {
  id_departement: number;
  nom: string;
};

type Filiere = {
  id_filiere: number;
  nom: string;
  id_departement: number;
};

type Props = {
  filiere: Filiere;
  departements: Departement[];
}

export default function FiliereEdit() {
  const { filiere, departements } = usePage<Props>().props;

  const { data, setData, put, processing, errors } = useForm({
    nom: filiere.nom || '',
    id_departement: filiere.id_departement.toString(),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('filiere.update', filiere.id_filiere));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Filières', href: '/filiere' },
    { title: 'Modifier', href: `/filiere/${filiere.id_filiere}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Modifier Filière" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Modifier la Filière</h1>
          <Button variant="outline" asChild>
            <a href={`/filiere/${filiere.id_filiere}`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modifier les informations</CardTitle>
            <CardDescription>Mettez à jour la filière</CardDescription>
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
                    {departements.map((departement: Departement) => (
                      <SelectItem key={departement.id_departement} value={departement.id_departement.toString()}>
                        {departement.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_departement && <p className="text-sm text-destructive">{errors.id_departement}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <a href={`/filiere/${filiere.id_filiere}`}>
                    Annuler
                  </a>
                </Button>
                <Button type="submit" disabled={processing}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Mettre à jour
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

