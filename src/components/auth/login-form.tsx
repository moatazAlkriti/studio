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
import { useState } from 'react';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate authentication check
    setTimeout(() => {
      // Simple check for admin user
      if (values.username === 'admin' && values.password === 'admin') {
        toast({
          title: 'Login Successful',
          description: `Welcome, ${values.username}!`,
        });
        // Store login status and username (for header check)
        if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedInResearchHub', 'true');
            localStorage.setItem('researchHubUsername', values.username); // Store username
        }
        onLoginSuccess();
      } else {
        // Handle other users or invalid login
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password.',
        });
        form.setError('username', { type: 'manual', message: ' ' }); // Add error without specific message
        form.setError('password', { type: 'manual', message: 'Invalid credentials' });
        form.setValue('password', ''); // Clear password field
        // Clear stored username if login fails
        if (typeof window !== 'undefined') {
            localStorage.removeItem('researchHubUsername');
        }
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  }

  return (
    <Card className="w-full max-w-sm mx-auto animate-fade-in"> {/* Added subtle fade-in animation */}
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter username 'admin' and password 'admin' to access the Research Hub.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="admin" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full transition-transform duration-200 hover:scale-[1.02]" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" /> {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
