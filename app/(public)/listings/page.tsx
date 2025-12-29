import { ListingCard } from '../../../components/listings/ListingCard';
import { FiltersBar } from '../../../components/listings/FiltersBar';
import { getListings } from '../../../lib/queries/listings';

const propertyTypes = ['APARTMENT', 'HOUSE', 'STUDIO', 'TOWNHOUSE', 'VILLA', 'LAND'];

export default async function ListingsPage(props: {
  searchParams: Promise<{
    city?: string;
    purpose?: 'BUY' | 'RENT';
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    property_type?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const filters = {
    city: searchParams?.city,
    purpose: searchParams?.purpose,
    minPrice: searchParams?.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined,
    beds: searchParams?.beds ? Number(searchParams.beds) : undefined,
    baths: searchParams?.baths ? Number(searchParams.baths) : undefined,
    property_type: searchParams?.property_type,
  };

  const listings = await getListings(filters) as any[];

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 sm:px-6 lg:px-10 py-10 space-y-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Browse listings</h1>
          <p className="text-sm text-slate-600">Filter by city, price, beds, baths, and property type.</p>
        </div>
        <FiltersBar propertyTypes={propertyTypes} />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {listings.length === 0 && (
          <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            No listings match these filters yet.
          </p>
        )}
      </div>
    </div>
  );
}
