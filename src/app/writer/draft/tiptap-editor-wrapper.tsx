"use client";

/**
 * Deprecated: legacy TipTap editor kept for /writer/draft only.
 * The primary /writer route embeds cmam-editor-shell.
 */

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Mathematics, BlockMath, InlineMath } from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Sigma,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logMMP } from "@/lib/mmp-logger";

export interface TiptapEditorHandle {
  insertContent: (html: string) => void;
  replaceSelection: (html: string) => void;
  getHTML: () => string;
}

interface TiptapEditorWrapperProps {
  initialContent: string;
  onWordCountUpdate?: (count: number) => void;
  onUpdate?: (html: string) => void;
  chapterId?: number;
}

const TiptapEditorWrapper = forwardRef<
  TiptapEditorHandle,
  TiptapEditorWrapperProps
>(function TiptapEditorWrapper(
  { initialContent, onWordCountUpdate, onUpdate, chapterId },
  ref
) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "开始编写论文... 支持 Markdown 快捷语法",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border max-w-full my-3",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-600 underline underline-offset-2",
        },
      }),
      Mathematics,
      BlockMath,
      InlineMath,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap-editor prose prose-sm max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const count = text.replace(/\s/g, "").length;
      onWordCountUpdate?.(count);
      onUpdate?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      editor.commands.setContent(initialContent);
      const text = editor.getText();
      const count = text.replace(/\s/g, "").length;
      onWordCountUpdate?.(count);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, initialContent]);

  // 暴露命令给父组件
  useImperativeHandle(
    ref,
    () => ({
      insertContent: (html: string) => {
        editor?.chain().focus().insertContent(html).run();
        logMMP({
          role: "writer",
          action: "edit",
          file: chapterId ? `chapter-${chapterId}` : undefined,
          description: "插入素材到论文",
        });
      },
      replaceSelection: (html: string) => {
        editor?.chain().focus().deleteSelection().insertContent(html).run();
        logMMP({
          role: "writer",
          action: "ai_chat",
          file: chapterId ? `chapter-${chapterId}` : undefined,
          description: "AI 润色替换段落",
        });
      },
      getHTML: () => editor?.getHTML() ?? "",
    }),
    [editor, chapterId]
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          初始化编辑器...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 min-h-full">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default TiptapEditorWrapper;

/* ============================================================ */
/*  工具栏                                                        */
/* ============================================================ */
function EditorToolbar({ editor }: { editor: Editor }) {
  const insertMath = () => {
    const formula = prompt("输入 LaTeX 公式（不含 $$）：", "E = mc^2");
    if (!formula) return;
    // 使用 @tiptap/extension-mathematics 提供的命令 → katex 真实渲染
    editor
      .chain()
      .focus()
      .insertBlockMath({ latex: formula })
      .run();
  };

  const insertLink = () => {
    const url = prompt("输入链接地址：", "https://");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = prompt(
      "输入图片 URL（或粘贴 Base64）：",
      "https://via.placeholder.com/400x240?text=Figure"
    );
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center flex-wrap gap-0.5 bg-white/95 backdrop-blur border-b border-border px-3 py-2">
      <Group>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="加粗 (⌘B)"
        >
          <BoldIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="斜体 (⌘I)"
        >
          <ItalicIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="下划线 (⌘U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="删除线"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>
      </Group>

      <Divider />

      <Group>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="一级标题"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="二级标题"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="三级标题"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>
      </Group>

      <Divider />

      <Group>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="代码块"
        >
          <Code2 className="w-3.5 h-3.5" />
        </ToolBtn>
      </Group>

      <Divider />

      <Group>
        <ToolBtn onClick={insertMath} title="插入公式">
          <Sigma className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={insertLink} title="插入链接">
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={insertImage} title="插入图片">
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().setHorizontalRule().run()
          }
          title="分隔线"
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
      </Group>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销 (⌘Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做 (⌘⇧Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-md transition-colors",
        active
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "text-muted-foreground hover:bg-muted",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}
