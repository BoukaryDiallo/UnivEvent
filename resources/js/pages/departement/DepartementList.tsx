import { usePage, Link, router } from '@inertiajs/react'
import { Head, useForm } from '@inertiajs/react'
import Heading from '@/components/heading'
import AppLayout from '@/layouts/app-layout'
import departement from '@/routes/departement';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import type { PageProps } from '@/types/app'

type Departement = {
  id_departement: number
  nom: string
  ufr: {
    nom: string
  } | null
}

type Props = PageProps<{
  departements: Departement[]
}>

export default function DepartementList() {
  const { departements } = usePage<Props>().props
  const [searchTerm, setSearchTerm] = useState('')

  const { processing } = useForm()

  const deleteDepartement = (id: number) => {
    if (confirm('Confirmer la suppression du département?')) {
      router.delete(departement.destroy.url(id))
    }
  }

  const filteredDepartements = departements.filter((departementItem: Departement) =>
    departementItem.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departementItem.ufr?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppLayout>
      <Head title="Liste des Départements" />

      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Liste des Départements</h1>
            <p className="text-muted-foreground">Gestion des départements universitaires</p>
          </div>
          <Button asChild>
            <Link href={departement.create.url()}>
              + Nouveau Département
            </Link>
          </Button>
        </div>

        {/* SEARCH & TITLE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              Départements
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Input 
                  placeholder="Rechercher un département..." 
                  className="pl-10 w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* TABLE */}
        <Card className="shadow-xl">
          <CardContent className="p-0 pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-gray-100">ID</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-gray-100">Nom</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-gray-100">UFR</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartements.length > 0 ? (
                    filteredDepartements.map((departementItem: Departement) => (
                      <tr key={departementItem.id_departement} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {departementItem.id_departement}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                          {departementItem.nom}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {departementItem.ufr?.nom || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={departement.show.url(departementItem.id_departement)}>
                                Voir
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={departement.edit.url(departementItem.id_departement)}>
                                Modifier
                              </Link>
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteDepartement(departementItem.id_departement)}
                              disabled={processing}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          Aucun département trouvé
                        </div>
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
