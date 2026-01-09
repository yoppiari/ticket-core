'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { BoldIcon, ItalicIcon, StrikethroughIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, ListIcon, ListOrderedIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

const ToolbarButton = ({ onClick, isActive, children }: { onClick: () => void, isActive?: boolean, children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300",
            isActive && "bg-zinc-200 dark:bg-zinc-600 text-black dark:text-white"
        )}
    >
        {children}
    </button>
);

export default function RichTextEditor({ value, onChange, label, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Update editor content if value changes externally (e.g. initial load)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="space-y-1">
            {label && <label className="block text-sm font-medium dark:text-zinc-200">{label}</label>}
            <div className="border rounded-lg overflow-hidden dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-800">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                    >
                        <BoldIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                    >
                        <ItalicIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                    >
                        <StrikethroughIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                    >
                        <AlignLeftIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                    >
                        <AlignCenterIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                    >
                        <AlignRightIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                    >
                        <ListIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                    >
                        <ListOrderedIcon className="w-4 h-4" />
                    </ToolbarButton>
                </div>
                <EditorContent editor={editor} />
            </div>
            {placeholder && editor.isEmpty && <div className="text-xs text-zinc-400 mt-1">{placeholder}</div>}
        </div>
    );
}
