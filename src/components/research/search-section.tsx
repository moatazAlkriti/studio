
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText, Download, Loader2, Heart } from "lucide-react" // Added Heart icon
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast" // Import useToast
import { format } from 'date-fns'; // For formatting date
import type { StoredPaper } from "./paper-list"; // Import shared type

// Schema generation function
const getSearchSchema = (t: ReturnType<typeof useTranslations<'SearchSection'>>) => z.object({
  title: z.string().optional(), // Changed from keywords to title
  author: z.string().optional(),
  // Keep year validation if needed, though upload date is now available
  year: z.string().optional().refine((val) => !val || /^\d{4}$/.test(val), {
    message: t('yearError'),
  }),
});


// Fallback dummy data (only used if localStorage is empty/invalid on first load)
const initialDummyPapers: StoredPaper[] = [
  { id: 'dummy-1', title: "Example Paper One", authors: "Author A, Author B", uploadDate: "2023-01-15T10:00:00Z", abstract: "This is a sample abstract for an example paper stored locally...", fileName: "example1.pdf", fileType: "application/pdf", fileSize: 1024*500, fileDataUrl: "" },
  { id: 'dummy-2', title: "Another Example Paper", authors: "Author C", uploadDate: "2022-11-20T14:30:00Z", abstract: "Abstract for the second example paper...", fileName: "example2.pdf", fileType: "application/pdf", fileSize: 1024*800, fileDataUrl: "" },
];


type SearchResult = StoredPaper;

export function SearchSection() {
  const t = useTranslations('SearchSection');
  const tPaperList = useTranslations('PaperList'); // For shared translations
  const { toast } = useToast();
  const [allPapers, setAllPapers] = useState<StoredPaper[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPapers, setIsLoadingPapers] = useState(true); // State for loading papers initially
  const [favoritePaperIds, setFavoritePaperIds] = useState<Set<string>>(new Set()); // State for favorite paper IDs

  // Create schema with translations
  const searchSchema = getSearchSchema(t);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      title: "",
      author: "",
      year: "",
    },
  })

  // Load papers and favorites from localStorage on component mount
   useEffect(() => {
     setIsLoadingPapers(true);
     try {
       // Load papers
       const storedPapersJSON = localStorage.getItem('researchHubPapers');
       if (storedPapersJSON) {
         const parsedPapers = JSON.parse(storedPapersJSON);
         if (Array.isArray(parsedPapers)) {
           setAllPapers(parsedPapers);
         } else {
           console.warn("Invalid data format in localStorage 'researchHubPapers', using fallback.");
           setAllPapers(initialDummyPapers);
         }
       } else {
         setAllPapers(initialDummyPapers); // Use dummy if nothing in storage
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
       setAllPapers(initialDummyPapers); // Fallback on error
       setFavoritePaperIds(new Set());
     } finally {
       setIsLoadingPapers(false);
     }
   }, []);

    // Update favorites in localStorage when favoritePaperIds change
   useEffect(() => {
       if (!isLoadingPapers) { // Only run after initial load
           try {
               localStorage.setItem('researchHubFavorites', JSON.stringify(Array.from(favoritePaperIds)));
           } catch (error) {
               console.error("Error writing favorites to localStorage:", error);
               toast({
                   variant: "destructive",
                   title: t('toggleFavoriteErrorTitle'),
                   description: tPaperList('localStorageWriteErrorDescription') // Reuse translation
               });
           }
       }
       // Removed `t`, `tPaperList`, and `toast` from dependencies as they are stable
   }, [favoritePaperIds, isLoadingPapers]);


  function onSubmit(values: z.infer<typeof searchSchema>) {
    setIsSearching(true);
    console.log("Search submitted:", values);

    // Simulate search delay (optional)
    setTimeout(() => {
      // Filter loaded papers based on search criteria
      const results = allPapers.filter(paper => {
        const titleMatch = !values.title ||
                             paper.title.toLowerCase().includes(values.title.toLowerCase()) ||
                             paper.abstract.toLowerCase().includes(values.title.toLowerCase());
        const authorMatch = !values.author ||
                            paper.authors.toLowerCase().includes(values.author.toLowerCase());
        const yearMatch = !values.year ||
                          (paper.uploadDate && new Date(paper.uploadDate).getFullYear().toString() === values.year);

        return titleMatch && authorMatch && yearMatch;
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }

   const handleDownloadPaper = (paper: SearchResult) => {
     if (!paper.fileDataUrl) {
       toast({
         variant: "destructive",
         title: tPaperList('viewErrorTitle'),
         description: tPaperList('viewErrorNoData'),
       });
       return;
     }

     const link = document.createElement('a');
     link.href = paper.fileDataUrl;
     link.download = paper.fileName || `paper-${paper.id}.pdf`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);

     toast({
       title: tPaperList('downloadStartedTitle'),
       description: tPaperList('downloadStartedDescription', { fileName: paper.fileName }),
     });
   };

   const toggleFavorite = (paperId: string, paperTitle: string) => {
       setFavoritePaperIds(prevIds => {
           const newIds = new Set(prevIds);
           if (newIds.has(paperId)) {
               newIds.delete(paperId);
               toast({
                   title: t('unlikedToastTitle'),
                   description: t('unlikedToastDescription', { title: paperTitle }),
               });
           } else {
               newIds.add(paperId);
               toast({
                   title: t('likedToastTitle'),
                   description: t('likedToastDescription', { title: paperTitle }),
               });
           }
           return newIds;
       });
   };

   // Format date utility
   const formatDate = (dateString: string | undefined) => {
       if (!dateString) return tPaperList('unknownDate');
       try {
           return format(new Date(dateString), 'PPP');
       } catch (e) {
           return tPaperList('invalidDate');
       }
   }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('titleLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('titlePlaceholder')} {...field} disabled={isLoadingPapers || isSearching}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('authorLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('authorPlaceholder')} {...field} disabled={isLoadingPapers || isSearching}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yearLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('yearPlaceholder')} {...field} disabled={isLoadingPapers || isSearching}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoadingPapers || isSearching} className="w-full md:w-auto">
              {(isLoadingPapers || isSearching) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isLoadingPapers ? t('loadingPapersButton') : (isSearching ? t('searchingButton') : t('searchButton'))}
            </Button>
          </form>
        </Form>

        <Separator className="my-8" />

        <h3 className="text-lg font-semibold mb-4">{t('resultsTitle')}</h3>
        {isLoadingPapers ? (
           <p className="text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('loadingPapersText')}</p>
        ) : isSearching ? (
          <p className="text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('searchingText')}</p>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result) => {
               const isFavorite = favoritePaperIds.has(result.id);
               return (
                 <Card key={result.id}>
                   <CardHeader>
                     <CardTitle className="text-base flex items-center">
                       <FileText className="mr-2 h-5 w-5 text-primary" />
                       {result.title}
                     </CardTitle>
                     <CardDescription>
                       {tPaperList('paperByAuthors', { authors: result.authors })} | {tPaperList('uploadedOn', { date: formatDate(result.uploadDate) })}
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{result.abstract}</p>
                     <div className="flex items-center justify-between">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleDownloadPaper(result)}
                         disabled={!result.fileDataUrl}
                         className="transition-colors duration-200 hover:bg-primary/10"
                         aria-label={tPaperList('downloadActionLabel', { title: result.title })}
                       >
                         <Download className="mr-1 h-4 w-4" />
                         {tPaperList('downloadButton')}
                       </Button>

                       <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(result.id, result.title)}
                          aria-label={isFavorite ? t('unlikeActionLabel', {title: result.title}) : t('likeActionLabel', {title: result.title})}
                          className={`transition-colors duration-200 ${isFavorite ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                       >
                          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive' : 'fill-none'}`} />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               );
             })}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('noResultsText')}</p>
        )}
      </CardContent>
    </Card>
  )
}
