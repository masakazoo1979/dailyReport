/**
 * Test component to verify Tailwind CSS and shadcn/ui setup
 * This file can be deleted after verification
 */
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TestSetup() {
  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary">
        Tailwind CSS & shadcn/ui Setup Test
      </h1>

      {/* Card Component */}
      <Card>
        <CardHeader>
          <CardTitle>Card Component</CardTitle>
          <CardDescription>This is a test card from shadcn/ui</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you can see this card styled properly, the setup is working!
          </p>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex gap-4 flex-wrap">
        <Button variant="default">Default Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Input Component</label>
        <Input placeholder="Type something..." />
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className="status-draft">下書き</Badge>
        <Badge className="status-submitted">提出済み</Badge>
        <Badge className="status-approved">承認済み</Badge>
        <Badge className="status-rejected">差し戻し</Badge>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTitle>Setup Complete!</AlertTitle>
        <AlertDescription>
          Tailwind CSS and shadcn/ui are configured and working correctly.
        </AlertDescription>
      </Alert>
    </div>
  );
}
