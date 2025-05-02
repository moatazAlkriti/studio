// src/components/layout/header.tsx
'use client'; // Required for using hooks like useState/useEffect

import { useState, useEffect } from 'react';
import { BookOpenText, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming Button component is available

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);
    // Basic check if the user is 'admin' based on localStorage from login
    // In a real app, this should be based on a proper auth state (context, token, etc.)
    const loggedInStatus = localStorage.getItem('isLoggedInResearchHub');
    const username = localStorage.getItem('researchHubUsername'); // Assuming username is stored on login
    if (loggedInStatus === 'true' && username === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // Don't render potentially sensitive links on the server or before hydration
  if (!isClient) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 items-center justify-between">
           <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
             <BookOpenText className="h-6 w-6 text-primary" />
             <span className="font-bold text-lg">Research Hub</span>
           </Link>
           {/* Placeholder while loading */}
           <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
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
          <span className="font-bold text-lg">Research Hub</span>
        </Link>

        {/* Navigation Items */}
        <nav>
          {isAdmin && (
            <Button asChild variant="ghost" className="transition-colors duration-200">
              <Link href="/admin" className="flex items-center">
                <ShieldCheck className="mr-1 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          {/* Add other navigation items here if needed, e.g., Logout */}
        </nav>
      </div>
    </header>
  );
}
