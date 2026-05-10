import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, EditIcon, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {index as filiereIndex,edit as filiereEdit} from '@/routes/filiere';
import type { BreadcrumbItem } from '@/types';

type Filiere = {
  id_filiere: number;
  nom: string;
  departement: {
    nom: string;
    ufr: {
      nom: string;
    };
  };
};

type Props = {
  filiere: Filiere;
}

export default function FiliereShow() {
  const { filiere } = usePage<{ filiere: Filiere }>().props;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Filières', href: filiereIndex.url() },
    { title: filiere.nom },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Filière - ${filiere.nom}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Détails de la Filière</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={filiereIndex.url()}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={filiereEdit.url(filiere.id_filiere)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">Nom</span>
                <p className="text-2xl font-bold">{filiere.nom}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">Département</span>
                <p className="font-semibold">{filiere.departement.nom}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">UFR</span>
                <p className="font-semibold">{filiere.departement.ufr.nom}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

