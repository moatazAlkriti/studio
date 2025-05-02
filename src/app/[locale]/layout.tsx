import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import '../globals.css'; // Use relative path for globals.css
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Research Hub',
  description: 'Centralized platform for research papers',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
              {children}
            </main>
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
