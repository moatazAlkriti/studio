// @ts-nocheck
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, List } from "lucide-react" // Added List icon
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Dummy data (can be replaced with actual data fetching)
const dummyPapers = [
  { id: '1', title: "Paper Title One", authors: "Author A, Author B", year: "2023", abstract: "This is the abstract for paper one..." },
  { id: '2', title: "Another Research Paper", authors: "Author C", year: "2022", abstract: "Abstract for the second paper goes here..." },
  { id: '3', title: "Study on AI Ethics", authors: "Author A", year: "2023", abstract: "Exploring ethical considerations in artificial intelligence..." },
  { id: '4', title: "Quantum Computing Advances", authors: "Author D, Author E", year: "2024", abstract: "Recent breakthroughs in quantum algorithms and hardware." },
  { id: '5', title: "Climate Change Impact Study", authors: "Author F", year: "2021", abstract: "Analysis of the effects of climate change on coastal regions." },
];

type Paper = typeof dummyPapers[0];

export function PaperList() {
  const t = useTranslations('PaperList'); // Use a dedicated namespace
  const tSearch = useTranslations('SearchSection'); // Reuse translations if needed
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      setPapers(dummyPapers);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <List className="mr-2 h-5 w-5 text-primary" /> {/* Added List icon */}
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
                  {/* Add a link/button to view the full paper if available */}
                   <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                     {tSearch('viewPaperButton')}
                   </Button>
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
