import { TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RegistrationChartProps {
    data: Array<{ label: string; date: string; inscriptions: number }>;
}

export function RegistrationChart({ data }: RegistrationChartProps) {
    // Calculer le total des inscriptions
    const totalInscriptions = data.reduce((sum, item) => sum + item.inscriptions, 0);

    // Calculer la variation par rapport à hier
    const today = data[data.length - 1]?.inscriptions || 0;
    const yesterday = data[data.length - 2]?.inscriptions || 0;
    const variation = today - yesterday;
    const variationPercent = yesterday > 0 ? ((variation / yesterday) * 100).toFixed(1) : '0.0';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Évolution des inscriptions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardDescription>
                Vue glissante sur 7 jours
            </CardDescription>
            <CardContent>
                <div className="text-2xl font-bold">{totalInscriptions}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className={variation >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {variation >= 0 ? '+' : ''}{variation} ({variationPercent}%)
                    </span>
                    <span>par rapport à hier</span>
                </div>
                <div className="mt-4 space-y-2">
                    {data.slice(-7).map((item, index) => (
                        <div key={item.date} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-muted-foreground">
                                    {new Date(item.date).toLocaleDateString('fr-FR', {
                                        weekday: 'short'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{item.inscriptions}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
