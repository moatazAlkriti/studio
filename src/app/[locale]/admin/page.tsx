

// @ts-nocheck
'use client';

import { useState, useEffect } from 'react'; // Added useEffect
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
import { ShieldCheck, Users, UserPlus, Trash2, UserCheck } from "lucide-react"; // Added UserCheck
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { addNotification } from '@/lib/notifications'; // Import notification utility

// --- Data Structures ---

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

interface ManagedUser {
  id: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface SupervisingDoctor {
  id: string;
  name: string;
  department: string;
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

const initialUsers: ManagedUser[] = [
  { id: 'user-1', username: 'jane.doe', role: 'editor' },
  { id: 'user-2', username: 'john.smith', role: 'viewer' },
];

const initialSupervisors: SupervisingDoctor[] = [
    { id: 'doc-1', name: 'Dr. Alice Williams', department: 'Computer Science'},
    { id: 'doc-2', name: 'Dr. Bob Davis', department: 'Biology' },
];

// --- Zod Schemas ---

const getAddUserSchema = (t: ReturnType<typeof useTranslations<'AdminPage'>>) => z.object({
  username: z.string().min(3, { message: t('usernameError') }),
  password: z.string().min(6, { message: t('passwordError') }),
});

const getAddSupervisorSchema = (t: ReturnType<typeof useTranslations<'AdminPage'>>) => z.object({
    name: z.string().min(5, { message: t('supervisorNameError') }),
    department: z.string().min(2, { message: t('departmentError') }),
});

// --- Admin Page Component ---

export default function AdminPage() {
  const t = useTranslations('AdminPage');
  const tNotify = useTranslations('Notifications'); // Notification translations
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [supervisors, setSupervisors] = useState<SupervisingDoctor[]>(initialSupervisors);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingSupervisor, setIsAddingSupervisor] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null); // State for current admin user

  // Get current admin username on mount
  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      setCurrentUsername(localStorage.getItem('researchHubUsername'));
    }
  }, []);

  // Schemas with translations
  const addUserSchema = getAddUserSchema(t);
  const addSupervisorSchema = getAddSupervisorSchema(t);

  // --- Add User Form Handling ---
  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { username: '', password: '' },
  });

  function onAddUserSubmit(values: z.infer<typeof addUserSchema>) {
    setIsAddingUser(true);
    setTimeout(() => {
      const newUser: ManagedUser = {
        id: `user-${Date.now()}`,
        username: values.username,
        role: 'viewer', // Default role, can be adjusted
      };
      setUsers(prevUsers => [...prevUsers, newUser]);

      // Add notification for admin
      addNotification(
        tNotify('userAddedMessage', {
          username: newUser.username,
          adminUsername: currentUsername || tNotify('unknownUser')
        }),
        'admin' // Send only to admin (or maybe 'all' if desired)
      );

      // Wrap toast in setTimeout
      setTimeout(() => {
          toast({
              title: t('userAddedTitle'),
              description: t('userAddedDescription', { username: values.username }),
          });
      }, 0);
      addUserForm.reset();
      setIsAddingUser(false);
    }, 500);
  }

  // --- Delete User Handling ---
  const handleDeleteUser = (userId: string, username: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

    // Add notification for admin
    addNotification(
      tNotify('userDeletedMessage', {
        username: username,
        adminUsername: currentUsername || tNotify('unknownUser')
      }),
      'admin' // Send only to admin
    );

    // Wrap toast in setTimeout
    setTimeout(() => {
        toast({
          title: t('userDeletedTitle'),
          description: t('userDeletedDescription', { username }),
          variant: 'destructive'
        });
    }, 0);
  };

  // --- Add Supervisor Form Handling ---
  const addSupervisorForm = useForm<z.infer<typeof addSupervisorSchema>>({
      resolver: zodResolver(addSupervisorSchema),
      defaultValues: { name: '', department: '' },
  });

  function onAddSupervisorSubmit(values: z.infer<typeof addSupervisorSchema>) {
      setIsAddingSupervisor(true);
      setTimeout(() => {
          const newSupervisor: SupervisingDoctor = {
              id: `doc-${Date.now()}`,
              name: values.name,
              department: values.department,
          };
          setSupervisors(prev => [...prev, newSupervisor]);

          // Add notification for admin
          addNotification(
            tNotify('supervisorAddedMessage', {
              name: newSupervisor.name,
              adminUsername: currentUsername || tNotify('unknownUser')
            }),
            'admin' // Send only to admin
          );

          // Wrap toast in setTimeout
          setTimeout(() => {
              toast({
                  title: t('supervisorAddedTitle'),
                  description: t('supervisorAddedDescription', { name: values.name }),
              });
          }, 0);
          addSupervisorForm.reset();
          setIsAddingSupervisor(false);
      }, 500);
  }

  // --- Delete Supervisor Handling ---
  const handleDeleteSupervisor = (supervisorId: string, name: string) => {
      setSupervisors(prev => prev.filter(doc => doc.id !== supervisorId));

      // Add notification for admin
      addNotification(
        tNotify('supervisorDeletedMessage', {
          name: name,
          adminUsername: currentUsername || tNotify('unknownUser')
        }),
        'admin' // Send only to admin
      );

      // Wrap toast in setTimeout
      setTimeout(() => {
          toast({
              title: t('supervisorDeletedTitle'),
              description: t('supervisorDeletedDescription', { name }),
              variant: 'destructive',
          });
      }, 0);
  };


  // --- Render ---
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold flex items-center">
           <ShieldCheck className="mr-2 h-6 w-6 text-primary animate-pulse" /> {t('dashboardTitle')}
         </h1>
      </div>

      {/* Manage Users Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg animate-fade-in"> {/* Added animation */}
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
                          <Input placeholder={t('usernamePlaceholder')} {...field} disabled={isAddingUser}/>
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
                          <Input type="password" placeholder={t('passwordPlaceholder')} {...field} disabled={isAddingUser}/>
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
                  <li key={user.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50"> {/* Added hover effect */}
                    <div className="flex flex-col">
                       <span className="font-medium">{user.username}</span>
                       <span className="text-sm text-muted-foreground capitalize">{user.role}</span>
                    </div>
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

      {/* Manage Supervisors Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg animate-fade-in"> {/* Added animation */}
          <CardHeader>
              <CardTitle className="flex items-center"><UserCheck className="mr-2 h-5 w-5" /> {t('manageSupervisorsTitle')}</CardTitle>
              <CardDescription>{t('manageSupervisorsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {/* Add Supervisor Form */}
              <Form {...addSupervisorForm}>
                  <form onSubmit={addSupervisorForm.handleSubmit(onAddSupervisorSubmit)} className="space-y-4 p-4 border rounded-md bg-muted/50">
                      <h3 className="text-lg font-semibold flex items-center mb-2">
                          <UserPlus className="mr-2 h-4 w-4" /> {t('addNewSupervisorTitle')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <FormField
                              control={addSupervisorForm.control}
                              name="name"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{t('supervisorNameLabel')}</FormLabel>
                                      <FormControl>
                                          <Input placeholder={t('supervisorNamePlaceholder')} {...field} disabled={isAddingSupervisor}/>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={addSupervisorForm.control}
                              name="department"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{t('departmentLabel')}</FormLabel>
                                      <FormControl>
                                          <Input placeholder={t('departmentPlaceholder')} {...field} disabled={isAddingSupervisor}/>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <Button type="submit" disabled={isAddingSupervisor} className="w-full md:w-auto transition-colors duration-200">
                              {isAddingSupervisor ? t('addingSupervisorButton') : t('addSupervisorButton')}
                          </Button>
                      </div>
                  </form>
              </Form>

              <Separator />

              {/* Supervisor List */}
              <div>
                  <h3 className="text-lg font-semibold mb-4">{t('currentSupervisorsTitle')}</h3>
                  {supervisors.length > 0 ? (
                      <ul className="space-y-3">
                          {supervisors.map(doc => (
                              <li key={doc.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50"> {/* Added hover effect */}
                                  <div className="flex flex-col">
                                      <span className="font-medium">{doc.name}</span>
                                      <span className="text-sm text-muted-foreground">{doc.department}</span>
                                  </div>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                      onClick={() => handleDeleteSupervisor(doc.id, doc.name)}
                                      aria-label={t('deleteSupervisorLabel', { name: doc.name })}
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="text-muted-foreground italic text-center py-4">{t('noSupervisorsFound')}</p>
                  )}
              </div>
          </CardContent>
      </Card>

      {/* Manage Categories Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg animate-fade-in"> {/* Added animation */}
        <CardHeader>
          <CardTitle>{t('manageCategoriesTitle')}</CardTitle>
          <CardDescription>{t('manageCategoriesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">{t('categoryManagementPlaceholder')}</p>
          <ul className="mt-4 space-y-2">
            {dummyCategories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50"> {/* Added hover effect */}
                <span>{cat.name}</span>
                <span className="text-sm text-muted-foreground">{t('papersCount', { count: cat.paperCount })}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Manage Papers Card */}
      <Card className="transition-shadow duration-300 hover:shadow-lg animate-fade-in"> {/* Added animation */}
        <CardHeader>
          <CardTitle>{t('managePapersTitle')}</CardTitle>
          <CardDescription>{t('managePapersDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground italic">{t('paperManagementPlaceholder')}</p>
           <ul className="mt-4 space-y-3">
             {dummyPapers.map(paper => (
               <li key={paper.id} className="flex justify-between items-center p-3 border rounded-md transition-colors duration-200 hover:bg-secondary/50"> {/* Added hover effect */}
                 <span className="flex-1 mr-4 truncate">{paper.title}</span>
                 <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-sm text-muted-foreground hidden sm:inline">{paper.category || t('uncategorized')}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${paper.accessLevel === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {t(paper.accessLevel === 'public' ? 'publicAccess' : 'privateAccess')}
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
