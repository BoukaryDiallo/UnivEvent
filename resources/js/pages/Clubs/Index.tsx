import { Head, Link } from '@inertiajs/react'
import { Club } from '@/types/club'

declare const route: any

interface Props {
  clubs: Club[]
}

export default function ClubsIndex({ clubs }: Props) {
  return (
    <>
      <Head title="Clubs" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clubs de l'université</h1>
          <Link
            href={route('clubs.create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Créer un club
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div key={club.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900">{club.nom}</h2>
              <p className="text-gray-600 mt-2">{club.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-sm ${
                  club.statut === 'actif' ? 'bg-green-100 text-green-800' :
                  club.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {club.statut}
                </span>
                <Link
                  href={route('clubs.show', club.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}