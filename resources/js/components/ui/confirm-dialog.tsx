import { useState } from 'react'
import { Button } from './button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './dialog'
import { Spinner } from './spinner'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    isLoading?: boolean
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'default',
    isLoading = false
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm()
            onClose() // Fermer le dialogue après la confirmation
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                En cours...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Hook pour gérer facilement les dialogues de confirmation
export function useConfirmDialog() {
    const [dialog, setDialog] = useState<{
        isOpen: boolean
        title: string
        description: string
        onConfirm: () => void
        confirmText?: string
        cancelText?: string
        variant?: 'default' | 'destructive'
        isLoading?: boolean
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        variant: 'default',
        isLoading: false
    })

    const confirm = (options: {
        title: string
        description: string
        onConfirm: () => void
        confirmText?: string
        cancelText?: string
        variant?: 'default' | 'destructive'
    }) => {
        setDialog({
            isOpen: true,
            ...options,
            isLoading: false
        })
    }

    const close = () => {
        setDialog(prev => ({ ...prev, isOpen: false }))
    }

    const setLoading = (loading: boolean) => {
        setDialog(prev => ({ ...prev, isLoading: loading }))
    }

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            isOpen={dialog.isOpen}
            onClose={close}
            onConfirm={dialog.onConfirm}
            title={dialog.title}
            description={dialog.description}
            confirmText={dialog.confirmText}
            cancelText={dialog.cancelText}
            variant={dialog.variant}
            isLoading={dialog.isLoading}
        />
    )

    return {
        confirm,
        close,
        setLoading,
        ConfirmDialog: ConfirmDialogComponent
    }
}
