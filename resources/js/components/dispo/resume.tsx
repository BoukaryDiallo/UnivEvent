import { Bell, CalendarClock, CalendarRange, NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeDispo } from '@/types/dispo';

const cartes = [
    { cle: 'dispos', titre: 'Disponibilités', icon: CalendarClock },
    { cle: 'ecarts', titre: 'Exceptions', icon: CalendarRange },
    { cle: 'reservations', titre: 'Réservations', icon: NotebookPen },
    { cle: 'notifications', titre: 'Notifications', icon: Bell },
] as const;

export function ResumeDispoCards({ resume }: { resume: ResumeDispo }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cartes.map((carte) => (
                <Card key={carte.cle}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <carte.icon className="size-4" />
                            {carte.titre}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {resume[carte.cle]}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
