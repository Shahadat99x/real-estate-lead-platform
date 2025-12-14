'use client';

import { useState, useRef, useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { addListingImageAction, deleteListingImageAction, reorderListingImagesAction } from '../../lib/actions/listing-images';

type Image = {
    id: string;
    url: string;
    sort_order: number;
};

export function ListingImagesManager({
    listingId,
    initialImages
}: {
    listingId: string;
    initialImages: Image[]
}) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [optimisticImages, addOptimisticImage] = useOptimistic(
        initialImages,
        (state, newImage: Image) => [...state, newImage].sort((a, b) => a.sort_order - b.sort_order)
    );
    const [isPending, startTransition] = useTransition();

    async function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // 1. Get Signature
            const signRes = await fetch('/api/cloudinary/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId }),
            });

            if (!signRes.ok) throw new Error('Failed to get upload signature');
            const { apiKey, timestamp, signature, cloudName, folder } = await signRes.json();

            // 2. Upload each file
            const totalFiles = files.length;
            let completed = 0;

            for (let i = 0; i < totalFiles; i++) {
                const file = files[i];
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
                    console.error('Upload failed for', file.name);
                    continue;
                }

                const data = await uploadRes.json();

                // 3. Save to Supabase
                const actionFormData = new FormData();
                actionFormData.append('listingId', listingId);
                actionFormData.append('url', data.secure_url);
                actionFormData.append('publicId', data.public_id);
                actionFormData.append('altText', file.name.split('.')[0]);

                await addListingImageAction(null, actionFormData);

                completed++;
                setUploadProgress(Math.round((completed / totalFiles) * 100));
            }

            router.refresh();

        } catch (error) {
            console.error('Upload process failed:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <div className="space-y-6">
            <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max 10MB)</p>
                </div>
            </div>

            {isUploading && (
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-brand-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {optimisticImages.map((image, index) => (
                    <div key={image.id} className="relative aspect-square group bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={image.url} alt="Listing" className="w-full h-full object-cover" />

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={async () => {
                                    if (index > 0) {
                                        // Move Left
                                        const newOrder = [...optimisticImages];
                                        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                        // Simple optimistic update not fully implemented here for brevity, simpler to just trigger server action
                                        await reorderListingImagesAction(listingId, newOrder.map(i => i.id));
                                    }
                                }}
                                disabled={index === 0}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30"
                                title="Move Left"
                            >
                                ←
                            </button>
                            <button
                                onClick={async () => {
                                    // Delete
                                    const formData = new FormData();
                                    formData.append('imageId', image.id);
                                    formData.append('listingId', listingId);
                                    startTransition(() => {
                                        deleteListingImageAction(null, formData);
                                    });
                                }}
                                className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                                title="Delete"
                            >
                                ×
                            </button>
                            <button
                                onClick={async () => {
                                    if (index < optimisticImages.length - 1) {
                                        // Move Right
                                        const newOrder = [...optimisticImages];
                                        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
                                        await reorderListingImagesAction(listingId, newOrder.map(i => i.id));
                                    }
                                }}
                                disabled={index === optimisticImages.length - 1}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30"
                                title="Move Right"
                            >
                                →
                            </button>
                        </div>
                        {index === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-medium rounded-full shadow-sm">
                                Cover
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
