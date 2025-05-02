// @ts-nocheck
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, List, Trash2, Edit, Download } from "lucide-react" // Added Edit, Trash2, Download icons
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

// Type for paper data stored in localStorage (must match UploadForm)
interface StoredPaper {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileDataUrl: string; // Store file content as Data URL
    uploadDate: string; // Add upload timestamp
}

// Fallback dummy data (only used if localStorage is empty/invalid)
const initialDummyPapers: StoredPaper[] = [
  { id: 'dummy-1', title: "Example Paper One", authors: "Author A, Author B", uploadDate: "2023-01-15T10:00:00Z", abstract: "This is a sample abstract for an example paper stored locally...", fileName: "example1.pdf", fileType: "application/pdf", fileSize: 1024*500, fileDataUrl: "" },
  { id: 'dummy-2', title: "Another Example Paper", authors: "Author C", uploadDate: "2022-11-20T14:30:00Z", abstract: "Abstract for the second example paper...", fileName: "example2.pdf", fileType: "application/pdf", fileSize: 1024*800, fileDataUrl: "" },
];

type Paper = StoredPaper;

export function PaperList() {
  const t = useTranslations('PaperList');
  const tSearch = useTranslations('SearchSection'); // Reuse translations if needed
  const { toast } = useToast();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null); // State for delete confirmation

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);
    const username = localStorage.getItem('researchHubUsername');
    if (username === 'admin') {
      setIsAdmin(true);
    }

    // Fetch data from localStorage
    setIsLoading(true);
    try {
        const storedPapersJSON = localStorage.getItem('researchHubPapers');
        if (storedPapersJSON) {
            // Basic validation: check if it's an array
            const parsedPapers = JSON.parse(storedPapersJSON);
            if (Array.isArray(parsedPapers)) {
                setPapers(parsedPapers);
            } else {
                console.warn("Invalid data format in localStorage 'researchHubPapers', using fallback.");
                setPapers(initialDummyPapers);
                localStorage.setItem('researchHubPapers', JSON.stringify(initialDummyPapers)); // Reset localStorage
            }
        } else {
            // If nothing in storage, use initial dummy data and store it
            setPapers(initialDummyPapers);
            localStorage.setItem('researchHubPapers', JSON.stringify(initialDummyPapers));
        }
    } catch (error) {
        console.error("Error reading or parsing localStorage:", error);
        setPapers(initialDummyPapers); // Fallback to dummy data on error
    } finally {
        setIsLoading(false);
    }
  }, []); // Run only once on mount

   // Update local storage when papers change (e.g., after delete)
   useEffect(() => {
     if (isClient && !isLoading) { // Only run on client after initial load/modification
       try {
           localStorage.setItem('researchHubPapers', JSON.stringify(papers));
       } catch (error) {
           console.error("Error writing to localStorage:", error);
           toast({
               variant: "destructive",
               title: t('localStorageErrorTitle'),
               description: t('localStorageWriteErrorDescription')
           })
       }
     }
   }, [papers, isClient, isLoading, t]);

  const handleEditPaper = (paperId: string) => {
    // Simulate edit action (e.g., open a modal or navigate to an edit page)
    // In a real app, you might pass the paper data to the modal/page
    const paperToEdit = papers.find(p => p.id === paperId);
    console.log(`Edit paper:`, paperToEdit);
    toast({
      title: t('editPaperTitle'),
      description: t('editPaperDescription', { paperId }),
    });
    // TODO: Implement actual edit functionality (e.g., open Modal with form)
  };

  const handleDeletePaper = (paperId: string) => {
    // Find the paper title before deleting for the toast message
    const paperTitle = papers.find(p => p.id === paperId)?.title || t('unknownPaperTitle');
    // Update state (this triggers the useEffect to update localStorage)
    setPapers(prevPapers => prevPapers.filter(paper => paper.id !== paperId));
    toast({
      title: t('deletePaperTitle'),
      description: t('deletePaperSuccessDescription', { title: paperTitle }), // Use specific success message
      variant: 'destructive',
    });
    setPaperToDelete(null); // Close the dialog
  };

   const handleViewOrDownloadPaper = (paper: Paper) => {
     if (!paper.fileDataUrl) {
       toast({
         variant: "destructive",
         title: t('viewErrorTitle'),
         description: t('viewErrorNoData'),
       });
       return;
     }

     // Option 1: Open in new tab (browser PDF viewer)
     // window.open(paper.fileDataUrl, '_blank');

     // Option 2: Trigger download
     const link = document.createElement('a');
     link.href = paper.fileDataUrl;
     link.download = paper.fileName || `paper-${paper.id}.pdf`; // Provide a filename
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);

     toast({
       title: t('downloadStartedTitle'),
       description: t('downloadStartedDescription', { fileName: paper.fileName }),
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
                        <Skeleton className="h-6 w-24" /> {/* Skeleton for download button */}
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-16" /> {/* Skeleton for edit */}
                            <Skeleton className="h-8 w-16" /> {/* Skeleton for delete */}
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
                          <Skeleton className="h-6 w-24" /> {/* Skeleton for download button */}
                         {isAdmin && ( // Show skeleton buttons for admin
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                         )}
                         </div>
                    </CardContent>
                </Card>
             ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="space-y-4">
            {papers.map((paper) => (
              <Card key={paper.id} className="transition-shadow duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    {paper.title}
                  </CardTitle>
                  <CardDescription>
                     {t('paperByAuthors', { authors: paper.authors })} | {t('uploadedOn', { date: formatDate(paper.uploadDate) })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{paper.abstract}</p>
                  <div className="flex items-center justify-between">
                      {/* Download Button */}
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleViewOrDownloadPaper(paper)}
                         disabled={!paper.fileDataUrl} // Disable if no data URL
                         className="transition-colors duration-200 hover:bg-primary/10"
                         aria-label={t('downloadActionLabel', { title: paper.title })}
                        >
                         <Download className="mr-1 h-4 w-4" />
                         {t('downloadButton')}
                       </Button>

                     {/* Admin Actions */}
                     {isAdmin && (
                       <div className="flex space-x-2">
                         {/* Edit Button */}
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditPaper(paper.id)}
                           className="transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                           aria-label={t('editActionLabel', { title: paper.title })}
                         >
                           <Edit className="mr-1 h-4 w-4" />
                           {t('editButton')}
                         </Button>

                         {/* Delete Button with Confirmation */}
                         <AlertDialog open={paperToDelete?.id === paper.id} onOpenChange={(open) => !open && setPaperToDelete(null)}>
                            <AlertDialogTrigger asChild>
                               <Button
                                 variant="destructive"
                                 size="sm"
                                 className="transition-colors duration-200 hover:bg-destructive/90"
                                 onClick={() => setPaperToDelete(paper)} // Set paper for confirmation
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
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic text-center py-4">{t('noPapers')}</p>
        )}
      </CardContent>

    </Card>
  )
}
