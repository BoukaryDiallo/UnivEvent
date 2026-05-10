import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ElectionStatusBadgeProps {
    status: string;
    label?: string;
    className?: string;
}

const statusStyles = {
    'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'ouverte': 'bg-green-100 text-green-800 border-green-200',
    'terminee': 'bg-gray-100 text-gray-800 border-gray-200',
    'annulee': 'bg-red-100 text-red-800 border-red-200',
    'en_cours': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ElectionStatusBadge({ status, label, className }: ElectionStatusBadgeProps) {
    const styleClass = statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
        <Badge className={cn(styleClass, className)}>
            {label || status}
        </Badge>
    );
}
