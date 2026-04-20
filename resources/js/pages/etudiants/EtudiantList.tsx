import { usePage, Link, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import etudiants from '@/routes/etudiants';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, User, Users, GraduationCap } from 'lucide-react'
import type { PageProps } from '@/types/app'

type Etudiant = {
  id: number
  INE: string
  niveau: string
  date_naissance: string
  photo?: string
  user: {
    name: string
  }
  ufr: {
    nom: string
  }
  departement: {
    nom: string
  }
  filiere: {
    nom: string
  }
}

type Props = PageProps<{
  etudiants: Etudiant[]
}>

export default function EtudiantList() {
  const { etudiants: etudiantList } = usePage<Props>().props

  const deleteEtudiant = (id: number) => {
    if (confirm("Confirmer la suppression de l'étudiant?")) {
      router.delete(etudiants.destroy.url(id))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  return (
    <>
      <Head title="Liste des Étudiants" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-600">Liste des Étudiants</h1>
            <p className="text-muted-foreground">Gestion des étudiants inscrits</p>
          </div>
          <Button asChild>
            <Link href={etudiants.create.url()}>
              + Ajouter un étudiant
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Étudiants
            </CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Rechercher par nom ou INE..." className="w-64" />
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-xl">
          <CardContent className="p-0 pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-6 font-semibold">INE</th>
                    <th className="text-left py-3 px-6 font-semibold">Nom</th>
                    <th className="text-left py-3 px-6 font-semibold">UFR</th>
                    <th className="text-left py-3 px-6 font-semibold">Département</th>
                    <th className="text-left py-3 px-6 font-semibold">Filière</th>
                    <th className="text-left py-3 px-6 font-semibold">Niveau</th>
                    <th className="text-left py-3 px-6 font-semibold">Naissance</th>
                    <th className="text-left py-3 px-6 font-semibold">Photo</th>
                    <th className="text-left py-3 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiantList.length > 0 ? (
                    etudiantList.map((etudiant: Etudiant) => (
                      <tr key={etudiant.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="py-4 px-6 font-medium">{etudiant.INE}</td>
                        <td className="py-4 px-6">{etudiant.user.name}</td>
                        <td className="py-4 px-6">{etudiant.ufr.nom}</td>
                        <td className="py-4 px-6">{etudiant.departement.nom}</td>
                        <td className="py-4 px-6">{etudiant.filiere.nom}</td>
                        <td className="py-4 px-6">
                          <Badge variant="secondary">{etudiant.niveau}</Badge>
                        </td>
                        <td className="py-4 px-6 text-sm">{formatDate(etudiant.date_naissance)}</td>
                        <td className="py-4 px-6">
                          {etudiant.photo ? (
                            <img src={`/storage/${etudiant.photo}`} alt="" className="w-10 h-10 rounded-full object-cover border" />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={etudiants.show.url(etudiant.id)}>
                                Voir
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={etudiants.edit.url(etudiant.id)}>
                                Modifier
                              </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteEtudiant(etudiant.id)}>
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">
                        Aucun étudiant trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
