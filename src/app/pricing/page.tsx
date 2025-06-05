
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase/clientApp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppHeader, ADMIN_EMAILS } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, LogIn, ShoppingCart } from 'lucide-react';

type UserClientRole = 'GUEST' | 'PRO' | 'ADMIN';

export default function PricingPage() {
  const { toast } = useToast();
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userClientRole, setUserClientRole] = useState<UserClientRole>('GUEST');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (ADMIN_EMAILS.includes(user.email || "")) {
          setUserClientRole('ADMIN');
        } else {
          setUserClientRole('PRO');
        }
      } else {
        setUserClientRole('GUEST');
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handlePurchasePro = async () => {
    if (userClientRole === 'GUEST') {
      toast({
        title: "Login Required",
        description: "Please log in to purchase the Pro plan.",
        variant: "destructive",
      });
      // In a real app, you might trigger the login flow here
      // For now, AppHeader's login button is the way.
      return;
    }

    if (userClientRole === 'ADMIN') {
      toast({
        title: "Admin Account",
        description: "Administrators already have full access.",
      });
      return;
    }

    // User is 'PRO'
    setIsProcessingPayment(true);
    toast({
      title: "Processing Purchase",
      description: "Simulating payment processing...",
    });

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsProcessingPayment(false);
    toast({
      title: "Purchase Successful!",
      description: "Welcome to Pro! Your (mock) credits have been applied. Refresh or check header.",
      className: "bg-accent text-accent-foreground",
      duration: 7000,
    });
    // In a real app, this is where you'd:
    // 1. Call a Firebase Function to create a Stripe Checkout session.
    // 2. Redirect the user to Stripe.
    // 3. Handle webhooks from Stripe on your backend to confirm payment and update user roles/credits in Firestore.
    // For this simulation, the AppHeader already updates credits based on 'PRO' role.
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">
            Upgrade Your Experience
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Unlock premium features, higher quality generation, and more with our Pro plan.
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-xl transform hover:scale-105 transition-transform duration-300">
            <CardHeader className="bg-primary/10 text-center">
              <div className="flex justify-center mb-3">
                <ShoppingCart className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl text-primary">Pro Plan</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                The best value for frequent users and professionals.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <span className="text-5xl font-bold">$10</span>
                <span className="text-muted-foreground">/ month (mock price)</span>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  "500 Generation Credits",
                  "Premium AI Model for Prompt Refinement",
                  "Highest Quality Image Generation",
                  "No Watermarks on Images",
                  "Full Access to Image Parameters (incl. Realism Enhancement)",
                  "AI-Powered Parameter Adjustment",
                  "Ability to Submit Detailed Feedback",
                  "Priority Support (Simulated)",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <AlertMessageForPayments />
            </CardContent>
            <CardFooter className="p-6">
              {userClientRole === 'ADMIN' ? (
                <Button className="w-full text-lg py-6" disabled>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Admin Access Active
                </Button>
              ) : userClientRole === 'PRO' && !isProcessingPayment ? (
                 <Button className="w-full text-lg py-6" disabled>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Pro Plan Active
                </Button>
                // Option to buy more credits could go here in future
              ) : (
                <Button
                  onClick={handlePurchasePro}
                  disabled={isProcessingPayment || userClientRole === 'ADMIN'}
                  className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isProcessingPayment ? (
                    "Processing..."
                  ) : userClientRole === 'GUEST' ? (
                    <>
                      <LogIn className="mr-2 h-5 w-5" /> Log In to Get Pro
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" /> Get Pro Access
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
            <Link href="/" className="text-primary hover:underline">
                Back to Image Generation
            </Link>
        </div>

      </main>
      <AppFooter />
    </div>
  );
}


function AlertMessageForPayments() {
    return (
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-sm text-blue-400/90">
            <p className="font-semibold mb-1">Note on Payments:</p>
            <p>
                This is a UI simulation. For a real application, clicking "Get Pro Access" would
                typically initiate a secure payment flow with a provider like Stripe (often via a Firebase Extension).
                Your backend would then confirm the payment and grant Pro access.
            </p>
        </div>
    );
}


    