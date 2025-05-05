

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { addNotification } from '@/lib/notifications'; // Import the notification utility

// Schema generation function
const getFormSchema = (t: ReturnType<typeof useTranslations<'LoginPage'>>) => z.object({
  username: z.string().min(1, { message: t('usernameRequiredError') }),
  password: z.string().min(1, { message: t('passwordRequiredError') }),
});

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const t = useTranslations('LoginPage');
  const tNotify = useTranslations('Notifications'); // Notifications translations
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // State to ensure client-side execution

  useEffect(() => {
      setIsClient(true); // Set client state to true once mounted
  }, []);

  // Create schema with translations
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'user', // Default username
      password: 'user', // Default password
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate authentication check
    setTimeout(() => {
      // Check for 'user'/'user' or 'admin'/'admin'
      const isValidUser = (values.username === 'user' && values.password === 'user') ||
                          (values.username === 'admin' && values.password === 'admin');

      if (isValidUser) {
        // Wrap toast in setTimeout
        setTimeout(() => {
            toast({
              title: t('loginSuccessTitle'),
              description: t('loginSuccessDescription', { username: values.username }),
            });
        }, 0);
        // Store login status and username (for header check)
        if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedInResearchHub', 'true');
            localStorage.setItem('researchHubUsername', values.username); // Store username
        }

        // Add notification for admin if a non-admin user logs in
        if (values.username !== 'admin') {
          addNotification(
            tNotify('userLoggedInMessage', { username: values.username }),
            'admin' // Send to admin
          );
        }

        onLoginSuccess();
      } else {
        // Handle invalid login
        // Wrap toast in setTimeout
        setTimeout(() => {
            toast({
              variant: 'destructive',
              title: t('loginFailedTitle'),
              description: t('loginFailedDescription'),
            });
        }, 0);
        form.setError('username', { type: 'manual', message: ' ' }); // Add error without specific message
        form.setError('password', { type: 'manual', message: t('invalidCredentialsError') });
        form.setValue('password', ''); // Clear password field
        // Clear stored username if login fails
        if (typeof window !== 'undefined') {
            localStorage.removeItem('researchHubUsername');
        }
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  }

  // Only render the form on the client-side after hydration
  if (!isClient) {
      return null; // Or a loading spinner/skeleton
  }


  return (
    <Card className="w-full max-w-sm mx-auto animate-fade-in"> {/* Added subtle fade-in animation */}
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
            <Button type="submit" className="w-full transition-transform duration-200 hover:scale-[1.02]" disabled={isLoading}> {/* Added hover scale effect */}
              <LogIn className="mr-2 h-4 w-4" /> {isLoading ? t('loggingInButton') : t('loginButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
