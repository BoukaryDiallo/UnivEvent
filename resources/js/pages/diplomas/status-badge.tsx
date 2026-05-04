import { Badge } from '@/components/ui/badge';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

const STATUS_VARIANT: Record<string, Variant> = {
    draft: 'outline',
    submitted: 'secondary',
    documents_validated: 'secondary',
    ready_for_pickup: 'default',
    appointment_scheduled: 'default',
    delivered: 'default',
    archived: 'secondary',
    rejected: 'destructive',
};

export function DiplomaStatusBadge({ status, label }: { status: string; label: string }) {
    return <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>{label}</Badge>;
}
