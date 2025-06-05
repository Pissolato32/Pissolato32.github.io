
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase/clientApp';
import { ADMIN_EMAILS } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Lightbulb, Server, Users, DollarSign, AlertTriangle, DownloadCloud, MessageSquare } from 'lucide-react';
import type { SelfImproveRealismInput, SelfImproveRealismOutput, ImprovementSuggestion } from '@/ai/flows/self-improve-realism';
import { selfImproveRealism } from '@/ai/flows/self-improve-realism';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';

// Mock Data Removed - Will be empty until real data integration
const generationLogs: any[] = [];
const userPayments: any[] = [];

export default function AdminPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [improvementSuggestions, setImprovementSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [overallAssessment, setOverallAssessment] = useState<string>("");
  const [exampleFeedback, setExampleFeedback] = useState<string>("Some images look a bit blurry. Others have weird hands. The lighting is generally good but sometimes too dark for night scenes. I wish the prompts for animals were more detailed by default.");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (ADMIN_EMAILS.includes(user.email || '')) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/'); // Redirect non-admins
        }
      } else {
        setIsAuthorized(false);
        router.push('/'); // Redirect unauthenticated users
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleFetchImprovementSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setImprovementSuggestions([]);
    setOverallAssessment("");
    try {
      const input: SelfImproveRealismInput = {
        feedback: exampleFeedback,
        originalPrompt: "A general prompt that led to mixed results.",
        refinedPrompt: "An AI refined prompt that still got some negative feedback.",
        imageParameters: { cfgScale: 7, steps: 50, realismEnhancement: 0.5 },
      };
      const result: SelfImproveRealismOutput = await selfImproveRealism(input);
      if (result.success && result.improvementSuggestions) {
        setImprovementSuggestions(result.improvementSuggestions);
        setOverallAssessment(result.overallAssessment || "No overall assessment provided.");
        toast({ title: "Suggestions Ready", description: "AI has generated improvement suggestions." });
      } else {
        throw new Error(result.message || "Failed to get suggestions.");
      }
    } catch (error) {
      console.error("Error fetching improvement suggestions:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error", description: `Could not fetch suggestions: ${errorMessage}`, variant: "destructive" });
      setOverallAssessment(`Failed to load suggestions: ${errorMessage}`);
    }
    setIsLoadingSuggestions(false);
  };

  if (isAuthorized === null) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading authorization...</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Access Denied. Redirecting...</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Admin Panel</CardTitle>
            <CardDescription>Manage and monitor ImageGenAI.</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="improvements" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="improvements" className="text-sm sm:text-base"><Lightbulb className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Improvement Hub</TabsTrigger>
            <TabsTrigger value="logs" className="text-sm sm:text-base"><Server className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />Generation Logs</TabsTrigger>
            <TabsTrigger value="payments" className="text-sm sm:text-base"><DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />User Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Lightbulb className="mr-2 text-primary" />AI-Powered Improvement Hub</CardTitle>
                <CardDescription>
                  The AI analyzes (simulated) user feedback and suggests improvements for the image generation system.
                  Review these suggestions and then instruct the AI Assistant in Firebase Studio to implement the code changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="exampleFeedback" className="font-semibold">Example Aggregated Feedback (Used by AI for Suggestions):</Label>
                  <Textarea
                    id="exampleFeedback"
                    value={exampleFeedback}
                    onChange={(e) => setExampleFeedback(e.target.value)}
                    rows={4}
                    className="mt-1 bg-muted/30"
                    placeholder="Enter sample aggregated feedback here..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">This text simulates aggregated feedback the AI would analyze.</p>
                </div>
                <Button onClick={handleFetchImprovementSuggestions} disabled={isLoadingSuggestions}>
                  <DownloadCloud className="mr-2 h-5 w-5" />
                  {isLoadingSuggestions ? 'Generating Suggestions...' : 'Generate/Refresh AI Suggestions'}
                </Button>

                {overallAssessment && (
                  <Alert variant={improvementSuggestions.length > 0 ? "default" : "destructive"}>
                    <MessageSquare className="h-4 w-4" />
                    <AlertTitle>AI Overall Assessment</AlertTitle>
                    <AlertDescription>{overallAssessment}</AlertDescription>
                  </Alert>
                )}

                {improvementSuggestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mt-6">Improvement Suggestions:</h3>
                    {improvementSuggestions.map((suggestion, index) => (
                      <Card key={index} className="bg-card/50 border-border">
                        <CardHeader>
                          <CardTitle className="text-lg">{suggestion.areaToImprove}</CardTitle>
                          <CardDescription>Potential Impact: {suggestion.potentialImpact}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p><span className="font-semibold">Current Problem/Approach:</span> {suggestion.currentApproachOrProblem}</p>
                          <p><span className="font-semibold text-primary">Suggested Change:</span> {suggestion.suggestedChange}</p>
                          <p><span className="font-semibold">Rationale:</span> {suggestion.reasoning}</p>
                        </CardContent>
                      </Card>
                    ))}
                     <Alert variant="default" className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Action Required by Admin</AlertTitle>
                        <AlertDescription>
                            To apply these improvements, please copy the relevant "Suggested Change" and rationale,
                            then paste it into the chat with the AI Assistant (Firebase Studio).
                            Explicitly ask the assistant to modify the application code (e.g., update prompt templates in specific Genkit flows, adjust default parameters, etc.) based on these suggestions.
                            The AI Assistant will then generate the code changes for you.
                        </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Server className="mr-2 text-primary" />Generation Logs</CardTitle>
                <CardDescription>Displays image generation activity. Real implementation requires database integration.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Image</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generationLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No generation logs available.</TableCell>
                      </TableRow>
                    ) : (
                      generationLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.timestamp}</TableCell>
                          <TableCell>{log.userId}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.prompt}</TableCell>
                          <TableCell>{log.credits}</TableCell>
                          <TableCell><img src={log.imageUrl} alt="thumbnail" className="h-10 w-10 object-cover rounded" data-ai-hint="thumbnail image" /></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableCaption>Image generation logs. For demonstration purposes until database integration.</TableCaption>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><DollarSign className="mr-2 text-primary" />User Payments</CardTitle>
                <CardDescription>Displays user payment activity. Real implementation requires a payment gateway and database.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No payment records available.</TableCell>
                      </TableRow>
                    ) : (
                      userPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.userId}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{payment.plan}</TableCell>
                          <TableCell>{payment.status}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableCaption>User payment records. For demonstration purposes until payment gateway integration.</TableCaption>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <AppFooter />
    </div>
  );
}
