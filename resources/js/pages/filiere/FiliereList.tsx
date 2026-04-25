import { usePage, Link, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import filiereRoutes from '@/routes/filiere'
import type { PageProps } from '@/types/app'

type Filiere = {
  id_filiere: number
  code: string
  nom: string
  description?: string
  departement: {
    code: string
    nom: string
    ufr: {
      code: string
      nom: string
    }
  }
}

type Props = PageProps<{
  filieres: Filiere[]
}>

export default function FiliereList() {
  const { filieres } = usePage<Props>().props
  const [searchTerm, setSearchTerm] = useState('')

  const deleteFiliere = (id: number) => {
    if (confirm('Confirmer la suppression de la filière?')) {
      router.delete(filiereRoutes.destroy.url(id))
    }
  }

  const filteredFilieres = filieres.filter((filiere: Filiere) =>
    filiere.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filiere.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filiere.departement?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppLayout>
      <Head title="Liste des Filières" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Liste des Filières</h1>
            <p className="text-muted-foreground">Gestion des filières de formation</p>
          </div>
          <Button asChild>
            <Link href={filiereRoutes.create.url()}>
              + Nouvelle Filière
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Filières de formation
            </CardTitle>
            <div className="relative">
              <Input 
                placeholder="Rechercher une filière..." 
                className="pl-10 w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-xl">
          <CardContent className="p-0 pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-6 font-semibold">Code</th>
                    <th className="text-left py-3 px-6 font-semibold">Nom</th>
                    <th className="text-left py-3 px-6 font-semibold">Département</th>
                    <th className="text-left py-3 px-6 font-semibold">UFR</th>
                    <th className="text-left py-3 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFilieres.length > 0 ? (
                    filteredFilieres.map((filiere: Filiere) => (
                      <tr key={filiere.id_filiere} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            {filiere.code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium">{filiere.nom}</div>
                            {filiere.description && (
                              <div className="text-sm text-muted-foreground">{filiere.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <span className="block text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-100">
                              {filiere.departement.code}
                            </span>
                            <div className="text-sm">{filiere.departement.nom}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {filiere.departement.ufr.code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={filiereRoutes.show.url(filiere.id_filiere)}>
                                Voir
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={filiereRoutes.edit.url(filiere.id_filiere)}>
                                Modifier
                              </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteFiliere(filiere.id_filiere)}>
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p>Aucune filière trouvée</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

