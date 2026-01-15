'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="md:pl-64">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
