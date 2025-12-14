import Link from 'next/link';
import { getFeaturedListings } from '../../lib/queries/listings';
import { getTopAgents } from '../../lib/queries/agents';
import { ListingCard } from '../../components/listings/ListingCard';
import { AgentCard } from '../../components/listings/AgentCard';
import { Button } from '../../components/ui/button';

export default async function HomePage() {
  const [featured, agents] = await Promise.all([getFeaturedListings(), getTopAgents()]);
  const ctaHref = '/login';

  return (
    <div className="bg-[#f6f8fb]">
      <Hero />

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

      <StatsStrip />

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

      <section className="px-4 sm:px-6 lg:px-10 py-12">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white p-8 sm:p-10 shadow-lg space-y-4">
          <h3 className="text-2xl font-semibold">Ready to list your property?</h3>
          <p className="text-sm text-white/90">
            Join our platform to manage listings, capture leads, and collaborate with buyers and renters.
          </p>
          <Button asChild variant="secondary" className="bg-white text-brand-700 border-none hover:bg-slate-100">
            <Link href={ctaHref}>Get started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-12 sm:py-16 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Find your next property.</h1>
        <p className="text-base sm:text-lg text-slate-600">
          Curated listings from top agents. Search, browse, and capture leads effortlessly.
        </p>
        <SearchBar />
      </div>
    </section>
  );
}

function SearchBar() {
  return (
    <form action="/listings" className="grid gap-3 sm:grid-cols-4 bg-white shadow-lg rounded-xl p-3 border border-slate-100">
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        placeholder="City"
        name="city"
      />
      <select
        name="purpose"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
      >
        <option value="">Purpose</option>
        <option value="BUY">Buy</option>
        <option value="RENT">Rent</option>
      </select>
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        placeholder="Max price"
        name="maxPrice"
      />
      <Button type="submit" className="w-full">
        Search listings
      </Button>
    </form>
  );
}

function StatsStrip() {
  const stats = [
    { label: 'Listings', value: '250+' },
    { label: 'Agents', value: '50+' },
    { label: 'Avg response time', value: '<2h' },
  ];
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-6 bg-white border-t border-b border-slate-100">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
            <p className="text-2xl font-semibold text-brand-700">{stat.value}</p>
            <p className="text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
