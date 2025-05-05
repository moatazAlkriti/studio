
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Info, Target, UploadCloud, Search, Users, ShieldCheck, Group } from "lucide-react"; // Added Group icon

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  return (
    <div className="space-y-8">
      {/* Added animation and hover effect */}
      <Card className="transition-shadow duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Info className="mr-2 h-6 w-6 text-primary" />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Target className="mr-2 h-5 w-5 text-secondary-foreground" />
              {t('missionTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('missionText')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
             <Users className="mr-2 h-5 w-5 text-secondary-foreground" />
             {t('featuresTitle')}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <UploadCloud className="h-4 w-4 mr-2 mt-1 text-accent flex-shrink-0" />
                <span>{t('featureUpload')}</span>
              </li>
              <li className="flex items-start">
                <Search className="h-4 w-4 mr-2 mt-1 text-accent flex-shrink-0" />
                <span>{t('featureSearch')}</span>
              </li>
              <li className="flex items-start">
                 <ShieldCheck className="h-4 w-4 mr-2 mt-1 text-accent flex-shrink-0" /> {/* Re-using ShieldCheck from admin */}
                 <span>{t('featureAdmin')}</span>
              </li>
            </ul>
          </section>

          {/* New Team Section */}
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Group className="mr-2 h-5 w-5 text-secondary-foreground" /> {/* Using Group icon */}
              {t('teamTitle')}
            </h2>
            <ul className="space-y-1 text-muted-foreground">
              <li>{t('teamMember1')}</li>
              <li>{t('teamMember2')}</li>
              <li>{t('teamMember3')}</li>
            </ul>
          </section>

          <section>
             <h2 className="text-xl font-semibold mb-3">{t('contactTitle')}</h2>
             <p className="text-muted-foreground">
               {t('contactText')} <a href="mailto:support@researchhub.com" className="text-primary underline hover:text-primary/80">support@researchhub.com</a>.
             </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

