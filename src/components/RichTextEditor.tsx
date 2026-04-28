import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

/** Props for the RichTextEditor component. */
export interface RichTextEditorProps {
  /** HTML string value */
  value: string;
  /** Called with the updated HTML string on every edit */
  onChange: (html: string) => void;
  /** Placeholder text shown when the editor is empty */
  placeholder?: string;
  /** Additional CSS class names */
  className?: string;
  /** 'rich' shows the full toolbar; 'plain' hides it for simple text inputs */
  mode?: "rich" | "plain";
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  label,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-gray-100 active:bg-gray-200 text-gray-700"
      }`}
      aria-label={label}
      aria-pressed={isActive}
      title={title}
    >
      {children}
    </button>
  );
}

/** Reusable TipTap WYSIWYG editor with rich and plain modes. */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = "",
  mode = "rich",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: mode === "rich" ? { levels: [2, 3] } : false,
        bulletList: mode === "rich" ? {} : false,
        orderedList: mode === "rich" ? {} : false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[2rem] px-3 py-2 ${
          mode === "plain" ? "prose-p:m-0" : ""
        }`,
        role: "textbox",
        "aria-multiline": mode === "rich" ? "true" : "false",
        "aria-label": placeholder ?? "Szövegszerkesztő",
      },
    },
  });

  // Sync external value changes (e.g. language switch) without losing cursor
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const insertLink = useCallback(() => {
    if (!editor) return;

    const existingHref = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL:", existingHref ?? "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}
    >
      {mode === "rich" && (
        <div
          className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1"
          role="toolbar"
          aria-label="Szövegformázás"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            label="Félkövér (Ctrl+B)"
            title="Félkövér"
          >
            <Bold className="h-5 w-5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            label="Dőlt (Ctrl+I)"
            title="Dőlt"
          >
            <Italic className="h-5 w-5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            label="Aláhúzott (Ctrl+U)"
            title="Aláhúzott"
          >
            <UnderlineIcon className="h-5 w-5" />
          </ToolbarButton>

          <span className="w-px bg-gray-300 mx-1 self-stretch" role="separator" />

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            label="Címsor 2"
            title="Címsor 2"
          >
            <Heading2 className="h-5 w-5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            label="Címsor 3"
            title="Címsor 3"
          >
            <Heading3 className="h-5 w-5" />
          </ToolbarButton>

          <span className="w-px bg-gray-300 mx-1 self-stretch" role="separator" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            label="Felsorolás"
            title="Felsorolás"
          >
            <List className="h-5 w-5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            label="Számozott lista"
            title="Számozott lista"
          >
            <ListOrdered className="h-5 w-5" />
          </ToolbarButton>

          <span className="w-px bg-gray-300 mx-1 self-stretch" role="separator" />

          <ToolbarButton
            onClick={insertLink}
            isActive={editor.isActive("link")}
            label="Link beszúrása"
            title="Link"
          >
            <LinkIcon className="h-5 w-5" />
          </ToolbarButton>

          {editor.isActive("link") && (
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().extendMarkRange("link").unsetLink().run()
              }
              label="Link eltávolítása"
              title="Link eltávolítása"
            >
              <Unlink className="h-5 w-5" />
            </ToolbarButton>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
