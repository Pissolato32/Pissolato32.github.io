
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, CreditCard, Palette, LogOut, LogIn, ShieldCheck, Award, UserCheck as UserIcon, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/firebase/clientApp"; 
import { useToast } from "@/hooks/use-toast";

export const ADMIN_EMAILS = ['rodrigopissolato@gmail.com'];
type UserClientRole = 'GUEST' | 'PRO' | 'ADMIN';

export function AppHeader() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserClientRole>('GUEST');
  const [creditsText, setCreditsText] = useState("Login for 10 trial credits!"); 

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (ADMIN_EMAILS.includes(currentUser.email || "")) {
          setUserRole('ADMIN');
          setCreditsText("Credits: Unlimited");
        } else {
          setUserRole('PRO'); 
          setCreditsText("Credits: 500"); 
        }
      } else {
        setUserRole('GUEST'); 
        setCreditsText("Login for 10 trial credits!");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Logged In",
        description: "Successfully signed in with Google.",
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string }; 
        if (firebaseError.code === 'auth/popup-blocked') {
          toast({ 
            title: "Login Error: Popup Blocked", 
            description: "Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.", 
            variant: "destructive",
            duration: 9000,
          });
        } else if (firebaseError.code === 'auth/cancelled-popup-request') {
          toast({ 
            title: "Login Cancelled", 
            description: "The Google sign-in popup was closed before completing. If this was unintentional, please try again.",
            variant: "default" 
          });
        } else {
          toast({ 
            title: "Login Error", 
            description: `Could not sign in with Google. Error: ${firebaseError.message || firebaseError.code}`, 
            variant: "destructive" 
          });
        }
      } else {
        toast({ 
          title: "Login Error", 
          description: "An unknown error occurred while trying to sign in with Google. Please try again.", 
          variant: "destructive" 
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "Successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Error", description: "Could not sign out. Please try again.", variant: "destructive" });
    }
  };

  const getRoleBadge = () => {
    if (userRole === 'ADMIN') {
      return (
        <Badge variant="outline" className="text-red-500 border-red-500 flex items-center gap-1 px-2 py-0.5">
          <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" /> Admin
        </Badge>
      );
    }
    if (userRole === 'PRO') {
      return (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500 flex items-center gap-1 px-2 py-0.5">
          <Award className="h-3 w-3 sm:h-4 sm:w-4" /> Pro
        </Badge>
      );
    }
    return (
        <Badge variant="outline" className="text-gray-500 border-gray-500 flex items-center gap-1 px-2 py-0.5">
          <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" /> Guest
        </Badge>
    ); 
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg">ImageGenAI</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-1">
           <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
             Pricing
           </Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            {getRoleBadge()}
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className={userRole === 'GUEST' ? "text-muted-foreground" : "text-primary"}>{creditsText}</span>
            </div>
          </div>
          
          {user ? (
            <>
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] lg:max-w-[150px]" title={user.displayName || user.email || undefined}>
                {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2" onClick={handleLogin}>
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                 <span className="hidden sm:inline">Login</span>
                 <span className="sm:hidden">Login</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


    