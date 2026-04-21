import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import departementRoutes from '@/routes/departement';
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
    put(departementRoutes.update.url(departement.id_departement));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Départements', href: departementRoutes.index.url() },
    { title: 'Modifier', href: departementRoutes.show.url(departement.id_departement) },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Modifier Département" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Modifier le Département</h1>
          <Button variant="outline" asChild>
            <a href={departementRoutes.show.url(departement.id_departement)}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modifier les informations</CardTitle>
            <CardDescription>Mettez à jour le département</CardDescription>
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
                <Label htmlFor="id_ufr">UFR <span className="text-destructive">*</span></Label>
                <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                  <SelectTrigger id="id_ufr" className={errors.id_ufr ? 'ring-2 ring-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner un UFR" />
                  </SelectTrigger>
                  <SelectContent>
                    {ufrs.map((ufr) => (
                      <SelectItem key={ufr.id_ufr} value={ufr.id_ufr.toString()}>
                        {ufr.code} - {ufr.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_ufr && <p className="text-sm text-destructive">{errors.id_ufr}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <a href={departementRoutes.show.url(departement.id_departement)}>
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

