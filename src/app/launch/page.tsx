"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Palette, Sparkles } from "lucide-react";
import Link from 'next/link';

export default function LaunchPage() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    // Simulate email submission
    console.log("Email submitted:", email);
    toast({
      title: "Thank You!",
      description: "You've been added to our launch list. We'll notify you!",
      className: "bg-accent text-accent-foreground"
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-primary/20 p-4 text-center">
      <div className="max-w-2xl w-full bg-card p-8 md:p-12 rounded-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <Palette className="h-16 w-16 text-primary" />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">
          ImageGen<span className="text-primary">AI</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-2">
          Unleash the full potential of AI image generation.
        </p>
        <p className="text-foreground text-md md:text-lg mb-8">
          Our AI-powered tool refines your prompts to create stunning, hyper-realistic images.
          Get ready for extreme detail, realistic imperfections, and mind-blowing results.
        </p>
        
        <Sparkles className="mx-auto h-10 w-10 text-accent animate-pulse mb-8" />

        <h2 className="font-headline text-2xl font-semibold mb-4 text-primary">Launching Soon!</h2>
        <p className="text-muted-foreground mb-6">
          Enter your email below to be the first to know when we launch and get exclusive early access benefits.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-grow text-base"
            aria-label="Email address"
          />
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground sm:w-auto whitespace-nowrap">
            <Mail className="mr-2 h-5 w-5" />
            Notify Me
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          We respect your privacy. No spam, ever.
        </p>
      </div>
      <Link href="/" className="mt-12 text-sm text-primary hover:underline font-medium">
          Go to App (Development Preview)
      </Link>
       <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ImageGenAI. All rights reserved.</p>
      </div>
    </div>
  );
}
