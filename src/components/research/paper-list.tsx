// @ts-nocheck
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, List, Trash2, Edit } from "lucide-react" // Added Edit and Trash2 icons
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

// Dummy data (can be replaced with actual data fetching)
const initialDummyPapers = [
  { id: '1', title: "Paper Title One", authors: "Author A, Author B", year: "2023", abstract: "This is the abstract for paper one..." },
  { id: '2', title: "Another Research Paper", authors: "Author C", year: "2022", abstract: "Abstract for the second paper goes here..." },
  { id: '3', title: "Study on AI Ethics", authors: "Author A", year: "2023", abstract: "Exploring ethical considerations in artificial intelligence..." },
  { id: '4', title: "Quantum Computing Advances", authors: "Author D, Author E", year: "2024", abstract: "Recent breakthroughs in quantum algorithms and hardware." },
  { id: '5', title: "Climate Change Impact Study", authors: "Author F", year: "2021", abstract: "Analysis of the effects of climate change on coastal regions." },
];

type Paper = typeof initialDummyPapers[0];

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

    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, fetch from local storage or API if persistence is needed
      const storedPapers = localStorage.getItem('researchHubPapers');
      setPapers(storedPapers ? JSON.parse(storedPapers) : initialDummyPapers);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  }, []);

   // Update local storage when papers change
   useEffect(() => {
     if (isClient && !isLoading) { // Only run on client after initial load
       localStorage.setItem('researchHubPapers', JSON.stringify(papers));
     }
   }, [papers, isClient, isLoading]);

  const handleEditPaper = (paperId: string) => {
    // Simulate edit action (e.g., open a modal or navigate to an edit page)
    console.log(`Edit paper with ID: ${paperId}`);
    toast({
      title: t('editPaperTitle'),
      description: t('editPaperDescription', { paperId }),
    });
    // Here you would typically open a modal/form pre-filled with paper data
  };

  const handleDeletePaper = (paperId: string) => {
    // Simulate delete action
    setPapers(prevPapers => prevPapers.filter(paper => paper.id !== paperId));
    toast({
      title: t('deletePaperTitle'),
      description: t('deletePaperDescription'),
      variant: 'destructive',
    });
    setPaperToDelete(null); // Close the dialog
  };

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
                   </CardHeader>
                   <CardContent>
                     <Skeleton className="h-4 w-full mb-1" />
                     <Skeleton className="h-4 w-5/6 mb-3" />
                     <Skeleton className="h-6 w-24" />
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
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-5/6 mb-3" />
                        <Skeleton className="h-6 w-24" />
                         {isAdmin && ( // Show skeleton buttons for admin
                            <div className="flex space-x-2 mt-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                         )}
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
                    {tSearch('paperBy', { authors: paper.authors, year: paper.year })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{paper.abstract}</p>
                  <div className="flex items-center justify-between mt-3">
                      {/* Always show view button */}
                      <Button variant="link" size="sm" className="p-0 h-auto">
                         {tSearch('viewPaperButton')}
                      </Button>

                     {/* Admin Actions */}
                     {isAdmin && (
                       <div className="flex space-x-2">
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

                         <AlertDialog>
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
                            {paperToDelete && paperToDelete.id === paper.id && ( // Only render content for the selected paper
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     {t('deleteConfirmDescription', { title: paperToDelete.title })}
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel onClick={() => setPaperToDelete(null)}>{t('cancelButton')}</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDeletePaper(paperToDelete.id)}>
                                     {t('confirmDeleteButton')}
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                            )}
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
