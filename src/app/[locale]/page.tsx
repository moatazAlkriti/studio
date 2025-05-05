// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadForm } from "@/components/research/upload-form";
import { SearchSection } from "@/components/research/search-section";
import { PaperList } from "@/components/research/paper-list"; // Import the new component
import { FavoritesList } from "@/components/research/favorites-list"; // Import FavoritesList
import { LoginForm } from "@/components/auth/login-form";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation'; // Use navigation hook

export default function Home() {
  const t = useTranslations('HomePage');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname(); // Get current pathname
  const router = useRouter(); // Get router instance

  useEffect(() => {
    // Ensure this runs only on the client to avoid hydration mismatch
    setIsClient(true);
    // Check local storage for persistent login (basic example)
    const loggedInStatus = localStorage.getItem('isLoggedInResearchHub');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedInResearchHub', 'true');
    }
  };

   const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedInResearchHub');
      localStorage.removeItem('researchHubUsername');
      // Optional: Consider clearing favorites on logout?
      // localStorage.removeItem('researchHubFavorites');
    }
    window.location.reload(); // Force reload to clear state and show login
   };

  // Prevent rendering anything sensitive on the server or before hydration
  if (!isClient) {
    // Optional: Render a loading state or skeleton here
    return null;
  }

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6"> {/* Updated to grid-cols-4 */}
          <TabsTrigger value="search">{t('searchTab')}</TabsTrigger>
          <TabsTrigger value="view">{t('viewTab')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('favoritesTab')}</TabsTrigger> {/* New Favorites Tab Trigger */}
          <TabsTrigger value="upload">{t('uploadTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SearchSection />
        </TabsContent>
        <TabsContent value="view">
          <PaperList />
        </TabsContent>
        <TabsContent value="favorites"> {/* New Favorites Tab Content */}
          <FavoritesList />
        </TabsContent>
        <TabsContent value="upload">
          <UploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
