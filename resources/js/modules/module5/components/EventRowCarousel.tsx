import { ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type EventRowCarouselProps = {
    title: string;
    subtitle: string;
    itemsCount: number;
    children: ReactNode;
};

type DragState = {
    pointerId: number;
    lastX: number;
    velocity: number;
    lastTime: number;
};

const SLIDE_STEP = 352;

export function EventRowCarousel({ title, subtitle, itemsCount, children }: EventRowCarouselProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const inertiaFrameRef = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        return () => {
            if (inertiaFrameRef.current !== null) {
                window.cancelAnimationFrame(inertiaFrameRef.current);
            }
        };
    }, []);

    const stopInertia = () => {
        if (inertiaFrameRef.current !== null) {
            window.cancelAnimationFrame(inertiaFrameRef.current);
            inertiaFrameRef.current = null;
        }
    };

    const startInertia = (initialVelocity: number) => {
        const viewport = viewportRef.current;

        if (!viewport || Math.abs(initialVelocity) < 0.01) {
            return;
        }

        stopInertia();
        let velocity = initialVelocity * 18;

        const step = () => {
            const currentViewport = viewportRef.current;

            if (!currentViewport) {
                inertiaFrameRef.current = null;

                return;
            }

            currentViewport.scrollLeft -= velocity;
            velocity *= 0.92;

            if (Math.abs(velocity) < 0.4) {
                inertiaFrameRef.current = null;

                return;
            }

            inertiaFrameRef.current = window.requestAnimationFrame(step);
        };

        inertiaFrameRef.current = window.requestAnimationFrame(step);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        stopInertia();
        dragStateRef.current = {
            pointerId: event.pointerId,
            lastX: event.clientX,
            velocity: 0,
            lastTime: performance.now(),
        };
        setIsDragging(true);
        viewport.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const viewport = viewportRef.current;
        const dragState = dragStateRef.current;

        if (!viewport || !dragState || dragState.pointerId !== event.pointerId) {
            return;
        }

        const now = performance.now();
        const deltaX = event.clientX - dragState.lastX;
        const deltaTime = Math.max(now - dragState.lastTime, 1);

        viewport.scrollLeft -= deltaX;
        dragState.velocity = deltaX / deltaTime;
        dragState.lastX = event.clientX;
        dragState.lastTime = now;
    };

    const finishDrag = (pointerId: number) => {
        const viewport = viewportRef.current;
        const dragState = dragStateRef.current;

        if (!viewport || !dragState || dragState.pointerId !== pointerId) {
            return;
        }

        try {
            viewport.releasePointerCapture(pointerId);
        } catch {
            // Ignore stale pointer capture releases.
        }

        setIsDragging(false);
        dragStateRef.current = null;
        startInertia(dragState.velocity);
    };

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 dark:border-slate-800 dark:bg-slate-950/70">
                        <GripHorizontal className="size-3.5" />
                        Drag + inertia
                    </span>
                    <span>{itemsCount} cartes</span>
                    <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={() => viewportRef.current?.scrollBy({ left: -SLIDE_STEP, behavior: 'smooth' })}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={() => viewportRef.current?.scrollBy({ left: SLIDE_STEP, behavior: 'smooth' })}>
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
            <div
                ref={viewportRef}
                className={`no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={(event) => finishDrag(event.pointerId)}
                onPointerCancel={(event) => finishDrag(event.pointerId)}
            >
                {children}
            </div>
        </section>
    );
}
