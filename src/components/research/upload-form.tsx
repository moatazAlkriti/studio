"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"
import { useState, type ChangeEvent } from "react"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  authors: z.string().min(2, {
    message: "Authors must be at least 2 characters.",
  }).describe("Comma-separated list of authors"),
  abstract: z.string().min(10, {
    message: "Abstract must be at least 10 characters.",
  }),
  file: z.any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf files are accepted."
    ),
})

export function UploadForm() {
  const { toast } = useToast()
  const [fileName, setFileName] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      authors: "",
      abstract: "",
      file: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate form submission
    console.log("Form submitted:", values)
    // In a real app, you would handle file upload and data saving here
    toast({
      title: "Paper Uploaded",
      description: `"${values.title}" has been submitted.`,
    })
    form.reset()
    setFileName(null)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldChange: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      fieldChange(file);
      setFileName(file.name);
    } else {
      fieldChange(null);
      setFileName(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Research Paper</CardTitle>
        <CardDescription>Fill in the details and upload your research paper (PDF only).</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the paper title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe, Jane Smith" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of authors.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the paper abstract"
                      className="resize-none"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Paper (PDF)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                      onChange={(e) => handleFileChange(e, field.onChange)}
                      className="hidden" // Hide the default input
                      id="file-upload"
                      ref={field.ref}
                      name={field.name}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                   <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                     <Upload className="mr-2 h-4 w-4" /> {fileName ? `Selected: ${fileName}` : "Choose PDF File"}
                   </Button>
                  <FormDescription>
                    Max file size: 5MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Upload Paper
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
