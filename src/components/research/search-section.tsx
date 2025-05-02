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
import { Search, FileText } from "lucide-react"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

const searchSchema = z.object({
  keywords: z.string().optional(),
  author: z.string().optional(),
  year: z.string().optional().refine((val) => !val || /^\d{4}$/.test(val), {
    message: "Year must be a 4-digit number.",
  }),
})

// Dummy data for search results
const dummyResults = [
  { id: '1', title: "Paper Title One", authors: "Author A, Author B", year: "2023", abstract: "This is the abstract for paper one..." },
  { id: '2', title: "Another Research Paper", authors: "Author C", year: "2022", abstract: "Abstract for the second paper goes here..." },
  { id: '3', title: "Study on AI Ethics", authors: "Author A", year: "2023", abstract: "Exploring ethical considerations in artificial intelligence..." },
];

type SearchResult = typeof dummyResults[0];

export function SearchSection() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      keywords: "",
      author: "",
      year: "",
    },
  })

  function onSubmit(values: z.infer<typeof searchSchema>) {
    setIsSearching(true);
    console.log("Search submitted:", values)
    // Simulate API call
    setTimeout(() => {
      // Filter dummy data based on search criteria (simple example)
      const results = dummyResults.filter(paper => {
        const keywordMatch = !values.keywords || paper.title.toLowerCase().includes(values.keywords.toLowerCase()) || paper.abstract.toLowerCase().includes(values.keywords.toLowerCase());
        const authorMatch = !values.author || paper.authors.toLowerCase().includes(values.author.toLowerCase());
        const yearMatch = !values.year || paper.year === values.year;
        return keywordMatch && authorMatch && yearMatch;
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Research Papers</CardTitle>
        <CardDescription>Find papers by keywords, author, or publication year.</CardDescription>
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
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., machine learning, climate change" {...field} />
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
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
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
                    <FormLabel>Publication Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSearching} className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" /> {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </Form>

        <Separator className="my-8" />

        <h3 className="text-lg font-semibold mb-4">Search Results</h3>
        {isSearching ? (
          <p className="text-muted-foreground">Searching...</p>
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
                    By {result.authors} ({result.year})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{result.abstract}</p>
                  {/* Add a link/button to view the full paper if available */}
                   <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                     View Paper
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No results found. Try broadening your search.</p>
        )}
      </CardContent>
    </Card>
  )
}
