import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toast';
import { SkipLink } from '@/components/layout/SkipLink';
import './globals.css';

export const metadata: Metadata = {
  title: '営業日報システム',
  description: 'Sales Daily Report Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <SkipLink />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
