'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRef } from 'react';
import { Button } from '../../../../../components/ui/button';
import type { BlogPostRow } from '../../../../../types/db';
import { CoverImageUploader } from './CoverImageUploader';
import dynamic from 'next/dynamic';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type FormState = { error?: string; message?: string };
type FormAction = (state: FormState, formData: FormData) => Promise<FormState | void>;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function SubmitButton({ label, name, value }: { label: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} name={name} value={value}>
      {pending ? 'Saving...' : label}
    </Button>
  );
}

export function PostForm({ action, initialData, submitLabel = 'Save post' }: { action: FormAction; initialData?: Partial<BlogPostRow>; submitLabel?: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { error: '', message: '' });
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(initialData?.slug));
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_image_url ?? '');
  const [content, setContent] = useState(initialData?.content_md ?? '');
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const textarea = container.querySelector('textarea');
    if (!textarea) return;

    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
    turndown.use(gfm);

    const cleanHtml = (html: string) => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.querySelectorAll('script, style, meta, link, title').forEach((el) => el.remove());
        return doc.body.innerHTML;
      } catch {
        return html;
      }
    };

    const normalizeMarkdown = (md: string) =>
      md.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();

    const onPaste = (event: ClipboardEvent) => {
      const html = event.clipboardData?.getData('text/html');
      if (!html) return;

      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      const before = content.slice(0, start);
      const after = content.slice(end);

      const markdown = normalizeMarkdown(turndown.turndown(cleanHtml(html)));
      const next = `${before}${markdown}${after}`;
      setContent(next);

      // Restore caret after React state update
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + markdown.length;
      });
    };

    textarea.addEventListener('paste', onPaste);
    return () => textarea.removeEventListener('paste', onPaste);
  }, [content]);

  return (
    <form action={formAction} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Announcing our latest market report"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
            <span>Slug</span>
            <button
              type="button"
              onClick={() => {
                setSlug(slugify(title));
                setSlugEdited(false);
              }}
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              Auto from title
            </button>
          </label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <p className="text-xs text-slate-500">Used in the public URL. Only letters, numbers, and dashes.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={initialData?.excerpt ?? ''}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Short preview shown on the blog list."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Cover image</label>
        <CoverImageUploader value={coverUrl} onChange={setCoverUrl} />
        <input type="hidden" name="cover_image_url" value={coverUrl || ''} />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Or paste an image URL</label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://images.example.com/cover.jpg"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <p className="text-xs text-slate-500">Shown on the blog listing and social previews.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Content (Markdown)</label>
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white" ref={editorContainerRef}>
          <MDEditor value={content} onChange={(val) => setContent(val || '')} height={400} preview="edit" />
        </div>
        <input type="hidden" name="content_md" value={content} />
        <p className="text-xs text-slate-500">Supports Markdown; content is sanitized on render for the public blog.</p>
      </div>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      {state?.message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{state.message}</div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <SubmitButton label={submitLabel} name="intent" value="draft" />
        <SubmitButton label="Create & Publish" name="intent" value="publish" />
      </div>
    </form>
  );
}
