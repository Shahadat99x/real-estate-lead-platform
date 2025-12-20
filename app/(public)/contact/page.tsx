import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | RealEstate',
    description: 'Get in touch with our team for inquiries about listings, lead generation, or platform features.',
};

export default function ContactPage() {
    return (
        <div className="bg-[#f6f8fb]">
            <section className="px-4 sm:px-6 lg:px-10 py-12 sm:py-24 max-w-3xl mx-auto space-y-8 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900">Contact</h1>
                    <p className="text-lg text-slate-600">
                        Send an inquiry and we’ll respond quickly.
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-xl mx-auto space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                            Email
                        </h2>
                        <a
                            href="mailto:contact@yourdomain.com"
                            className="text-2xl font-bold text-brand-700 hover:text-brand-800 break-all"
                        >
                            contact@yourdomain.com
                        </a>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                Whatsapp
                            </h3>
                            <p className="text-lg font-medium text-slate-700">+1 (555) 123-4567</p>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                Office Hours
                            </h3>
                            <p className="text-lg font-medium text-slate-700">Mon-Fri, 9am - 6pm</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
