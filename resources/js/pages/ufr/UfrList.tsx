import { usePage, Link, router } from '@inertiajs/react'
import Heading from '@/components/heading'
import ufr from '@/routes/ufr';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'

type Ufr = {
  id_ufr: number
  nom: string
  departements_count: number
}

export default function List() {
  const { ufrs } = usePage<{ ufrs: { data: Ufr[] } }>().props

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <Heading
          title="Liste des UFR"
          description="Gestion des unités de formation et de recherche"
        />

        <Link
          href={ufr.create.url()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus size={18} />
          Nouveau UFR
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-4 border-b">
          <Heading
            title="Unités de Formation et de Recherche"
            variant="small"
          />
        </div>

        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nom</th>
                <th className="py-2">Départements</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {ufrs.data.length > 0 ? (
                ufrs.data.map((ufrItem) => (
                  <tr key={ufrItem.id_ufr} className="border-b hover:bg-gray-50">

                    <td className="py-3 font-semibold">
                      {ufrItem.nom}
                    </td>

                    <td>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        {ufrItem.departements_count ?? 0}
                      </span>
                    </td>

                    <td>
                      <div className="flex gap-2">

                        <Link
                          href={ufr.show.url(ufrItem.id_ufr)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          href={ufr.edit.url(ufrItem.id_ufr)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          onClick={() => {
                            if (confirm('Supprimer cet UFR ?')) {
                              router.delete(ufr.destroy.url(ufrItem.id_ufr))
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    Aucun UFR trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
