import { Link, usePage } from '@inertiajs/react';
import { 
    FileSearch, 
    ShieldCheck, 
    GraduationCap, 
    Users2, 
    BookOpen, 
    CalendarCheck2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface DashboardHeroProps {
    isAdmin?: boolean;
}

export function DashboardHero({ isAdmin = false }: DashboardHeroProps) {
    const { auth } = usePage().props as { auth: { user: User } };
    const user = auth.user;
    
    const roleConfig = {
        admin: {
            title: "Supervision Globale UnivEvent",
            desc: "Gérez les validations, surveillez l'activité et maintenez l'intégrité de la plateforme.",
            icon: ShieldCheck,
            label: "Espace Administrateur",
            color: "text-rose-300 border-rose-500/30 bg-rose-500/10"
        },
        organisateur: {
            title: "Espace Club & Organisation",
            desc: "Créez des moments inoubliables. Gérez vos participants, programmes et médias en un clic.",
            icon: Users2,
            label: "Portail Club / Organisateur",
            color: "text-amber-300 border-amber-500/30 bg-amber-500/10"
        },
        etudiant: {
            title: "Ton Parcours Événementiel",
            desc: "Inscris-toi aux concours, suis tes conférences et récupère tes certificats de réussite.",
            icon: GraduationCap,
            label: "Espace Étudiant",
            color: "text-sky-300 border-sky-500/30 bg-sky-500/10"
        },
        enseignant: {
            title: "Espace Académique & Partage",
            desc: "Partagez votre expertise, organisez des conférences et suivez l'engagement des étudiants.",
            icon: BookOpen,
            label: "Espace Enseignant",
            color: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
        },
        default: {
            title: "Bienvenue sur UnivEvent",
            desc: "Explorez, participez et gérez vos événements universitaires en toute simplicité.",
            icon: CalendarCheck2,
            label: "Espace Personnel",
            color: "text-cyan-100 border-white/15 bg-white/10"
        }
    };

    const config = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.default;
    const Icon = config.icon;

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.25),transparent_35%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,0.95),rgba(8,145,178,0.6))] p-8 text-white shadow-2xl">
            <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-5">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur ${config.color}`}>
                        <Icon className="size-4" />
                        {config.label}
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl uppercase">
                            {config.title}
                        </h1>

                        <p className="max-w-2xl text-base leading-relaxed text-cyan-50/80 font-medium">
                            Bonjour <span className="text-white font-black underline decoration-indigo-500 underline-offset-4">{user.name}</span>. {config.desc}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-end">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-2xl bg-white text-gray-900 transition hover:bg-cyan-50 font-black uppercase tracking-widest text-xs px-8 h-14"
                    >
                        <Link href="/module5/events">
                            <FileSearch className="mr-2 size-5" />
                            Explorer
                        </Link>
                    </Button>

                    {isAdmin ? (
                        <Button asChild size="lg" variant="ghost" className="rounded-2xl text-cyan-100 transition hover:bg-white/10 font-bold uppercase tracking-widest text-[10px]">
                            <Link href="/admin/events/pending">
                                <ShieldCheck className="mr-2 size-4" />
                                Validation Admin
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

