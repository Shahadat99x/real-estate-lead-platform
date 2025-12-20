import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Card, CardBody } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export const metadata: Metadata = {
    title: 'About | RealEstate',
    description: 'Meet your local real estate expert dedicated to finding your perfect property.',
};

const SERVICES = [
    'Residential Sales',
    'Property Management',
    'Commercial Leasing',
    'Market Valuations',
];

const AREAS = ['Downtown', 'West End', 'North Shore', 'Suburbs'];
const LANGUAGES = ['English', 'Spanish', 'French'];

const TESTIMONIALS = [
    {
        text: "Found our dream home in record time. Professional and attentive throughout the entire process.",
        author: "Sarah & Mike T.",
    },
    {
        text: "The best experience I've had with a broker. Incredibly knowledgeable about the local market.",
        author: "David R.",
    },
];

export default function AboutPage() {
    return (
        <div className="bg-[#f6f8fb] min-h-screen">
            {/* Hero Section */}
            <section className="bg-white border-b border-slate-200 px-4 py-12 sm:py-20 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900">About Your Broker</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Dedicated to connecting people with properties. Experienced, trustworthy, and always on your side.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (2 cols) */}
                <div className="space-y-10 lg:col-span-2">

                    {/* Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Services</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {SERVICES.map((service) => (
                                <div key={service} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-brand-500" />
                                    <span className="font-medium text-slate-700">{service}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Client Stories</h2>
                        <div className="grid gap-6">
                            {TESTIMONIALS.map((t, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm italic text-slate-600 relative">
                                    <span className="text-4xl text-brand-200 absolute top-2 left-4">"</span>
                                    <p className="mb-4 relative z-10 pl-2">{t.text}</p>
                                    <p className="not-italic font-semibold text-slate-900 text-right">— {t.author}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Bottom CTA */}
                    <section className="bg-brand-700 rounded-2xl p-8 sm:p-10 text-center text-white space-y-6">
                        <h2 className="text-2xl font-bold">Ready to make a move?</h2>
                        <p className="text-brand-100 max-w-lg mx-auto">
                            Whether you are buying, selling, or just looking, I am here to help you every step of the way.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild variant="secondary" className="bg-white text-brand-700 hover:bg-slate-100 border-none">
                                <Link href="/contact">Contact Me</Link>
                            </Button>
                            <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
                                <Link href="/listings">View Listings</Link>
                            </Button>
                        </div>
                    </section>
                </div>

                {/* Sidebar Profile (1 col) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card>
                            <CardBody className="space-y-6 text-center">
                                {/* Avatar Placeholder */}
                                <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center text-3xl overflow-hidden">
                                    <span className="text-slate-400">📷</span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Alex Morgan</h3>
                                    <p className="text-sm text-brand-600 font-medium">Licensed Senior Broker</p>
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed text-left">
                                    With over 10 years of experience in the local market, I specialize in luxury residential properties and investment portfolios. My goal is to provide a seamless and transparent experience for every client.
                                </p>

                                <div className="text-left space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Areas Served</p>
                                        <div className="flex flex-wrap gap-2">
                                            {AREAS.map(area => <Badge key={area}>{area}</Badge>)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Languages</p>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map(lang => <Badge key={lang} className="bg-slate-100 text-slate-700 border-slate-200">{lang}</Badge>)}
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full" asChild>
                                    <Link href="/contact">Get in touch</Link>
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
