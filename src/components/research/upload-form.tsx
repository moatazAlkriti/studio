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
import { Upload, Loader2 } from "lucide-react" // Added Loader2
import { useState, type ChangeEvent } from "react"
import { useTranslations } from "next-intl";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

// Schema generation function
const getFormSchema = (t: ReturnType<typeof useTranslations<'UploadForm'>>) => z.object({
  title: z.string().min(2, {
    message: t('paperTitleError'),
  }),
  authors: z.string().min(2, {
    message: t('authorsError'),
  }).describe(t('authorsDescription')), // Adding description for potential tooltips or hints
  abstract: z.string().min(10, {
    message: t('abstractError'),
  }),
  // Use refine for file validation as `any` doesn't allow direct chaining
  file: z.any()
    .refine((files) => files?.[0], t('fileRequiredError')) // Check if file exists
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, t('fileSizeError'))
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      t('fileTypeError')
    ),
});

// Type for paper data stored in localStorage
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


export function UploadForm() {
  const t = useTranslations('UploadForm');
  const { toast } = useToast()
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // Create schema with translations
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      authors: "",
      abstract: "",
      file: undefined,
    },
  })

  // Function to read file as Data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
      });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    const file = values.file?.[0]; // Get the File object

    if (!file) {
        // This should ideally be caught by validation, but good to double-check
        toast({
            variant: "destructive",
            title: t('uploadErrorTitle'),
            description: t('fileRequiredError'),
        });
        setIsUploading(false);
        return;
    }

    try {
        const fileDataUrl = await readFileAsDataURL(file);

        const newPaper: StoredPaper = {
            id: `paper-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // More unique ID
            title: values.title,
            authors: values.authors,
            abstract: values.abstract,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileDataUrl: fileDataUrl, // Store the file content
            uploadDate: new Date().toISOString(),
        };

        // Save to localStorage
        const existingPapersJSON = localStorage.getItem('researchHubPapers');
        const existingPapers: StoredPaper[] = existingPapersJSON ? JSON.parse(existingPapersJSON) : [];
        existingPapers.push(newPaper);
        localStorage.setItem('researchHubPapers', JSON.stringify(existingPapers));


        toast({
            title: t('uploadSuccessTitle'),
            description: t('uploadSuccessDescription', { title: values.title }),
        });
        form.reset();
        setFileName(null);

    } catch (error) {
        console.error("Error uploading file:", error);
        toast({
            variant: "destructive",
            title: t('uploadErrorTitle'),
            description: t('uploadErrorDescription'), // Generic error message
        });
    } finally {
        setIsUploading(false);
    }
  }

  // Use field.onChange provided by react-hook-form
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Pass the FileList to the form field
      form.setValue('file', e.target.files, { shouldValidate: true });
    } else {
      setFileName(null);
      form.setValue('file', null, { shouldValidate: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paperTitleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('paperTitlePlaceholder')} {...field} disabled={isUploading}/>
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
                  <FormLabel>{t('authorsLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('authorsPlaceholder')} {...field} disabled={isUploading}/>
                  </FormControl>
                  <FormDescription>
                    {t('authorsDescription')}
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
                  <FormLabel>{t('abstractLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('abstractPlaceholder')}
                      className="resize-none"
                      {...field}
                      rows={5}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="file"
              // No render prop needed here as we handle it manually
              render={({ field }) => ( // Use render prop to get field state
                 <FormItem>
                  <FormLabel>{t('fileLabel')}</FormLabel>
                  <FormControl>
                     {/* We keep the hidden input for react-hook-form to register */}
                     <Input
                       type="file"
                       accept={ACCEPTED_FILE_TYPES.join(",")}
                       onChange={handleFileChange} // Use our custom handler
                       className="hidden"
                       id="file-upload"
                       ref={field.ref} // Important: Assign ref
                       name={field.name} // Important: Assign name
                       onBlur={field.onBlur} // Important: Assign onBlur
                       disabled={isUploading}
                     />
                  </FormControl>
                   <Button
                     type="button"
                     variant="outline"
                     className="w-full"
                     onClick={() => document.getElementById('file-upload')?.click()}
                     disabled={isUploading}
                    >
                     <Upload className="mr-2 h-4 w-4" /> {fileName ? t('selectedFileButton', { fileName }) : t('chooseFileButton')}
                   </Button>
                  <FormDescription>
                    {t('fileDescription')}
                  </FormDescription>
                  {/* Display error message */}
                  <FormMessage />
                 </FormItem>
               )}
            />
            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? t('uploadingButton') : t('uploadButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
