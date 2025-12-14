import type { ReactNode } from 'react';
import Header from '../../components/site/Header';
import Footer from '../../components/site/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
