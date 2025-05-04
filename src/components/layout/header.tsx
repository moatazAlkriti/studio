
'use client';

import { useState, useEffect } from 'react';
import { BookOpenText, ShieldCheck, Globe, LogOut, Info, Bell } from 'lucide-react'; // Added Bell icon
import { Link, usePathname, useRouter } from '@/navigation'; // Use navigation hook
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '@/navigation'; // Import locales
import { ThemeToggleButton } from '@/components/theme-toggle-button'; // Import ThemeToggleButton

// Placeholder type for notifications
interface Notification {
    id: string;
    message: string;
    timestamp: string; // ISO string
    read: boolean;
}

export function Header() {
  const t = useTranslations('Header');
  const tNotify = useTranslations('Notifications'); // Translations for notifications
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add login state
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]); // State for notifications
  const [hasUnread, setHasUnread] = useState(false); // State for unread indicator

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

    // Placeholder: Fetch or load notifications (e.g., from localStorage or API)
    const dummyNotifications: Notification[] = [
      // Example notifications (replace with real data source)
      // { id: '1', message: 'New paper "AI Ethics" uploaded.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false }, // 1 hour ago
      // { id: '2', message: 'User "jane.doe" was added.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true }, // 1 day ago
    ];
    setNotifications(dummyNotifications);
    setHasUnread(dummyNotifications.some(n => !n.read));

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

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    // Check if any unread notifications remain after marking one as read
    const remainingUnread = notifications.some(n => n.id !== notificationId && !n.read);
    setHasUnread(remainingUnread);
    // TODO: Persist read status (e.g., update API or localStorage)
  };

  // Simple time ago formatter (replace with a library like date-fns for more robust formatting)
  const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
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
           <div className="flex items-center space-x-2">
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
           </div>
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
        <nav className="flex items-center space-x-1 sm:space-x-2"> {/* Adjusted spacing */}
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

           {/* Notification Dropdown - Only show if logged in */}
           {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={tNotify('notifications')} className="relative">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80"> {/* Increased width */}
                  <DropdownMenuLabel>{tNotify('notifications')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onSelect={(e) => {
                            e.preventDefault(); // Prevent closing menu immediately
                            if (!notification.read) {
                                handleMarkAsRead(notification.id);
                            }
                         }}
                         className={`flex items-start justify-between gap-2 ${!notification.read ? 'font-semibold' : 'text-muted-foreground'}`}
                      >
                        <span className="flex-1 text-sm leading-tight">{notification.message}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(notification.timestamp)}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="text-center text-muted-foreground">
                      {tNotify('noNotifications')}
                    </DropdownMenuItem>
                  )}
                  {/* Add 'View All' or 'Mark All Read' actions if needed */}
                </DropdownMenuContent>
              </DropdownMenu>
           )}


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
