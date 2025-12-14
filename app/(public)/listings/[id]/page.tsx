import { notFound } from 'next/navigation';
import { getListingById } from '../../../../lib/queries/listings';
import LeadForm from './LeadForm';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardBody } from '../../../../components/ui/card';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return notFound();

  const sortedImages = (listing.listing_images || []).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge>{listing.purpose}</Badge>
            <Badge>{listing.property_type}</Badge>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
          <p className="text-lg font-semibold text-slate-900">
            €{Intl.NumberFormat('en-US').format(listing.price)} · {listing.city}
          </p>
          <p className="text-sm text-slate-600">{listing.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sortedImages.map((img) => (
            <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
              <img src={img.url} alt={img.alt_text ?? listing.title} className="h-full w-full object-cover" />
            </div>
          ))}
          {sortedImages.length === 0 && (
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-50 to-brand-100" />
          )}
        </div>

        <Card>
          <CardBody className="space-y-3 text-sm text-slate-700">
            <div className="flex gap-4 flex-wrap">
              <span className="font-semibold text-slate-900">{listing.bedrooms ?? '—'} bd</span>
              <span className="font-semibold text-slate-900">{listing.bathrooms ?? '—'} ba</span>
              <span className="font-semibold text-slate-900">{listing.area_sqm ?? '—'} sqm</span>
            </div>
            <p>
              Agent:{' '}
              <span className="font-semibold text-slate-900">
                {listing.agents?.display_name ?? 'Agent'}
              </span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Request more info</h2>
              <p className="text-sm text-slate-600">We will reply quickly.</p>
            </div>
            <LeadForm listingId={listing.id} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
