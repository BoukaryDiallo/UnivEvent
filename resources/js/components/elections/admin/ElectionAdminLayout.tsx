import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge'
import {
    Users, Vote, Trophy, BarChart3, Settings,
    ArrowLeft
} from 'lucide-react'
import type { Election, ElectionAdminLayoutProps } from '@/types/election'

export default function ElectionAdminLayout({
    election,
    children,
    onBack
}: ElectionAdminLayoutProps) {
    const tabs = [
        { id: 'informations', label: 'Informations', icon: Settings },
        { id: 'candidatures', label: 'Candidatures', icon: Users },
        { id: 'vote', label: 'Vote', icon: Vote },
        { id: 'resultats', label: 'Résultats', icon: Trophy },
        { id: 'depouillement', label: 'Dépouillement', icon: BarChart3 },
    ]

    return (
        <div className="container mt-5">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{election.titre}</h1>
                    <p className="text-gray-600 mt-1">{election.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <ElectionStatusBadge statut={election.statut} />
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="informations" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {children}
            </Tabs>
        </div>
    )
}
