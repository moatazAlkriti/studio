'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadForm } from "@/components/research/upload-form";
import { SearchSection } from "@/components/research/search-section";
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
    }
    // Optional: Redirect to login or refresh the page if needed
    // router.push(pathname); // Refresh current page to show login
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
      {/* Add Logout button */}
       {/* <Button onClick={handleLogout} variant="outline" className="mb-4 float-right">
         {t('logoutButton')} // Assuming you add 'logoutButton' to your translations
       </Button> */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="search">{t('searchTab')}</TabsTrigger>
          <TabsTrigger value="upload">{t('uploadTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SearchSection />
        </TabsContent>
        <TabsContent value="upload">
          <UploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
