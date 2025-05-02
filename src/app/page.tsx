import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadForm } from "@/components/research/upload-form"
import { SearchSection } from "@/components/research/search-section"

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="search">Search Papers</TabsTrigger>
          <TabsTrigger value="upload">Upload Paper</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SearchSection />
        </TabsContent>
        <TabsContent value="upload">
          <UploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
