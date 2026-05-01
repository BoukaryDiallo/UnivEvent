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
        <div className="container mx-auto px-6 py-8">
            <Tabs defaultValue="informations" className="space-y-8">
                {/* Onglets modernisés avec couleur bleue pour l'onglet actif */}
                <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-gray-100 rounded-xl shadow-lg">
                    {tabs.map((tab) => (
                        <TabsTrigger 
                            key={tab.id} 
                            value={tab.id} 
                            className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-200 data-[state=active]:hover:bg-blue-700"
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Contenu des onglets */}
                <div className="bg-white rounded-xl shadow-lg border-0 p-6">
                    {children}
                </div>
            </Tabs>
        </div>
    )
}
