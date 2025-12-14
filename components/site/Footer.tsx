import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-2">
          <p className="text-lg font-bold text-brand-700">RealEstate</p>
          <p className="text-sm text-slate-600">Modern platform for listings and lead capture.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Links</p>
          <div className="flex flex-col gap-1 text-sm text-slate-600">
            <Link href="/listings" className="hover:text-brand-700">Listings</Link>
            <Link href="/agents" className="hover:text-brand-700">Agents</Link>
            <Link href="/blog" className="hover:text-brand-700">Blog</Link>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Contact</p>
          <p className="text-sm text-slate-600">hello@example.com</p>
          <p className="text-sm text-slate-600">+1 (555) 123-4567</p>
        </div>
      </div>
    </footer>
  );
}
