import { ResumeDispoCards } from '@/components/dispo/resume';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ResumeDispo, UserDispo } from '@/types/dispo';

export function DispoShell({
    children,
    title,
    description,
    breadcrumbs,
    resume,
    showResume = true,
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    resume: ResumeDispo;
    user?: UserDispo | null;
    showResume?: boolean;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-4">
                <div className="space-y-4 rounded-xl border p-4">
                    <div className="flex flex-col gap-2">
                        <div>
                            <h1 className="text-2xl font-semibold">{title}</h1>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {showResume && <ResumeDispoCards resume={resume} />}
                </div>
                {children}
            </div>
        </AppLayout>
    );
}
