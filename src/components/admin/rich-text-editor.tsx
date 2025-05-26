"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline'; // Underline eklentisini import et
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle'; // Toggle kullanmak daha uygun olabilir
import {
  Bold,
  Italic,
  Underline as UnderlineIcon, // Rename icon import
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon, // İkon adını değiştirdik çakışmayı önlemek için
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';

// Tiptap için özel stiller (isteğe bağlı, Tailwind ile de yapılabilir)
const tiptapStyles = `
  .tiptap {
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--input));
    border-top: none; /* Toolbar ile birleşik görünmesi için */
    border-radius: 0 0 var(--radius) var(--radius);
    min-height: 300px; /* Minimum yükseklik */
    max-height: 800px; /* Maksimum yükseklik */
    overflow-y: auto;
    outline: none; /* Odaklandığında varsayılan çerçeveyi kaldır */
  }
  .tiptap:focus-within {
     border-color: hsl(var(--ring)); /* Odaklandığında çerçeve rengi */
     box-shadow: 0 0 0 1px hsl(var(--ring));
  }
  .tiptap p {
    margin-bottom: 1em;
  }
  .tiptap h1, .tiptap h2, .tiptap h3, .tiptap h4, .tiptap h5, .tiptap h6 {
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    font-weight: 600;
    line-height: 1.2;
  }
  .tiptap h1 { font-size: 2em; }
  .tiptap h2 { font-size: 1.5em; }
  .tiptap h3 { font-size: 1.25em; }
  .tiptap img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em 0;
    border-radius: 0.375rem;
  }
  .tiptap a {
    color: hsl(var(--primary));
    text-decoration: underline;
    cursor: pointer;
  }
  .tiptap ul, .tiptap ol {
    padding-left: 1.5rem;
    margin-bottom: 1em;
  }
  .tiptap li > p {
    margin-bottom: 0.25em; /* Liste elemanları içindeki paragrafların alt boşluğunu azalt */
  }
  .tiptap pre {
    background: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
    font-family: monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1em;
  }
  .tiptap pre code {
    color: inherit;
    padding: 0;
    background: none;
    font-size: 0.85em;
  }
  .tiptap blockquote {
    border-left: 3px solid hsl(var(--border));
    margin-left: 0;
    margin-right: 0;
    padding-left: 1rem;
    font-style: italic;
    color: hsl(var(--muted-foreground));
    margin-bottom: 1em;
  }
`;

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  toolbarId?: string; // Toolbar ID'si artık Tiptap tarafından yönetilmiyor, ama prop olarak kalabilir
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'İçerik girin...',
}) => {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Gerekirse StarterKit eklentilerini burada yapılandırın
        // Örneğin heading seviyelerini sınırlamak için:
        // heading: { levels: [1, 2, 3] },
        // codeBlock: false, // Code block istemiyorsanız
      }),
      Link.configure({
        openOnClick: false, // Bağlantıya tıklandığında otomatik açılmasın
        autolink: true,
      }),
      Image.configure({
        inline: false, // Resimlerin blok element olmasını sağla
        allowBase64: false, // Güvenlik için base64'ü devre dışı bırak (opsiyonel)
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'], // Hangi node tiplerinde hizalama olacağını belirtir
      }),
      Underline, // Underline eklentisini ekle
    ],
    content: value, // Başlangıç içeriği
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // İçerik değiştiğinde HTML'i dışarı aktar
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
  });

  useEffect(() => {
    setMounted(true);
    // Tiptap stillerini ekle
    const styleElement = document.createElement('style');
    styleElement.textContent = tiptapStyles;
    document.head.appendChild(styleElement);

    return () => {
      // Bileşen kaldırıldığında stili temizle
      document.head.removeChild(styleElement);
    };
  }, []);

  // Dışarıdan gelen value değiştiğinde editör içeriğini güncelle (dikkatli kullanılmalı)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Sadece içerik gerçekten farklıysa ve editör hazırsa güncelle
      // Bu, cursor pozisyonu kayıplarını önlemeye yardımcı olur
      editor.commands.setContent(value, false); // false: onUpdate tetiklenmesin
    }
  }, [value, editor]);

  // Resim yükleme fonksiyonu (Tiptap için güncellendi)
  const handleImageUpload = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Dosya yüklenirken bir hata oluştu');
        }

        const data = await response.json();

        // Tiptap editörüne resmi ekle
        editor.chain().focus().setImage({ src: data.url }).run();

      } catch (error: any) {
        console.error('Error uploading image:', error);
        alert(error.message || 'Resim yüklenirken bir hata oluştu');
      }
    };
  }, [editor]);

  // Link ekleme/düzenleme fonksiyonu
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL girin', previousUrl);

    // Kullanıcı iptal ettiyse
    if (url === null) {
      return;
    }

    // Kullanıcı URL'yi sildiyse
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // URL'yi ayarla
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);


  if (!mounted || !editor) {
    return <Skeleton className="h-80 w-full border rounded-md" />; // Yükseklik ayarlanabilir
  }

  return (
    <div className="tiptap-editor border rounded-md">
      {/* Tiptap Toolbar */}
      <div className="toolbar border-b bg-gray-50 p-2 flex flex-wrap gap-1 rounded-t-md">
        {/* Temel Formatlama */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Kalın"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="İtalik"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Altı Çizili"
        >
          <UnderlineIcon className="h-4 w-4" /> {/* Use renamed icon */}
        </Toggle>

        {/* Başlıklar */}
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Başlık 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Başlık 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        {/* Listeler */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Madde İşaretli Liste"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        {/* Link ve Resim */}
        <Button variant="outline" size="sm" onClick={setLink} disabled={!editor.can().setLink} aria-label="Link Ekle/Düzenle">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleImageUpload} aria-label="Resim Ekle">
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Hizalama */}
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          aria-label="Sola Hizala"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          aria-label="Ortala"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          aria-label="Sağa Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>

        {/* Kod Bloğu */}
         <Toggle
          size="sm"
          pressed={editor.isActive('codeBlock')}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Kod Bloğu"
        >
          <Code className="h-4 w-4" />
        </Toggle>

        {/* Geri Al / İleri Al */}
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} aria-label="Geri Al">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} aria-label="İleri Al">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Tiptap Editör Alanı */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};

export default RichTextEditor;
