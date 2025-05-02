'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Users, UserPlus, Trash2 } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

// --- Data Structures ---

// Category data (remains the same)
interface PaperCategory {
  id: string;
  name: string;
  paperCount: number;
}

// Paper data (remains the same)
interface ResearchPaperAdmin {
  id: string;
  title: string;
  category?: string;
  accessLevel: 'public' | 'private';
}

// NEW: User data structure
interface ManagedUser {
  id: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer'; // Example roles
}

// --- Dummy Data ---

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

// Initial dummy users - IMPORTANT: Do not include the default 'admin' here unless you want it deletable
const initialUsers: ManagedUser[] = [
  { id: 'user-1', username: 'jane.doe', role: 'editor' },
  { id: 'user-2', username: 'john.smith', role: 'viewer' },
];

// --- Zod Schema for Add User Form ---
const getAddUserSchema = (t: ReturnType<typeof useTranslations<'AdminPage'>>) => z.object({
  username: z.string().min(3, { message: t('usernameError') }),
  password: z.string().min(6, { message: t('passwordError') }),
});

// --- Admin Page Component ---

export default function AdminPage() {
  const t = useTranslations('AdminPage');
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Dynamically create the schema with translations
  const addUserSchema = getAddUserSchema(t);

  // --- Add User Form Handling ---
  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onAddUserSubmit(values: z.infer<typeof addUserSchema>) {
    setIsAddingUser(true);
    // Simulate adding user (in a real app, call an API)
    setTimeout(() => {
      const newUser: ManagedUser = {
        id: `user-${Date.now()}`, // Simple unique ID generation
        username: values.username,
        role: 'viewer', // Default role for newly added users
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
      toast({
        title: t('userAddedTitle'),
        description: t('userAddedDescription', { username: values.username }),
      });
      addUserForm.reset();
      setIsAddingUser(false);
    }, 500); // Simulate network delay
  }

  // --- Delete User Handling ---
  const handleDeleteUser = (userId: string, username: string) => {
    // Simulate deletion (in a real app, call an API)
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({
      title: t('userDeletedTitle'),
      description: t('userDeletedDescription', { username }),
      variant: 'destructive'
    });
  };

  // --- Render ---
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold flex items-center">
           <ShieldCheck className="mr-2 h-6 w-6 text-primary animate-pulse" /> {t('dashboardTitle')}
         </h1>
         {/* Add maybe a settings button or other global admin actions here */}
      </div>


      {/* Manage Users Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> {t('manageUsersTitle')}</CardTitle>
          <CardDescription>{t('manageUsersDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add User Form */}
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4 p-4 border rounded-md bg-muted/50">
               <h3 className="text-lg font-semibold flex items-center mb-2">
                  <UserPlus className="mr-2 h-4 w-4"/> {t('addNewUserTitle')}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <FormField
                    control={addUserForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('usernameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('usernamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addUserForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('passwordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('passwordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <Button type="submit" disabled={isAddingUser} className="w-full md:w-auto transition-colors duration-200">
                   {isAddingUser ? t('addingUserButton') : t('addUserButton')}
                 </Button>
               </div>
            </form>
          </Form>

          <Separator />

          {/* User List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('currentUsersTitle')}</h3>
            {users.length > 0 ? (
              <ul className="space-y-3">
                {users.map(user => (
                  <li key={user.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50">
                    <div className="flex flex-col">
                       <span className="font-medium">{user.username}</span>
                       <span className="text-sm text-muted-foreground capitalize">{user.role}</span>
                    </div>
                    {/* Add Edit button later if needed */}
                    <Button
                       variant="ghost"
                       size="icon"
                       className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                       onClick={() => handleDeleteUser(user.id, user.username)}
                       aria-label={t('deleteUserLabel', { username: user.username })}
                    >
                       <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-center py-4">{t('noUsersFound')}</p>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Existing Manage Categories Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{t('manageCategoriesTitle')}</CardTitle>
          <CardDescription>{t('manageCategoriesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">{t('categoryManagementPlaceholder')}</p>
          <ul className="mt-4 space-y-2">
            {dummyCategories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50">
                <span>{cat.name}</span>
                <span className="text-sm text-muted-foreground">{t('papersCount', { count: cat.paperCount })}</span>
                {/* Add Edit/Delete buttons if needed */}
              </li>
            ))}
          </ul>
          {/* Add form for adding/editing categories */}
        </CardContent>
      </Card>

      {/* Existing Manage Papers Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{t('managePapersTitle')}</CardTitle>
          <CardDescription>{t('managePapersDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground italic">{t('paperManagementPlaceholder')}</p>
           <ul className="mt-4 space-y-3">
             {dummyPapers.map(paper => (
               <li key={paper.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50">
                 <span className="flex-1 mr-4 truncate">{paper.title}</span>
                 <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-sm text-muted-foreground hidden sm:inline">{paper.category || t('uncategorized')}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${paper.accessLevel === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {t(paper.accessLevel === 'public' ? 'publicAccess' : 'privateAccess')}
                    </span>
                    {/* Add Edit/Permissions buttons if needed */}
                 </div>
               </li>
             ))}
           </ul>
           {/* Add form/controls for managing papers */}
        </CardContent>
      </Card>
    </div>
  );
}
