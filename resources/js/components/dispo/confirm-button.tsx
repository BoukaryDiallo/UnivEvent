import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ConfirmButton({
    titre,
    texte,
    action,
    variant = 'outline',
    children,
}: {
    titre: string;
    texte: string;
    action: () => void;
    variant?: 'outline' | 'destructive';
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant}>{children}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titre}</DialogTitle>
                    <DialogDescription>{texte}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            setOpen(false);
                            action();
                        }}
                    >
                        Confirmer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
