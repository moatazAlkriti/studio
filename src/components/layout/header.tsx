'use client';

import { useState, useEffect } from 'react';
import { BookOpenText, ShieldCheck, Globe, LogOut, Info } from 'lucide-react'; // Added Info icon
import { Link, usePathname, useRouter } from '@/navigation'; // Use navigation hook
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '@/navigation'; // Import locales
import { ThemeToggleButton } from '@/components/theme-toggle-button'; // Import ThemeToggleButton

export function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add login state
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);
    const loggedInStatus = localStorage.getItem('isLoggedInResearchHub');
    const username = localStorage.getItem('researchHubUsername');
    if (loggedInStatus === 'true') {
        setIsLoggedIn(true); // Set login status
        if (username === 'admin') {
          setIsAdmin(true);
        }
    } else {
        setIsLoggedIn(false); // Ensure logged out state
        setIsAdmin(false);
    }
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedInResearchHub');
      localStorage.removeItem('researchHubUsername');
    }
    // Refresh or redirect to ensure state is cleared
    // router.push('/', { locale }); // Redirect to home page after logout
    window.location.href = `/${locale}`; // Force full page reload to root
  };

  // Don't render potentially sensitive links on the server or before hydration
  if (!isClient) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 items-center justify-between">
           <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
             <BookOpenText className="h-6 w-6 text-primary" />
             <span className="font-bold text-lg">{t('brandName')}</span>
           </Link>
           {/* Placeholder while loading */}
           <div className="h-8 w-32 bg-muted rounded animate-pulse"></div> {/* Adjusted width */}
         </div>
       </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo/Brand Link */}
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{t('brandName')}</span>
        </Link>

        {/* Navigation Items & Actions */}
        <nav className="flex items-center space-x-2">
          {isLoggedIn && isAdmin && ( // Show only if logged in as admin
            <Button asChild variant="ghost" size="sm" className="transition-colors duration-200 hidden sm:inline-flex">
              <Link href="/admin" className="flex items-center">
                <ShieldCheck className="mr-1 h-4 w-4" />
                {t('adminLink')}
              </Link>
            </Button>
          )}

          {/* About Us Link */}
           <Button asChild variant="ghost" size="sm" className="transition-colors duration-200">
             <Link href="/about" className="flex items-center">
               <Info className="mr-1 h-4 w-4" />
               {t('aboutUsLink')}
             </Link>
           </Button>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('language')}>
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((loc) => (
                <DropdownMenuItem key={loc} onClick={() => handleLanguageChange(loc)} disabled={locale === loc}>
                  {loc === 'en' ? t('english') : t('arabic')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <ThemeToggleButton />

           {/* Logout Button */}
           {isLoggedIn && ( // Show only if logged in
              <Button onClick={handleLogout} variant="ghost" size="icon" aria-label={t('logout')} className="text-destructive hover:bg-destructive/10">
                 <LogOut className="h-5 w-5"/>
              </Button>
           )}
        </nav>
      </div>
    </header>
  );
}
