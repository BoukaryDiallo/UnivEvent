import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, EditIcon, Building2, GraduationCap, Users, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import {index as departementIndex,edit as departementEdit,destroy as departementDestroy} from '@/routes/departement';
import {index as filiereIndex} from '@/routes/filiere';
import type { BreadcrumbItem } from '@/types';

type Filiere = {
  id_filiere: number;
  nom: string;
  code: string;
  niveau?: string;
  etudiants_count?: number;
}

type Ufr = {
  nom: string;
}

type Departement = {
  id_departement: number;
  nom: string;
  ufr: Ufr | null;
  filieres: Filiere[];
  etudiants_count?: number;
  enseignants_count?: number;
  promotions_count?: number;
  laboratoires_count?: number;
}

type Props = {
  departement: Departement;
}

export default function DepartementShow() {
  const { departement } = usePage<Props>().props;
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Départements', href: departementIndex.url() },
    { title: departement.nom },
  ];

  const deleteDepartement = () => {
    confirm({
      title: 'Supprimer le département',
      description: 'Êtes-vous sûr de vouloir supprimer ce département ?',
      onConfirm: () => router.delete(departementDestroy.url(departement.id_departement)),
      variant: 'destructive'
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Département - ${departement.nom}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{departement.nom}</h1>
            <p className="text-xl text-muted-foreground">Détails du département</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={departementIndex.url()}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={departementEdit.url(departement.id_departement)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN INFO */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Département</span>
                  <p className="text-2xl font-bold">{departement.nom}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">UFR</span>
                  <p className="font-semibold">{departement.ufr?.nom || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* FILIERE LIST */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Filières ({departement.filieres.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {departement.filieres.length > 0 ? (
                  departement.filieres.map((filiere) => (
                    <div key={filiere.id_filiere} className="border rounded-lg p-4 mb-4 last:mb-0 hover:bg-accent">
                      <div className="flex justify-between items-start md:items-center flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold">{filiere.nom}</h3>
                          <p className="text-sm text-muted-foreground">{filiere.code}</p>
                        </div>
                        <div className="flex gap-2">
                          {filiere.niveau && (
                            <Badge variant="secondary">{filiere.niveau}</Badge>
                          )}
                          <Badge>{filiere.etudiants_count || 0} étudiants</Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={filiereIndex.url()}>
                              Voir
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aucune filière</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* STATS SIDEBAR */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {departement.etudiants_count || 0}
                </div>
                <p className="text-muted-foreground mb-6">Étudiants inscrits</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Filières</span>
                    <Badge>{departement.filieres.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Enseignants</span>
                    <Badge>{departement.enseignants_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Promotions</span>
                    <Badge>{departement.promotions_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Laboratoires</span>
                    <Badge>{departement.laboratoires_count || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dernières activités</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground py-8">
                Aucune activité récente disponible.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </AppLayout>
  );
}

