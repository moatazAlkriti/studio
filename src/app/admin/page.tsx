import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

// Placeholder data structures - replace with actual data fetching and types
interface PaperCategory {
  id: string;
  name: string;
  paperCount: number;
}

interface ResearchPaperAdmin {
  id: string;
  title: string;
  category?: string;
  accessLevel: 'public' | 'private';
}

const dummyCategories: PaperCategory[] = [
  { id: 'cs', name: 'Computer Science', paperCount: 15 },
  { id: 'bio', name: 'Biology', paperCount: 8 },
  { id: 'phy', name: 'Physics', paperCount: 12 },
];

const dummyPapers: ResearchPaperAdmin[] = [
  { id: '1', title: 'Paper Title One', category: 'Computer Science', accessLevel: 'public' },
  { id: '2', title: 'Another Research Paper', category: 'Biology', accessLevel: 'private' },
  { id: '3', title: 'Study on AI Ethics', category: 'Computer Science', accessLevel: 'public' },
];

export default function AdminPage() {
  // In a real app, you'd fetch categories and papers,
  // and implement forms/actions to manage them.

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center">
        <ShieldCheck className="mr-2 h-6 w-6 text-primary" /> Admin Dashboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Add, edit, or remove research disciplines.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for category management UI */}
          <p className="text-muted-foreground italic">Category management functionality to be implemented here.</p>
          <ul className="mt-4 space-y-2">
            {dummyCategories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center p-2 border rounded">
                <span>{cat.name}</span>
                <span className="text-sm text-muted-foreground">{cat.paperCount} papers</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Papers & Access Control</CardTitle>
          <CardDescription>Set categories and access levels for uploaded papers.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for paper management UI */}
           <p className="text-muted-foreground italic">Paper categorization and access control functionality to be implemented here.</p>
           <ul className="mt-4 space-y-2">
             {dummyPapers.map(paper => (
               <li key={paper.id} className="flex justify-between items-center p-2 border rounded">
                 <span>{paper.title}</span>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{paper.category || 'Uncategorized'}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${paper.accessLevel === 'public' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {paper.accessLevel}
                    </span>
                 </div>
               </li>
             ))}
           </ul>
        </CardContent>
      </Card>
    </div>
  );
}
