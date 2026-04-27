import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface WorkflowTabsLayoutProps {
    title?: string
    description?: string
    onBack?: () => void
    children: React.ReactNode
    defaultTab?: string
}

export default function WorkflowTabsLayout({
    title,
    description,
    onBack,
    children,
    defaultTab = "liste_generee"
}: WorkflowTabsLayoutProps) {
    const tabs = [
        { id: 'liste_generee', label: '🟡 Candidatures', icon: null },
        { id: 'planifiee', label: '🟠 Planifiées', icon: null },
        { id: 'ouverte', label: '🟢 Ouvertes', icon: null },
        { id: 'cloturee', label: '🔴 Clôturées', icon: null },
        { id: 'terminee', label: '🏆 Terminées', icon: null },
    ]

    return (
        <div className="container mt-4 space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">{title || "Espace Élections"}</h1>
                <p className="text-gray-600">{description || "Suivez l'évolution des élections en temps réel"}</p>
                
                {onBack && (
                    <div className="flex justify-center">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {children}
            </Tabs>
        </div>
    )
}
