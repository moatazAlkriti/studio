
// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { StoredPaper } from "./paper-list"; // Import shared type
import { addNotification } from "@/lib/notifications"; // Import notification utility

// Define the shape of the data needed for the edit form
export type EditPaperData = Pick<StoredPaper, 'title' | 'authors' | 'abstract'>;

// Schema generation function for the edit form
const getEditFormSchema = (t: ReturnType<typeof useTranslations<'EditPaperForm'>>) => z.object({
  title: z.string().min(2, { message: t('paperTitleError') }),
  authors: z.string().min(2, { message: t('authorsError') }),
  abstract: z.string().min(10, { message: t('abstractError') }),
});

interface EditPaperFormProps {
  isOpen: boolean;
  onClose: () => void;
  paperData?: EditPaperData; // Make optional to handle initial state
  originalPaperId?: string; // Pass the original ID for notifications
  originalPaperTitle?: string; // Pass the original title for notifications
  onSave: (data: EditPaperData) => void;
}

export function EditPaperForm({
  isOpen,
  onClose,
  paperData,
  originalPaperId,
  originalPaperTitle,
  onSave
}: EditPaperFormProps) {
  const t = useTranslations('EditPaperForm');
  const tNotify = useTranslations('Notifications'); // Notification translations
  const [isSaving, setIsSaving] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null); // State for current user

  // Get current username on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUsername(localStorage.getItem('researchHubUsername'));
    }
  }, []);

  // Create schema with translations
  const formSchema = getEditFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: paperData || { title: "", authors: "", abstract: "" }, // Use default if no data provided initially
  });

  // Reset form when paperData changes (e.g., when opening the dialog with new data)
  useEffect(() => {
    if (paperData) {
      form.reset(paperData);
    } else {
      // Optionally reset to empty if dialog opens without data
      form.reset({ title: "", authors: "", abstract: "" });
    }
  }, [paperData, form, isOpen]); // Add isOpen to reset when dialog opens

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    // Simulate saving (in a real app, call an API)
    setTimeout(() => {
      onSave(values); // Pass the updated data back

      // Add notification for admin about the update
      if (originalPaperId && originalPaperTitle) {
        addNotification(
          tNotify('paperUpdatedMessage', {
              title: originalPaperTitle, // Use original title for reference
              username: currentUsername || tNotify('unknownUser'),
          }),
          'admin' // Send to admin
        );
      }

      setIsSaving(false);
      // Parent component handles closing on successful save
    }, 500); // Simulate network delay
  }

  // Handle dialog open state changes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(); // Call the onClose handler when the dialog is closed
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl"> {/* Adjust width */}
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>{t('dialogDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paperTitleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('paperTitlePlaceholder')} {...field} disabled={isSaving}/>
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
                    <Input placeholder={t('authorsPlaceholder')} {...field} disabled={isSaving}/>
                  </FormControl>
                  <FormDescription>{t('authorsDescription')}</FormDescription>
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
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
               <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    {t('cancelButton')}
                  </Button>
               </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSaving ? t('savingButton') : t('saveButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
