'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadForm } from "@/components/research/upload-form";
import { SearchSection } from "@/components/research/search-section";
import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="search">Search Papers</TabsTrigger>
          <TabsTrigger value="upload">Upload Paper</TabsTrigger>
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
