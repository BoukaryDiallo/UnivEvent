import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SectionCardProps = {
    id: string;
    title: string;
    description: string;
    status?: 'complete' | 'partial' | 'empty';
    action?: ReactNode;
    children: ReactNode;
};

const statusMap = {
    complete: { label: 'Complete', className: 'bg-emerald-100 text-emerald-700' },
    partial: { label: 'Partiel', className: 'bg-amber-100 text-amber-700' },
    empty: { label: 'Vide', className: 'bg-rose-100 text-rose-700' },
};

export function SectionCard({ id, title, description, status = 'empty', action, children }: SectionCardProps) {
    const badge = statusMap[status];

    return (
        <Card id={id} className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
                        <Badge className={badge.className}>{badge.label}</Badge>
                    </div>
                    <CardDescription className="text-sm text-slate-500">{description}</CardDescription>
                </div>
                {action}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
