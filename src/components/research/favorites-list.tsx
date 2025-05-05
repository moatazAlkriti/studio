// @ts-nocheck
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Heart, Download, Eye } from "lucide-react" // Using Heart for Favorites section icon, added Eye
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import type { StoredPaper } from "./paper-list"; // Import shared type

// Fallback dummy data (only used if localStorage is empty/invalid)
const initialDummyPapers: StoredPaper[] = [
  { id: 'dummy-1', title: "Example Paper One", authors: "Author A, Author B", subject: "AI", department: "Computer Science", uploadDate: "2023-01-15T10:00:00Z", abstract: "This is a sample abstract for an example paper stored locally...", fileName: "example1.pdf", fileType: "application/pdf", fileSize: 1024*500, fileDataUrl: "" },
  { id: 'dummy-2', title: "Another Example Paper", authors: "Author C", subject: "Genetics", department: "Biology", uploadDate: "2022-11-20T14:30:00Z", abstract: "Abstract for the second example paper...", fileName: "example2.pdf", fileType: "application/pdf", fileSize: 1024*800, fileDataUrl: "" },
];


type Paper = StoredPaper;

export function FavoritesList() {
  const t = useTranslations('FavoritesList');
  const tPaperList = useTranslations('PaperList'); // For shared translations
  const { toast } = useToast();
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [favoritePapers, setFavoritePapers] = useState<Paper[]>([]);
  const [favoritePaperIds, setFavoritePaperIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsLoading(true);
    try {
      // Load all papers
      const storedPapersJSON = localStorage.getItem('researchHubPapers');
      let loadedPapers: Paper[] = [];
      if (storedPapersJSON) {
        const parsedPapers = JSON.parse(storedPapersJSON);
        if (Array.isArray(parsedPapers)) {
          loadedPapers = parsedPapers;
          setAllPapers(loadedPapers);
        } else {
          setAllPapers(initialDummyPapers); // Use dummy on invalid format
        }
      } else {
        setAllPapers(initialDummyPapers); // Use dummy if no papers exist
      }

      // Load favorite IDs
      const storedFavoritesJSON = localStorage.getItem('researchHubFavorites');
      let favIds = new Set<string>();
      if (storedFavoritesJSON) {
        const parsedFavorites = JSON.parse(storedFavoritesJSON);
        if (Array.isArray(parsedFavorites)) {
          favIds = new Set(parsedFavorites);
          setFavoritePaperIds(favIds);
        } else {
          setFavoritePaperIds(new Set());
        }
      } else {
        setFavoritePaperIds(new Set());
      }

      // Filter papers to get favorites
      setFavoritePapers(loadedPapers.filter(p => favIds.has(p.id)));

    } catch (error) {
      console.error("Error reading or parsing localStorage for favorites:", error);
      setAllPapers(initialDummyPapers); // Fallback on error
      setFavoritePapers([]);
      setFavoritePaperIds(new Set());
      // Wrap toast call in setTimeout
      setTimeout(() => {
          toast({
              variant: "destructive",
              title: tPaperList('localStorageErrorTitle'),
              description: "Could not load favorites."
          })
      }, 0);
    } finally {
      setIsLoading(false);
    }
    // Removed `toast` and `tPaperList` from dependencies as they are stable
  }, []);

  // Update favorites in localStorage when favoritePaperIds change
  useEffect(() => {
      if (isClient && !isLoading) {
          try {
              localStorage.setItem('researchHubFavorites', JSON.stringify(Array.from(favoritePaperIds)));
              // Re-filter the displayed papers when IDs change
              setFavoritePapers(allPapers.filter(p => favoritePaperIds.has(p.id)));
          } catch (error) {
              console.error("Error writing favorites to localStorage:", error);
              // Wrap toast call in setTimeout
              setTimeout(() => {
                  toast({
                      variant: "destructive",
                      title: tPaperList('toggleFavoriteErrorTitle'),
                      description: tPaperList('localStorageWriteErrorDescription')
                  });
              }, 0);
          }
      }
      // Removed `toast` and `tPaperList` from dependencies as they are stable
  }, [favoritePaperIds, allPapers, isClient, isLoading]);

  const handleUnlike = (paperId: string, paperTitle: string) => {
      setFavoritePaperIds(prevIds => {
          const newIds = new Set(prevIds);
          newIds.delete(paperId);
          // No need to filter papers here, the useEffect above will handle it
          return newIds;
      });
       // Wrap toast call in setTimeout
       setTimeout(() => {
           toast({
              title: tPaperList('unlikedToastTitle'),
              description: tPaperList('unlikedToastDescription', { title: paperTitle }),
          });
       }, 0);
  };

   const handleDownloadPaper = (paper: Paper) => {
     if (!paper.fileDataUrl) {
       // Wrap toast call in setTimeout
       setTimeout(() => {
           toast({
             variant: "destructive",
             title: tPaperList('viewErrorTitle'),
             description: tPaperList('viewErrorNoData'),
           });
       }, 0);
       return;
     }
     const link = document.createElement('a');
     link.href = paper.fileDataUrl;
     link.download = paper.fileName || `paper-${paper.id}.pdf`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     // Wrap toast call in setTimeout
     setTimeout(() => {
         toast({
           title: tPaperList('downloadStartedTitle'),
           description: tPaperList('downloadStartedDescription', { fileName: paper.fileName }),
         });
     }, 0);
   };

   // Add handleViewPaper function (copied from paper-list.tsx)
   const handleViewPaper = (paper: Paper) => {
       if (!paper.fileDataUrl) {
           setTimeout(() => {
               toast({
                   variant: "destructive",
                   title: tPaperList('viewErrorTitle'),
                   description: tPaperList('viewErrorNoData'),
               });
           }, 0);
           return;
       }

       try {
           // Convert data URL to Blob
           const byteString = atob(paper.fileDataUrl.split(',')[1]);
           const mimeString = paper.fileDataUrl.split(',')[0].split(':')[1].split(';')[0];
           const ab = new ArrayBuffer(byteString.length);
           const ia = new Uint8Array(ab);
           for (let i = 0; i < byteString.length; i++) {
               ia[i] = byteString.charCodeAt(i);
           }
           const blob = new Blob([ab], { type: mimeString });

           // Create a Blob URL
           const blobUrl = URL.createObjectURL(blob);

           // Open the Blob URL in a new tab
           const newWindow = window.open(blobUrl, '_blank');

           if (!newWindow) {
                // Handle popup blocker
                setTimeout(() => {
                    toast({
                        variant: "destructive",
                        title: tPaperList('viewErrorTitle'),
                        description: tPaperList('popupBlockedError'), // Add this translation
                    });
                }, 0);
           } else {
                // Optional: Revoke the Blob URL after a delay
                // setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
           }

       } catch (error) {
           console.error("Error creating or opening Blob URL:", error);
           setTimeout(() => {
               toast({
                   variant: "destructive",
                   title: tPaperList('viewErrorTitle'),
                   description: tPaperList('viewErrorGeneric'), // Add this translation
               });
           }, 0);
       }
   };


  const formatDate = (dateString: string | undefined) => {
      if (!dateString) return tPaperList('unknownDate');
      try {
          return format(new Date(dateString), 'PPP');
      } catch (e) {
          return tPaperList('invalidDate');
      }
  }

  if (!isClient) {
      return (
         <Card>
           <CardHeader>
             <Skeleton className="h-6 w-3/5 mb-2" />
             <Skeleton className="h-4 w-4/5" />
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {[...Array(2)].map((_, index) => ( // Show fewer skeletons for favorites
                 <Card key={index}>
                   <CardHeader>
                     <Skeleton className="h-5 w-3/4 mb-2" />
                     <Skeleton className="h-4 w-1/2" />
                     <Skeleton className="h-4 w-1/4 mt-1" />
                     <Skeleton className="h-3 w-3/5 mt-1" /> {/* Skeleton for subject/dept */}
                   </CardHeader>
                   <CardContent>
                     <Skeleton className="h-4 w-full mb-1" />
                     <Skeleton className="h-4 w-5/6 mb-3" />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20" /> {/* View */}
                            <Skeleton className="h-8 w-24" /> {/* Download */}
                        </div>
                        <Skeleton className="h-8 w-8" /> {/* Unlike */}
                      </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </CardContent>
         </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="mr-2 h-5 w-5 text-destructive" /> {/* Use Heart icon */}
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="space-y-4">
             {[...Array(2)].map((_, index) => (
                <Card key={index}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4 mt-1" />
                        <Skeleton className="h-3 w-3/5 mt-1" /> {/* Skeleton for subject/dept */}
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-5/6 mb-3" />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20" /> {/* View */}
                            <Skeleton className="h-8 w-24" /> {/* Download */}
                          </div>
                          <Skeleton className="h-8 w-8" /> {/* Unlike */}
                        </div>
                    </CardContent>
                </Card>
             ))}
          </div>
        ) : favoritePapers.length > 0 ? (
          <div className="space-y-4">
            {favoritePapers.map((paper) => (
              <Card key={paper.id} className="transition-shadow duration-300 hover:shadow-md"> {/* Added transition/hover */}
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    {paper.title}
                  </CardTitle>
                  <CardDescription>
                     {tPaperList('paperByAuthors', { authors: paper.authors })} | {tPaperList('uploadedOn', { date: formatDate(paper.uploadDate) })}
                     <br/> {/* Added line break */}
                     <span className="text-xs">{tPaperList('subject')}: {paper.subject} | {tPaperList('department')}: {paper.department}</span> {/* Display subject and department */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{paper.abstract}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                       <div className="flex space-x-2 flex-wrap gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleViewPaper(paper)}
                             disabled={!paper.fileDataUrl}
                             className="transition-colors duration-200 hover:bg-secondary/80"
                             aria-label={tPaperList('viewActionLabel', { title: paper.title })}
                           >
                             <Eye className="mr-1 h-4 w-4" />
                             {tPaperList('viewButton')}
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleDownloadPaper(paper)}
                             disabled={!paper.fileDataUrl}
                             className="transition-colors duration-200 hover:bg-primary/10"
                             aria-label={tPaperList('downloadActionLabel', { title: paper.title })}
                            >
                             <Download className="mr-1 h-4 w-4" />
                             {tPaperList('downloadButton')}
                           </Button>
                       </div>

                       <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnlike(paper.id, paper.title)}
                          aria-label={t('unlikeActionLabel', {title: paper.title})}
                          className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                       >
                          <Heart className="h-5 w-5 fill-destructive" /> {/* Always filled red in favorites */}
                       </Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic text-center py-4">{t('noFavorites')}</p>
        )}
      </CardContent>
    </Card>
  )
}
