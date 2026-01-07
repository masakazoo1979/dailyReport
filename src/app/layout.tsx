import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
