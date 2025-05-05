

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
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Placeholder type for notifications
// Export the type so other components can use it
export interface Notification {
    id: string;
    message: string;
    timestamp: string; // ISO string
    read: boolean;
    recipient: 'admin' | 'all' | string; // 'admin', 'all', or specific user ID
}

export function Header() {
  const t = useTranslations('Header');
  const tNotify = useTranslations('Notifications'); // Translations for notifications
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast(); // Use toast for potential errors

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add login state
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]); // State for notifications
  const [hasUnread, setHasUnread] = useState(false); // State for unread indicator

  // Function to load and filter notifications
  const loadNotifications = () => {
    if (typeof window !== 'undefined') {
      const storedNotificationsJSON = localStorage.getItem('researchHubNotifications');
      let allNotifications: Notification[] = [];
       if (storedNotificationsJSON) {
            try {
                const parsed = JSON.parse(storedNotificationsJSON);
                if (Array.isArray(parsed)) {
                    allNotifications = parsed;
                } else {
                    console.warn('Invalid notification data in localStorage during load, resetting.');
                }
            } catch (parseError) {
                console.error('Error parsing notifications from localStorage during load, resetting.', parseError);
            }
        }

      const username = localStorage.getItem('researchHubUsername');
      const isAdminUser = username === 'admin';

      // Filter notifications based on recipient
      const userNotifications = allNotifications.filter(n =>
          n.recipient === 'all' || // Show 'all' notifications to everyone
          (isAdminUser && n.recipient === 'admin') // Show 'admin' notifications only to admin
          // Add logic here if you have user-specific notifications based on username/ID
          // || n.recipient === username
      );

      setNotifications(userNotifications);
      setHasUnread(userNotifications.some(n => !n.read));
    }
  };

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

    loadNotifications(); // Load notifications on initial mount

    // --- Add Event Listener for Real-time Updates ---
    const handleNewNotification = () => {
      // Wrap in setTimeout to defer the state update slightly,
      // potentially avoiding updates during another component's render.
      setTimeout(() => {
        loadNotifications();
      }, 0);
    };

    window.addEventListener('new-notification', handleNewNotification);

    // Cleanup: remove event listener on component unmount
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
    // --- End Event Listener ---

  }, []); // Run only on mount

  // Refresh notifications when the dropdown is opened (keep this as a fallback)
  const handleDropdownOpenChange = (open: boolean) => {
      if (open) {
          loadNotifications();
      }
  }

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedInResearchHub');
      localStorage.removeItem('researchHubUsername');
      // Optionally clear notifications on logout if they are sensitive
      // localStorage.removeItem('researchHubNotifications');
    }
    // Refresh or redirect to ensure state is cleared
    // router.push('/', { locale }); // Redirect to home page after logout
    window.location.href = `/${locale}`; // Force full page reload to root
  };

  const handleMarkAsRead = (notificationId: string) => {
    // Update the state locally first for immediate feedback
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    // Recalculate unread status based on the potentially modified notifications array
    setHasUnread(notifications.some(n => n.id !== notificationId && !n.read));


    // Update the full list in localStorage
     if (typeof window !== 'undefined') {
       try {
           const storedNotificationsJSON = localStorage.getItem('researchHubNotifications');
           const allNotifications: Notification[] = storedNotificationsJSON ? JSON.parse(storedNotificationsJSON) : [];
           const updatedAllNotifications = allNotifications.map(n =>
               n.id === notificationId ? { ...n, read: true } : n
           );
           localStorage.setItem('researchHubNotifications', JSON.stringify(updatedAllNotifications));
           // After updating localStorage, re-check unread status from the source of truth
           setHasUnread(updatedAllNotifications.filter(n => n.recipient === 'all' || (isAdmin && n.recipient === 'admin')).some(n => !n.read));
       } catch (error) {
           console.error("Error updating notification read status in localStorage:", error);
           // Wrap toast in setTimeout
           setTimeout(() => {
               toast({
                   variant: "destructive",
                   title: tNotify('errorTitle'),
                   description: tNotify('errorMarkRead'),
               })
           }, 0);
           // Revert state change on error? Or maybe just reload?
           loadNotifications();
       }
     }
  };

  // Simple time ago formatter (replace with a library like date-fns for more robust formatting)
  const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return tNotify('justNow');
    if (diffInMinutes < 60) return tNotify('minutesAgo', { count: diffInMinutes });
    if (diffInHours < 24) return tNotify('hoursAgo', { count: diffInHours });
    return tNotify('daysAgo', { count: diffInDays });
  };


  // Don't render potentially sensitive links on the server or before hydration
  if (!isClient) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 items-center justify-between">
           <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80"> {/* Added hover opacity */}
             <BookOpenText className="h-6 w-6 text-primary" />
             <span className="font-bold text-lg">{t('brandName')}</span>
           </Link>
           {/* Placeholder while loading */}
           <div className="flex items-center space-x-2">
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
             {/* Add skeleton for notification bell */}
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
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80"> {/* Added hover opacity */}
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{t('brandName')}</span>
        </Link>

        {/* Navigation Items & Actions */}
        <nav className="flex items-center space-x-1 sm:space-x-2"> {/* Adjusted spacing */}
          {isLoggedIn && isAdmin && ( // Show only if logged in as admin
            <Button asChild variant="ghost" size="sm" className="transition-colors duration-200 hidden sm:inline-flex">
                <Link href="/admin">
                    <ShieldCheck className="mr-1 h-4 w-4" />
                    {t('adminLink')}
                </Link>
            </Button>
          )}

          {/* About Us Link */}
           <Button asChild variant="ghost" size="sm" className="transition-colors duration-200">
             <Link href="/about">
               <Info className="mr-1 h-4 w-4" />
               {t('aboutUsLink')}
             </Link>
           </Button>

           {/* Notification Dropdown - Only show if logged in */}
           {isLoggedIn && (
              <DropdownMenu onOpenChange={handleDropdownOpenChange}> {/* Refresh on open */}
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={tNotify('notifications')} className="relative transition-colors duration-200"> {/* Added transition */}
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" aria-label={tNotify('unreadIndicatorLabel')}/>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto"> {/* Increased width and added scroll */}
                  <DropdownMenuLabel>{tNotify('notifications')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort by most recent first
                        .map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onSelect={(e) => {
                            e.preventDefault(); // Prevent closing menu immediately
                            if (!notification.read) {
                                handleMarkAsRead(notification.id);
                            }
                            // Optionally navigate somewhere on click?
                            // e.g., if notification relates to a specific paper
                         }}
                         className={`flex items-start justify-between gap-2 cursor-pointer transition-colors duration-150 ${!notification.read ? 'font-semibold bg-secondary/50 dark:bg-secondary/20' : 'text-muted-foreground'}`} // Highlight unread, adjust style, added transition
                         style={{ whiteSpace: 'normal', minHeight: '2.5rem' }} // Allow text wrapping
                      >
                          {!notification.read && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
                           <span className={`flex-1 text-sm leading-tight ${!notification.read ? 'pl-3' : 'pl-0'}`}>{notification.message}</span>
                           <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{timeAgo(notification.timestamp)}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="text-center text-muted-foreground italic py-4">
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
              <Button variant="ghost" size="icon" aria-label={t('language')} className="transition-colors duration-200"> {/* Added transition */}
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
              <Button onClick={handleLogout} variant="ghost" size="icon" aria-label={t('logout')} className="text-destructive hover:bg-destructive/10 transition-colors duration-200"> {/* Added transition */}
                 <LogOut className="h-5 w-5"/>
              </Button>
           )}
        </nav>
      </div>
    </header>
  );
}

// Add needed translations to JSON files:
// en.json -> Notifications:
//   "justNow": "just now",
//   "minutesAgo": "{count, plural, =1 {# minute ago} other {# minutes ago}}",
//   "hoursAgo": "{count, plural, =1 {# hour ago} other {# hours ago}}",
//   "daysAgo": "{count, plural, =1 {# day ago} other {# days ago}}",
//   "unreadIndicatorLabel": "Unread notifications",
//   "errorTitle": "Notification Error",
//   "errorMarkRead": "Could not update notification status."
// ar.json -> Notifications:
//   "justNow": "الآن",
//   "minutesAgo": "{count, plural, =1 {منذ دقيقة واحدة} =2 {منذ دقيقتين} few {منذ {count} دقائق} many {منذ {count} دقيقة} other {منذ {count} دقيقة}}",
//   "hoursAgo": "{count, plural, =1 {منذ ساعة واحدة} =2 {منذ ساعتين} few {منذ {count} ساعات} many {منذ {count} ساعة} other {منذ {count} ساعة}}",
//   "daysAgo": "{count, plural, =1 {منذ يوم واحد} =2 {منذ يومين} few {منذ {count} أيام} many {منذ {count} يومًا} other {منذ {count} يوم}}",
//   "unreadIndicatorLabel": "إشعارات غير مقروءة",
//   "errorTitle": "خطأ في الإشعار",
//   "errorMarkRead": "تعذر تحديث حالة الإشعار."



