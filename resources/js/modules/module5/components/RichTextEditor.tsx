import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

type Command = 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock';

const toolbar = [
    { label: 'Bold', icon: Bold, command: 'bold' as Command },
    { label: 'Italic', icon: Italic, command: 'italic' as Command },
    { label: 'Bullets', icon: List, command: 'insertUnorderedList' as Command },
    { label: 'Numbers', icon: ListOrdered, command: 'insertOrderedList' as Command },
    { label: 'Quote', icon: Quote, command: 'formatBlock' as Command, value: 'blockquote' },
];

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);

    const runCommand = (command: Command, commandValue?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, commandValue);
        onChange(editorRef.current?.innerHTML || '');
    };

    return (
        <div className={cn('overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950', className)}>
            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                {toolbar.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => runCommand(item.command, item.value)}
                        className="inline-flex size-10 items-center justify-center rounded-2xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-950 dark:hover:text-white"
                        aria-label={item.label}
                    >
                        <item.icon className="size-4" />
                    </button>
                ))}
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-48 px-4 py-4 text-sm leading-7 text-slate-700 outline-none dark:text-slate-200"
                onInput={(event) => onChange(event.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        </div>
    );
}
