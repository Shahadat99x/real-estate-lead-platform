import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedListings } from '../../lib/queries/listings';
import { getLatestPublicPosts } from '../../lib/blog';
import { ListingCard } from '../../components/listings/ListingCard';
import { Button } from '../../components/ui/button';
import { Card, CardBody } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default async function HomePage() {
  const [featured, latestPosts] = await Promise.all([
    getFeaturedListings(),
    getLatestPublicPosts(3)
  ]) as [any[], any[]];
  const ctaHref = '/contact';

  return (
    <div className="bg-[#f6f8fb]">
      <Hero />
      <TrustStrip />

      {/* Featured Listings */}
      <section className="px-4 sm:px-6 lg:px-10 py-16 space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
            <p className="text-slate-600 mt-1">Explore our hand-picked properties.</p>
          </div>
          <Link href="/listings" className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group">
            View all
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing as any} />
          ))}
          {featured.length === 0 && <p className="text-sm text-slate-600">No featured listings yet.</p>}
        </div>
      </section>

      <AboutBrokerPreview />
      <HowItWorks />

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Latest from the Blog</h2>
                <p className="text-slate-600 mt-1">Market insights and real estate tips.</p>
              </div>
              <Link href="/blog" className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group">
                Read more
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow duration-200 overflow-hidden border-slate-200 flex flex-col">
                    {post.cover_image_url ? (
                      <div className="relative w-full h-48 bg-slate-100">
                        <Image
                          src={post.cover_image_url}
                          alt={post.title || 'Blog post'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                    <CardBody className="flex flex-col flex-1 p-5">
                      <div className="text-xs text-brand-600 font-semibold mb-2">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recent'}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                        {post.excerpt || 'Read the full article...'}
                      </p>
                      <span className="text-sm font-medium text-brand-600 group-hover:underline">Read article</span>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-10 py-20 bg-white">
        <div className="max-w-4xl mx-auto rounded-3xl bg-brand-700 text-white p-8 sm:p-12 text-center shadow-xl space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-bold">Ready to find your dream home?</h3>
            <p className="text-lg text-brand-100 max-w-2xl mx-auto">
              Whether you are buying, selling, or renting, we are here to guide you through every step of the journey.
            </p>
            <Button asChild variant="secondary" className="bg-white text-brand-700 border-none hover:bg-slate-50 text-base px-8 py-6 h-auto font-semibold">
              <Link href={ctaHref}>Contact Us Today</Link>
            </Button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-10 py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <Badge className="bg-brand-50 text-brand-700 border-brand-100 px-3 py-1 text-sm">
          #1 Local Real Estate Brokerage
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight text-balance">
          Find a place you'll love to live.
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto text-balance">
          Curated listings, exclusive market insights, and a personalized experience from your local property expert.
        </p>
        <div className="pt-4 max-w-xl mx-auto">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

function SearchBar() {
  return (
    <form action="/listings" className="grid gap-3 sm:grid-cols-4 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-2 border border-slate-100">
      <input
        className="w-full rounded-xl bg-slate-50 border-transparent px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
        placeholder="City or Zip"
        name="city"
      />
      <select
        name="purpose"
        className="w-full rounded-xl bg-slate-50 border-transparent px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
      >
        <option value="">Any Type</option>
        <option value="BUY">Buy</option>
        <option value="RENT">Rent</option>
      </select>
      <input
        className="w-full rounded-xl bg-slate-50 border-transparent px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
        placeholder="Max Price"
        name="maxPrice"
      />
      <Button type="submit" className="w-full h-full rounded-xl font-bold shadow-sm">
        Search
      </Button>
    </form>
  );
}

function TrustStrip() {
  const points = [
    { label: 'Verified Listings', icon: '✅' },
    { label: 'Local Expertise', icon: '📍' },
    { label: 'Transparent Process', icon: '🤝' },
    { label: 'Fast Response', icon: '⚡' },
  ];
  return (
    <div className="border-y border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap justify-center sm:justify-between gap-6 text-sm sm:text-base font-medium text-slate-600">
        {points.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">{p.icon}</span>
            <span>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutBrokerPreview() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 space-y-6">
          <Badge className="bg-brand-100 text-brand-800">Meet Your Broker</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Alex Morgan</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            With over a decade of experience in the local market, I help clients navigate the buying and selling process with confidence. My approach is built on transparency, integrity, and results.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Downtown', 'West End', 'North Shore'].map(area => (
              <Badge key={area} className="bg-slate-100 text-slate-700 border-slate-200 px-3 py-1">
                {area}
              </Badge>
            ))}
          </div>
          <div className="pt-4">
            <Button asChild size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:border-slate-400">
              <Link href="/about">Learn more about Alex</Link>
            </Button>
          </div>
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-slate-100 border-8 border-slate-50 shadow-2xl overflow-hidden">
            {/* Placeholder for broker image - replace with real image if available */}
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-6xl shadow-inner">
              👤
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: 'Browse Listings', desc: 'Explore our verified properties with detailed info and photos.', icon: '🔍' },
    { title: 'Send Inquiry', desc: 'Ask questions or request a viewing directly through the platform.', icon: '📩' },
    { title: 'Schedule Visit', desc: 'Meet for a tour and find the perfect home for your needs.', icon: '🗓️' },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 bg-[#f6f8fb]">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A simple, transparent process to get you into your new home faster.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center text-3xl mb-6 text-brand-600">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>

              {/* Connector line for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 -right-4 w-8 border-t-2 border-dashed border-slate-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
