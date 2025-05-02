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
  file: z.any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, t('fileSizeError'))
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      t('fileTypeError')
    ),
});

export function UploadForm() {
  const t = useTranslations('UploadForm');
  const { toast } = useToast()
  const [fileName, setFileName] = useState<string | null>(null);

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate form submission
    console.log("Form submitted:", values)
    // In a real app, you would handle file upload and data saving here
    toast({
      title: t('uploadSuccessTitle'),
      description: t('uploadSuccessDescription', { title: values.title }),
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
                    <Input placeholder={t('paperTitlePlaceholder')} {...field} />
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
                    <Input placeholder={t('authorsPlaceholder')} {...field} />
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
                  <FormLabel>{t('fileLabel')}</FormLabel>
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
                     <Upload className="mr-2 h-4 w-4" /> {fileName ? t('selectedFileButton', { fileName }) : t('chooseFileButton')}
                   </Button>
                  <FormDescription>
                    {t('fileDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <Upload className="mr-2 h-4 w-4" /> {t('uploadButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
