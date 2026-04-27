import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ElectionStatusBadgeProps {
  statut: string
  className?: string
}

export default function ElectionStatusBadge({ statut, className }: ElectionStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'brouillon':
        return {
          variant: 'secondary' as const,
          label: 'Brouillon',
          className: ''
        }
      case 'liste_generee':
        return {
          variant: 'default' as const,
          label: 'Liste générée',
          className: 'bg-blue-500 text-white hover:bg-blue-600'
        }
      case 'ouverte':
        return {
          variant: 'default' as const,
          label: 'Ouverte',
          className: 'bg-green-500 text-white hover:bg-green-600'
        }
      case 'candidatures_ouvertes':
        return {
          variant: 'default' as const,
          label: 'Candidatures ouvertes',
          className: 'bg-blue-500 text-white hover:bg-blue-600'
        }
      case 'candidatures_cloturees':
        return {
          variant: 'secondary' as const,
          label: 'Candidatures clôturées',
          className: ''
        }
      case 'en_cours':
        return {
          variant: 'default' as const,
          label: 'En cours',
          className: 'bg-orange-500 text-white hover:bg-orange-600'
        }
      case 'terminee':
        return {
          variant: 'secondary' as const,
          label: 'Terminée',
          className: ''
        }
      case 'cloturee':
        return {
          variant: 'destructive' as const,
          label: 'Clôturée',
          className: ''
        }
      case 'validee':
        return {
          variant: 'default' as const,
          label: 'Validée',
          className: 'bg-green-500 text-white hover:bg-green-600'
        }
      case 'rejetee':
        return {
          variant: 'destructive' as const,
          label: 'Rejetée',
          className: ''
        }
      default:
        return {
          variant: 'secondary' as const,
          label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
          className: ''
        }
    }
  }

  const config = getStatusConfig(statut)

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
