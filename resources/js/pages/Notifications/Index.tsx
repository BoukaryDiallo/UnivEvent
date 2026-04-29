import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Notifications',
        href: '/notifications',
    },
]

interface Notification {
  id: number
  type_notif: string
  message: string
  lu: boolean
  date_envoi: string
  club: { id: number; nom: string }
}

interface Props {
  notifications: Notification[]
}

export default function NotificationsIndex({ notifications }: Props) {
  const { put, processing } = useForm({})

  const handleMarkAsRead = (id: number) => {
    put(`/notifications/${id}/lire`)
  }

  const handleMarkAllAsRead = () => {
    put('/notifications/tout-lire')
  }

  const typeColors = {
    adhesion: 'bg-blue-100 text-blue-800',
    activite: 'bg-purple-100 text-purple-800',
    local: 'bg-green-100 text-green-800',
    budget: 'bg-yellow-100 text-yellow-800',
  }

  const typeLabels = {
    adhesion: 'Adhésion',
    activite: 'Activité',
    local: 'Local',
    budget: 'Budget',
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Consultez vos notifications</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 ${!notification.lu ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${typeColors[notification.type_notif as keyof typeof typeColors]}`}>
                      {typeLabels[notification.type_notif as keyof typeof typeLabels]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.date_envoi).toLocaleString('fr-FR')}
                    </span>
                    {!notification.lu && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-900">{notification.message}</p>
                  <Link
                    href={`/clubs/${notification.club.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                  >
                    {notification.club.nom}
                  </Link>
                </div>
                {!notification.lu && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={processing}
                    className="ml-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Marquer comme lu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune notification
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
