'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../../../components/ui/button';

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

export function CoverImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value || null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const signRes = await fetch('/api/cloudinary/sign-blog', { method: 'POST' });
      if (!signRes.ok) throw new Error('Failed to get upload signature');
      const { apiKey, timestamp, signature, cloudName, folder } = await signRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const data = await uploadRes.json();
      onChange(data.secure_url || null);
      setPreview(data.secure_url || null);
      setUploadProgress(100);
    } catch (error) {
      console.error('Cover upload error', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 300);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500">JPG, PNG up to 10MB</p>
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {preview && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200">
          <img src={preview} alt="Cover" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Replace
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setPreview(null);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
