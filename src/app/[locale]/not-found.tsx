'use client';

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation"; // Use the localized Link
import { useTranslations } from "next-intl";
import { FileQuestion } from "lucide-react"; // Example icon

export default function NotFound() {
  const t = useTranslations('NotFoundPage');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <FileQuestion className="w-16 h-16 text-primary mb-4 animate-bounce" />
      <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{t('description')}</p>
      <Button asChild>
        <Link href="/">{t('goHomeButton')}</Link>
      </Button>
    </div>
  );
}
