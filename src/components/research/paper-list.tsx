
// @ts-nocheck
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, List, Trash2, Edit, Download, Heart, Eye } from "lucide-react" // Added Eye icon
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { useToast } from "@/hooks/use-toast"; // Import useToast
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'; // For formatting date
import { EditPaperForm, type EditPaperData } from "./edit-paper-form"; // Import the new Edit form
import { addNotification } from "@/lib/notifications"; // Import notification utility

// Type for paper data stored in localStorage (must match UploadForm)
// Keep consistent with other components
export interface StoredPaper {
    id: string;
    title: string;
    authors: string;
    subject: string; // Added subject
    department: string; // Added department
    abstract: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileDataUrl: string; // Store file content as Data URL
    uploadDate: string; // Add upload timestamp
}

// Fallback dummy data (only used if localStorage is empty/invalid)
const initialDummyPapers: StoredPaper[] = [
  { id: 'dummy-1', title: "Example Paper One", authors: "Author A, Author B", subject: "AI", department: "Computer Science", uploadDate: "2023-01-15T10:00:00Z", abstract: "This is a sample abstract for an example paper stored locally...", fileName: "example1.pdf", fileType: "application/pdf", fileSize: 1024*500, fileDataUrl: "" },
  { id: 'dummy-2', title: "Another Example Paper", authors: "Author C", subject: "Genetics", department: "Biology", uploadDate: "2022-11-20T14:30:00Z", abstract: "Abstract for the second example paper...", fileName: "example2.pdf", fileType: "application/pdf", fileSize: 1024*800, fileDataUrl: "" },
];

type Paper = StoredPaper;

export function PaperList() {
  const t = useTranslations('PaperList');
  const tEdit = useTranslations('EditPaperForm');
  const tNotify = useTranslations('Notifications');
  const { toast } = useToast();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [favoritePaperIds, setFavoritePaperIds] = useState<Set<string>>(new Set()); // State for favorite paper IDs

  useEffect(() => {
    setIsClient(true);
    const username = localStorage.getItem('researchHubUsername');
    if (username === 'admin') {
      setIsAdmin(true);
    }
    setCurrentUsername(username);

    setIsLoading(true);
    try {
        // Load papers
        const storedPapersJSON = localStorage.getItem('researchHubPapers');
        if (storedPapersJSON) {
            const parsedPapers = JSON.parse(storedPapersJSON);
            if (Array.isArray(parsedPapers)) {
                setPapers(parsedPapers);
            } else {
                console.warn("Invalid data format in localStorage 'researchHubPapers', using fallback.");
                setPapers(initialDummyPapers);
                localStorage.setItem('researchHubPapers', JSON.stringify(initialDummyPapers));
            }
        } else {
            setPapers(initialDummyPapers);
            localStorage.setItem('researchHubPapers', JSON.stringify(initialDummyPapers));
        }

        // Load favorites
        const storedFavoritesJSON = localStorage.getItem('researchHubFavorites');
        if (storedFavoritesJSON) {
             const parsedFavorites = JSON.parse(storedFavoritesJSON);
             if (Array.isArray(parsedFavorites)) {
                 setFavoritePaperIds(new Set(parsedFavorites));
             } else {
                  console.warn("Invalid favorite data format in localStorage, resetting.");
                  localStorage.setItem('researchHubFavorites', JSON.stringify([])); // Reset if invalid
                  setFavoritePaperIds(new Set());
             }
        } else {
             setFavoritePaperIds(new Set());
        }

    } catch (error) {
        console.error("Error reading or parsing localStorage:", error);
        setPapers(initialDummyPapers); // Fallback to dummy data on error
        setFavoritePaperIds(new Set());
    } finally {
        setIsLoading(false);
    }
  }, []);

   // Update local storage when papers change
   useEffect(() => {
     if (isClient && !isLoading) {
       try {
           localStorage.setItem('researchHubPapers', JSON.stringify(papers));
       } catch (error) {
           console.error("Error writing papers to localStorage:", error);
            setTimeout(() => {
               toast({
                   variant: "destructive",
                   title: t('localStorageErrorTitle'),
                   description: t('localStorageWriteErrorDescription')
               })
            }, 0);
       }
     }
     // Removed `t` and `toast` from dependencies as they are stable
   }, [papers, isClient, isLoading]);

   // Update favorites in localStorage when favoritePaperIds change
    useEffect(() => {
        if (isClient && !isLoading) { // Only run after initial load and if client-side
            try {
                localStorage.setItem('researchHubFavorites', JSON.stringify(Array.from(favoritePaperIds)));
            } catch (error) {
                console.error("Error writing favorites to localStorage:", error);
                // Wrap toast call in setTimeout
                setTimeout(() => {
                    toast({
                        variant: "destructive",
                        title: t('toggleFavoriteErrorTitle'),
                        description: t('localStorageWriteErrorDescription')
                    });
                }, 0);
            }
        }
        // Removed `t` and `toast` from dependencies as they are stable
    }, [favoritePaperIds, isClient, isLoading]);

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    setIsEditDialogOpen(true);
  };

   const handleSaveChanges = (updatedData: EditPaperData) => {
     if (!editingPaper) return;

     const originalTitle = editingPaper.title; // Store original title before update

     setPapers(prevPapers =>
       prevPapers.map(p =>
         p.id === editingPaper.id
           ? { ...p, ...updatedData } // Merge updated metadata
           : p
       )
     );

      // Add notification for admin about the update
      if (editingPaper.id) {
        addNotification(
          tNotify('paperUpdatedMessage', {
              title: originalTitle, // Use original title for reference
              username: currentUsername || tNotify('unknownUser'),
          }),
          'admin' // Send to admin
        );
      }

     // Wrap toast call in setTimeout
     setTimeout(() => {
         toast({
           title: tEdit('editSuccessTitle'),
           description: tEdit('editSuccessDescription', { title: updatedData.title }),
         });
     }, 0);
     setIsEditDialogOpen(false);
     setEditingPaper(null);
   };

   const handleCancelEdit = () => {
     setIsEditDialogOpen(false);
     setEditingPaper(null);
   };


  const handleDeletePaper = (paperId: string) => {
    const paperToDeleteInfo = papers.find(p => p.id === paperId);
    if (!paperToDeleteInfo) return;

    const paperTitle = paperToDeleteInfo.title || t('unknownPaperTitle');

    // Update state (this triggers the useEffect to update localStorage)
    setPapers(prevPapers => prevPapers.filter(paper => paper.id !== paperId));
    // Also remove from favorites if deleted
    setFavoritePaperIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.delete(paperId);
        return newIds;
    });


    // Add notification for admin about the deletion
    addNotification(
      tNotify('paperDeletedMessage', {
        title: paperTitle,
        username: currentUsername || tNotify('unknownUser')
      }),
      'admin' // Send to admin
    );

    // Wrap toast call in setTimeout
    setTimeout(() => {
        toast({
          title: t('deletePaperTitle'),
          description: t('deletePaperSuccessDescription', { title: paperTitle }),
          variant: 'destructive',
        });
    }, 0);
    setPaperToDelete(null); // Close the dialog
  };

   const handleDownloadPaper = (paper: Paper) => {
     if (!paper.fileDataUrl) {
       // Wrap toast call in setTimeout
       setTimeout(() => {
           toast({
             variant: "destructive",
             title: t('viewErrorTitle'),
             description: t('viewErrorNoData'),
           });
       }, 0);
       return;
     }

     // Trigger download
     const link = document.createElement('a');
     link.href = paper.fileDataUrl;
     link.download = paper.fileName || `paper-${paper.id}.pdf`; // Provide a filename
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);

     // Wrap toast call in setTimeout
     setTimeout(() => {
         toast({
           title: t('downloadStartedTitle'),
           description: t('downloadStartedDescription', { fileName: paper.fileName }),
         });
     }, 0);
   };

   const handleViewPaper = (paper: Paper) => {
       if (!paper.fileDataUrl) {
           setTimeout(() => {
               toast({
                   variant: "destructive",
                   title: t('viewErrorTitle'),
                   description: t('viewErrorNoData'),
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
                        title: t('viewErrorTitle'),
                        description: t('popupBlockedError'), // Add this translation
                    });
                }, 0);
           } else {
                // Revoke the Blob URL after a short delay to allow the browser to load it
                // This is important for memory management
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
           }

       } catch (error) {
           console.error("Error creating or opening Blob URL:", error);
           setTimeout(() => {
               toast({
                   variant: "destructive",
                   title: t('viewErrorTitle'),
                   description: t('viewErrorGeneric'), // Add this translation
               });
           }, 0);
       }
   };

   const toggleFavorite = (paperId: string, paperTitle: string) => {
      setFavoritePaperIds(prevIds => {
          const newIds = new Set(prevIds);
          if (newIds.has(paperId)) {
              newIds.delete(paperId);
              // Wrap toast call in setTimeout
              setTimeout(() => {
                  toast({
                       title: t('unlikedToastTitle'),
                       description: t('unlikedToastDescription', { title: paperTitle }),
                   });
               }, 0);
          } else {
              newIds.add(paperId);
              // Wrap toast call in setTimeout
              setTimeout(() => {
                  toast({
                       title: t('likedToastTitle'),
                       description: t('likedToastDescription', { title: paperTitle }),
                   });
               }, 0);
          }
          return newIds;
      });
   };


  // Format date utility
  const formatDate = (dateString: string | undefined) => {
      if (!dateString) return t('unknownDate');
      try {
          return format(new Date(dateString), 'PPP'); // e.g., Jun 22, 2024
      } catch (e) {
          return t('invalidDate');
      }
  }

  // Don't render potentially sensitive controls on server or before hydration
  if (!isClient) {
      // Render loading state or skeleton for the entire card
      return (
         <Card>
           <CardHeader>
             <Skeleton className="h-6 w-3/5 mb-2" />
             <Skeleton className="h-4 w-4/5" />
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {[...Array(3)].map((_, index) => (
                 <Card key={index}>
                   <CardHeader>
                     <Skeleton className="h-5 w-3/4 mb-2" />
                     <Skeleton className="h-4 w-1/2" />
                     <Skeleton className="h-4 w-1/4 mt-1" /> {/* Skeleton for date */}
                   </CardHeader>
                   <CardContent>
                     <Skeleton className="h-4 w-full mb-1" />
                     <Skeleton className="h-4 w-5/6 mb-3" />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-20" /> {/* View skeleton */}
                          <Skeleton className="h-8 w-24" /> {/* Download skeleton */}
                        </div>
                        <div className="flex space-x-2">
                             <Skeleton className="h-8 w-8" /> {/* Like skeleton */}
                            {/* Skeletons only if admin check would pass */}
                            {isAdmin && (
                                <>
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </>
                             )}
                        </div>
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
    <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="mr-2 h-5 w-5 text-primary" />
              {t('title')}
            </CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="space-y-4">
                 {[...Array(3)].map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                             <Skeleton className="h-4 w-1/4 mt-1" /> {/* Skeleton for date */}
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-5/6 mb-3" />
                            <div className="flex items-center justify-between mt-3">
                               <div className="flex space-x-2">
                                  <Skeleton className="h-8 w-20" /> {/* View skeleton */}
                                  <Skeleton className="h-8 w-24" /> {/* Download skeleton */}
                               </div>
                               <div className="flex space-x-2 items-center">
                                  <Skeleton className="h-8 w-8" /> {/* Like button skeleton */}
                                  {isAdmin && ( // Show skeleton buttons for admin
                                    <>
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-16" />
                                    </>
                                 )}
                               </div>
                             </div>
                        </CardContent>
                    </Card>
                 ))}
              </div>
            ) : papers.length > 0 ? (
              <div className="space-y-4">
                {papers.map((paper) => {
                    const isFavorite = favoritePaperIds.has(paper.id);
                    return (
                      <Card key={paper.id} className="transition-shadow duration-300 hover:shadow-md">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-primary" />
                            {paper.title}
                          </CardTitle>
                          <CardDescription>
                             {t('paperByAuthors', { authors: paper.authors })} | {t('uploadedOn', { date: formatDate(paper.uploadDate) })}
                             <br/> {/* Added line break */}
                             <span className="text-xs">{t('subject')}: {paper.subject} | {t('department')}: {paper.department}</span> {/* Display subject and department */}
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
                                     aria-label={t('viewActionLabel', { title: paper.title })}
                                   >
                                     <Eye className="mr-1 h-4 w-4" />
                                     {t('viewButton')}
                                   </Button>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => handleDownloadPaper(paper)}
                                     disabled={!paper.fileDataUrl}
                                     className="transition-colors duration-200 hover:bg-primary/10"
                                     aria-label={t('downloadActionLabel', { title: paper.title })}
                                    >
                                     <Download className="mr-1 h-4 w-4" />
                                     {t('downloadButton')}
                                   </Button>
                               </div>


                               <div className="flex space-x-2 items-center flex-wrap gap-2">
                                   <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleFavorite(paper.id, paper.title)}
                                      aria-label={isFavorite ? t('unlikeActionLabel', {title: paper.title}) : t('likeActionLabel', {title: paper.title})}
                                      className={`transition-colors duration-200 ${isFavorite ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                                   >
                                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive' : 'fill-none'}`} />
                                   </Button>

                                   {isAdmin && (
                                   <>
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleEditPaper(paper)}
                                       className="transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                                       aria-label={t('editActionLabel', { title: paper.title })}
                                     >
                                       <Edit className="mr-1 h-4 w-4" />
                                       {t('editButton')}
                                     </Button>

                                     <AlertDialog open={paperToDelete?.id === paper.id} onOpenChange={(open) => !open && setPaperToDelete(null)}>
                                        <AlertDialogTrigger asChild>
                                           <Button
                                             variant="destructive"
                                             size="sm"
                                             className="transition-colors duration-200 hover:bg-destructive/90"
                                             onClick={() => setPaperToDelete(paper)}
                                             aria-label={t('deleteActionLabel', { title: paper.title })}
                                           >
                                             <Trash2 className="mr-1 h-4 w-4" />
                                             {t('deleteButton')}
                                           </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {t('deleteConfirmDescription', { title: paperToDelete?.title || t('unknownPaperTitle') })}
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setPaperToDelete(null)}>{t('cancelButton')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => paperToDelete && handleDeletePaper(paperToDelete.id)}>
                                              {t('confirmDeleteButton')}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                     </AlertDialog>
                                   </>
                                   )}
                               </div>
                           </div>
                        </CardContent>
                      </Card>
                    );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-center py-4">{t('noPapers')}</p>
            )}
          </CardContent>

        </Card>

        {/* Edit Paper Dialog/Modal */}
        <EditPaperForm
           isOpen={isEditDialogOpen}
           onClose={handleCancelEdit}
           paperData={editingPaper ? { title: editingPaper.title, authors: editingPaper.authors, abstract: editingPaper.abstract } : undefined}
           originalPaperId={editingPaper?.id} // Pass ID
           originalPaperTitle={editingPaper?.title} // Pass title
           onSave={handleSaveChanges}
        />
    </>
  )
}

// Add needed translations
// en.json -> PaperList
//   "viewButton": "View PDF",
//   "viewActionLabel": "View PDF for {title}",
//   "popupBlockedError": "Could not open PDF. Please disable your pop-up blocker for this site.",
//   "viewErrorGeneric": "An unexpected error occurred while trying to view the PDF."
// ar.json -> PaperList
//   "viewButton": "عرض PDF",
//   "viewActionLabel": "عرض PDF لـ {title}",
//   "popupBlockedError": "تعذر فتح ملف PDF. يرجى تعطيل مانع النوافذ المنبثقة لهذا الموقع.",
//   "viewErrorGeneric": "حدث خطأ غير متوقع أثناء محاولة عرض ملف PDF."
