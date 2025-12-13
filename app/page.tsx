import Link from 'next/link';
import { getFeaturedListings } from '../lib/queries/listings';
import { getTopAgents } from '../lib/queries/agents';
import { ListingCard } from '../components/listings/ListingCard';
import { AgentCard } from '../components/listings/AgentCard';
import { Button } from '../components/ui/button';
import { getCurrentProfile } from '../lib/authz';

export default async function HomePage() {
  const [featured, agents, profile] = await Promise.all([getFeaturedListings(), getTopAgents(), getCurrentProfile()]);
  const ctaHref = profile ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <section className="px-4 sm:px-6 lg:px-10 py-12 sm:py-16 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Find your next property.</h1>
          <p className="text-base sm:text-lg text-slate-600">
            Curated listings from top agents. Search, browse, and capture leads effortlessly.
          </p>
          <div className="grid gap-3 sm:grid-cols-4 bg-white shadow-lg rounded-xl p-3 border border-slate-100">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="City"
              name="city"
            />
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300">
              <option>Purpose</option>
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
            </select>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Max price"
              name="maxPrice"
            />
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 transition"
            >
              Search listings
            </Link>
          </div>
          <div>
            <Button asChild className="px-6 py-3 text-base">
              <Link href={ctaHref}>{profile ? 'Go to dashboard' : 'List your property'}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-12 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Featured listings</h2>
          <Link href="/listings" className="text-sm font-semibold text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing as any} />
          ))}
          {featured.length === 0 && <p className="text-sm text-slate-600">No featured listings yet.</p>}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Top agents</h2>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent as any} />
            ))}
            {agents.length === 0 && <p className="text-sm text-slate-600">No agents yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
