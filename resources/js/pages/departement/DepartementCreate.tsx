import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import departement from '@/routes/departement';
import type { BreadcrumbItem } from '@/types';

type Ufr = {
  id_ufr: number;
  code: string;
  nom: string;
}

type Props = {
  ufrs: Ufr[];
}

export default function DepartementCreate() {
  const { ufrs } = usePage<{ ufrs: Ufr[] }>().props;

  const { data, setData, post, processing, errors } = useForm({
    nom: '',
    id_ufr: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(departement.store.url());
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Départements', href: departement.index.url() },
    { title: 'Créer' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Créer Département" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Créer un Département</h1>
          <Button variant="outline" asChild>
            <a href={departement.index.url()}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour à la liste
            </a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du Département</CardTitle>
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
                  <a href={departement.index.url()}>
                    Annuler
                  </a>
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

