import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン - 営業日報システム',
  description: '営業日報システムへログインします',
};

/**
 * Auth Layout
 *
 * Simple centered layout for authentication pages (login)
 * Based on doc/screen-specification.md S-001 Login Screen
 *
 * Layout characteristics:
 * - Centered content
 * - Clean, minimal design
 * - No navigation (user not authenticated)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* System branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4">
            <span className="text-2xl font-bold">日報</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            営業日報システム
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sales Daily Report Management System
          </p>
        </div>

        {/* Auth content (login form, etc.) */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-lg">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2024 営業日報システム. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
