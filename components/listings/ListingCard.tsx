import { SmartImage } from '../ui/smart-image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Card, CardBody } from '../ui/card';
import type { ListingsRow } from '../../types/db';

type Props = {
  listing: ListingsRow & {
    listing_images?: { id: string; url: string; sort_order: number; alt_text: string | null }[];
  };
};

export function ListingCard({ listing }: Props) {
  const image = listing.listing_images?.sort((a, b) => a.sort_order - b.sort_order)[0];
  const validId = typeof listing.id === 'string' && /^[0-9a-f-]{36}$/i.test(listing.id);
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-slate-100 relative">
        {image ? (
          <SmartImage
            src={image.url}
            alt={image.alt_text ?? listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-50 to-brand-100" />
        )}
      </div>
      <CardBody className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{listing.title}</h3>
          <Badge>{listing.purpose}</Badge>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{listing.city}</p>
        <p className="text-xl font-semibold text-slate-900">
          €{Intl.NumberFormat('en-US').format(listing.price)}
        </p>
        <div className="text-xs text-slate-500 flex gap-3">
          <span>{listing.bedrooms ?? 0} bd</span>
          <span>{listing.bathrooms ?? 0} ba</span>
          <span>{listing.area_sqm ?? '—'} sqm</span>
        </div>
        {validId ? (
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex text-sm font-semibold text-brand-700 hover:underline"
          >
            View details →
          </Link>
        ) : (
          <span className="inline-flex text-sm text-slate-400">View details unavailable</span>
        )}
      </CardBody>
    </Card>
  );
}
