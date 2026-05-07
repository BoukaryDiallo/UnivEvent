import { router, useForm } from '@inertiajs/react';
import { 
    Layout, 
    Palette, 
    Type, 
    Image as ImageIcon, 
    Save, 
    Eye, 
    FileText,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type CertificateStudioProps = {
    event: any;
    onToast?: (message: string) => void;
};

export function CertificateStudio({ event, onToast }: CertificateStudioProps) {
    const { data, setData, patch, processing } = useForm({
        certificate_template_schema: event.certificate_template_schema || {
            background: '#ffffff',
            accent: '#4f46e5',
            title: 'Certificat de Réussite',
            layout: 'landscape_classic',
            show_qr: true,
            show_registration_qr: true,
        },
    });

    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const fetchPreview = async () => {
        setIsPreviewLoading(true);
        try {
            const response = await fetch('/certificats/previsualiser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    evenement_id: event.id,
                    template: data.certificate_template_schema,
                }),
            });
            const result = await response.json();
            setPreviewHtml(result.html);
        } catch (error) {
            console.error('Failed to fetch preview', error);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSave = () => {
        patch(`/module5/events/${event.id}`, {
            preserveScroll: true,
            onSuccess: () => onToast?.('Modèle de certificat enregistré.'),
        });
    };

    const updateSchema = (key: string, value: any) => {
        setData('certificate_template_schema', {
            ...data.certificate_template_schema,
            [key]: value,
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Sidebar */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Palette className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Design Studio</span>
                        </div>
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Éditeur Pro</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Titre Principal</Label>
                            <Input 
                                value={data.certificate_template_schema.title} 
                                onChange={e => updateSchema('title', e.target.value)}
                                className="h-11 rounded-xl border-gray-100"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Couleur Accent</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        type="color" 
                                        value={data.certificate_template_schema.accent} 
                                        onChange={e => updateSchema('accent', e.target.value)}
                                        className="h-11 w-12 p-1 rounded-lg border-gray-100"
                                    />
                                    <Input 
                                        value={data.certificate_template_schema.accent} 
                                        onChange={e => updateSchema('accent', e.target.value)}
                                        className="h-11 flex-1 rounded-xl border-gray-100 text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fond</Label>
                                <Input 
                                    type="color" 
                                    value={data.certificate_template_schema.background} 
                                    onChange={e => updateSchema('background', e.target.value)}
                                    className="h-11 w-full p-1 rounded-lg border-gray-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mise en page</Label>
                            <Select 
                                value={data.certificate_template_schema.layout} 
                                onValueChange={v => updateSchema('layout', v)}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-gray-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="canvas_v1">🎨 Canvas Pro (Moderne)</SelectItem>
                                    <SelectItem value="landscape_classic">📜 Classique Paysage</SelectItem>
                                    <SelectItem value="minimalist">◽ Minimaliste Épuré</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                            <Button 
                                variant="outline" 
                                className="w-full rounded-xl h-12 font-bold text-gray-600 border-gray-100"
                                onClick={fetchPreview}
                                disabled={isPreviewLoading}
                            >
                                <Eye className="mr-2 h-4 w-4" /> 
                                {isPreviewLoading ? 'Génération...' : 'Actualiser l\'aperçu'}
                            </Button>
                            <Button 
                                className="w-full rounded-xl h-12 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs shadow-lg"
                                onClick={handleSave}
                                disabled={processing}
                            >
                                <Save className="mr-2 h-4 w-4" /> Enregistrer le modèle
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-indigo-900 p-6 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                    <div className="flex items-center gap-2">
                        <Trophy className="size-5 text-amber-400" />
                        <h4 className="font-black uppercase tracking-tight text-sm">Conseil Expert</h4>
                    </div>
                    <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                        Un certificat certifié UnivEvent comporte automatiquement deux QR codes : un pour l'authenticité et un pour la preuve d'inscription.
                    </p>
                </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Layout className="size-4" /> Aperçu du Rendu PDF
                    </h3>
                    <Badge className="bg-emerald-50 text-emerald-700 border-0 uppercase text-[9px] font-black">Mode paysage A4</Badge>
                </div>

                <div className="relative aspect-[1.414/1] bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden group">
                    {previewHtml ? (
                        <iframe 
                            srcDoc={previewHtml} 
                            className="w-full h-full border-0 pointer-events-none scale-[0.6] origin-top" 
                            title="Certificate Preview"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-4">
                            <FileText className="size-20 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">Cliquez sur actualiser pour voir l'aperçu</p>
                        </div>
                    )}
                    
                    {isPreviewLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                            <div className="flex flex-col items-center gap-4">
                                <RefreshCw className="size-10 text-indigo-600 animate-spin" />
                                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Génération du canvas...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
