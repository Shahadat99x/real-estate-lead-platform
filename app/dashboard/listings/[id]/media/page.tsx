import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '../../../../../lib/authz';
import { getListingForMedia } from '../../../../../lib/queries/dashboard';
import { ListingImagesManager } from '../../../../../components/dashboard/ListingImagesManager';
import { PublishButton } from '../../../../../components/dashboard/PublishButton';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';

export default async function ListingMediaPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser();
    const { id } = await params;
    const listing = await getListingForMedia(id);

    if (!listing) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Photos & Publish</h1>
                    <p className="text-sm text-slate-600">Step 2: Add images and finalize</p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <Button variant="ghost">Edit Details</Button>
                    </Link>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <div className="flex gap-2 mb-1">
                        <Badge>{listing.purpose}</Badge>
                        {/* Fixed: Badge variant removed, using className for styling */}
                        <Badge className={listing.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}>
                            {listing.status}
                        </Badge>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">{listing.title}</h2>
                    <p className="text-slate-600 text-sm">
                        {listing.city} · €{listing.price.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Image Manager */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Gallery</h3>
                <ListingImagesManager listingId={listing.id} initialImages={listing.listing_images} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Link href="/dashboard/listings">
                    <Button variant="ghost">Save as Draft</Button>
                </Link>

                {/* Fixed: Use Client Component for Action to handle prevState signature match */}
                <PublishButton listingId={listing.id} />
            </div>
        </div>
    );
}
