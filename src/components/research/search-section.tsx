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
import { Search, FileText, Download, Loader2 } from "lucide-react" // Added Download and Loader2
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast" // Import useToast
import { format } from 'date-fns'; // For formatting date

// Schema generation function
const getSearchSchema = (t: ReturnType<typeof useTranslations<'SearchSection'>>) => z.object({
  keywords: z.string().optional(),
  author: z.string().optional(),
  // Keep year validation if needed, though upload date is now available
  year: z.string().optional().refine((val) => !val || /^\d{4}$/.test(val), {
    message: t('yearError'),
  }),
});

// Type for paper data stored in localStorage (must match UploadForm & PaperList)
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

  // Create schema with translations
  const searchSchema = getSearchSchema(t);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      keywords: "",
      author: "",
      year: "", // Keep year field if you want to filter by it, though upload date is primary
    },
  })

  // Load papers from localStorage on component mount
   useEffect(() => {
     setIsLoadingPapers(true);
     try {
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
     } catch (error) {
       console.error("Error reading or parsing localStorage:", error);
       setAllPapers(initialDummyPapers); // Fallback on error
     } finally {
       setIsLoadingPapers(false);
     }
   }, []);

  function onSubmit(values: z.infer<typeof searchSchema>) {
    setIsSearching(true);
    console.log("Search submitted:", values);

    // Simulate search delay (optional)
    setTimeout(() => {
      // Filter loaded papers based on search criteria
      const results = allPapers.filter(paper => {
        const keywordMatch = !values.keywords ||
                             paper.title.toLowerCase().includes(values.keywords.toLowerCase()) ||
                             paper.abstract.toLowerCase().includes(values.keywords.toLowerCase());
        const authorMatch = !values.author ||
                            paper.authors.toLowerCase().includes(values.author.toLowerCase());
        // Optional: Filter by year if the field is used. Compare extracted year from uploadDate.
        const yearMatch = !values.year ||
                          (paper.uploadDate && new Date(paper.uploadDate).getFullYear().toString() === values.year);

        return keywordMatch && authorMatch && yearMatch;
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 500); // Shorter delay as filtering is local
  }

   const handleDownloadPaper = (paper: SearchResult) => {
     if (!paper.fileDataUrl) {
       toast({
         variant: "destructive",
         title: tPaperList('viewErrorTitle'), // Reuse translation
         description: tPaperList('viewErrorNoData'), // Reuse translation
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
       title: tPaperList('downloadStartedTitle'), // Reuse translation
       description: tPaperList('downloadStartedDescription', { fileName: paper.fileName }), // Reuse translation
     });
   };

   // Format date utility (same as in PaperList)
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
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('keywordsLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('keywordsPlaceholder')} {...field} disabled={isLoadingPapers || isSearching}/>
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
                    <FormLabel>{t('yearLabel')}</FormLabel> {/* Consider changing label to "Upload Year" */}
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
            {searchResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    {result.title}
                  </CardTitle>
                  <CardDescription>
                    {/* Use upload date instead of year */}
                    {tPaperList('paperByAuthors', { authors: result.authors })} | {tPaperList('uploadedOn', { date: formatDate(result.uploadDate) })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{result.abstract}</p>
                   {/* Download Button */}
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('noResultsText')}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Add missing translations to your JSON files:
// en.json -> SearchSection:
//   "loadingPapersButton": "Loading Papers...",
//   "loadingPapersText": "Loading available papers...",
// ar.json -> SearchSection:
//   "loadingPapersButton": "جار تحميل الأوراق...",
//   "loadingPapersText": "جار تحميل الأوراق المتاحة...",
