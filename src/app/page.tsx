
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, SlidersHorizontal, Star, Lock, Wand2, Download, Edit3, Share2, Copy, Image as ImageIcon, UserCheck, Award, ShieldAlert, LogIn, Settings } from "lucide-react";
import { AppHeader, ADMIN_EMAILS } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { StarRatingInput } from "@/components/StarRatingInput";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/firebase/clientApp";

import type { RefinePromptInput, RefinePromptOutput, UserRole as AiUserRole } from "@/ai/flows/refine-prompt";
import { refinePrompt } from "@/ai/flows/refine-prompt";
import type { AdjustImageParametersInput, AdjustImageParametersOutput } from "@/ai/flows/adjust-image-parameters";
import { adjustImageParameters } from "@/ai/flows/adjust-image-parameters";
import type { SelfImproveRealismInput } from "@/ai/flows/self-improve-realism";
import { selfImproveRealism } from "@/ai/flows/self-improve-realism";
import type { GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-image-flow";
import { generateImage } from "@/ai/flows/generate-image-flow";


interface ImageParameters {
  cfgScale: number;
  steps: number;
  realismEnhancement: number;
  [key: string]: number;
}

type UserClientRole = 'GUEST' | 'PRO' | 'ADMIN';

const defaultParameters: ImageParameters = {
  cfgScale: 7.5,
  steps: 50,
  realismEnhancement: 0.8,
};

const getAiHintFromPrompt = (promptText: string): string => {
  if (!promptText) return "placeholder image";
  const words = promptText.toLowerCase().match(/\b(\w+)\b/g);
  if (!words || words.length === 0) return "placeholder image";
  if (words.length === 1) return words[0];
  return words.slice(0, 2).join(" ");
};

export default function ImageGenAIPage() {
  const { toast } = useToast();
  const auth = getAuth(app);

  const [userPrompt, setUserPrompt] = useState<string>("beautiful woman, realistic, taking selfie in the gym");
  const [originalPromptForDisplay, setOriginalPromptForDisplay] = useState<string>("");
  const [refinedPrompt, setRefinedPrompt] = useState<string>("");
  const [refinementModelUsed, setRefinementModelUsed] = useState<string>("");
  
  const [isProcessingPrompt, setIsProcessingPrompt] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

  const [imageUrl, setImageUrl] = useState<string>("https://placehold.co/768x768.png");
  const [imageParameters, setImageParameters] = useState<ImageParameters>(defaultParameters);
  const [parameterFeedback, setParameterFeedback] = useState<string>("");
  const [isAdjustingParams, setIsAdjustingParams] = useState<boolean>(false);

  const [rating, setRating] = useState<number>(0);
  const [writtenFeedback, setWrittenFeedback] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userClientRole, setUserClientRole] = useState<UserClientRole>('GUEST');


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

  const getAiRoleForFlow = (): AiUserRole => {
    if (userClientRole === 'ADMIN') return 'ADMIN';
    if (userClientRole === 'PRO') return 'PRO';
    return 'FREE'; // GUEST maps to FREE for AI flows
  };

  const handleGenerateImage = async () => {
    if (!userPrompt.trim()) {
      toast({ title: "Error", description: "Please enter a prompt.", variant: "destructive" });
      return;
    }
    setIsProcessingPrompt(true);
    setIsLoadingImage(true);
    setOriginalPromptForDisplay(userPrompt);
    setRefinedPrompt("");
    setRefinementModelUsed("");
    setImageUrl(`https://placehold.co/768x768.png?rand=${Math.random()}`); 

    let currentRefinedPrompt = "";
    let modelUsedForRefinement = "";
    const aiRole = getAiRoleForFlow();

    try {
      const refineTierText = aiRole === 'FREE' ? 'Standard' : 'Premium';
      toast({ title: `Phase 1: Refining Prompt (${refineTierText})...`, description: "AI is analyzing and enhancing your prompt." });
      
      const refineInput: RefinePromptInput = { 
        userPrompt,
        userRole: aiRole 
      };
      const refineOutput: RefinePromptOutput = await refinePrompt(refineInput);
      currentRefinedPrompt = refineOutput.refinedPrompt;
      modelUsedForRefinement = refineOutput.modelUsed;
      setRefinedPrompt(currentRefinedPrompt);
      setRefinementModelUsed(modelUsedForRefinement);
      toast({ title: "Prompt Ready for Generation", description: `Refined using: ${modelUsedForRefinement}.` });

      toast({ title: "Phase 2: Generating Image...", description: "AI is now creating your image." });
      const generateInput: GenerateImageInput = { 
        prompt: currentRefinedPrompt,
        userRole: aiRole 
      };
      const generateOutput: GenerateImageOutput = await generateImage(generateInput);
      setImageUrl(generateOutput.imageDataUri);
      toast({ title: "Image Generated!", description: "Your new image is ready.", className: "bg-accent text-accent-foreground" });

    } catch (error) {
      console.error("Error during generation process:", error);
      let errorMessage = "An error occurred. Please try again.";
      if (error instanceof Error) {
         errorMessage = error.message.includes("The model may not have returned an image") || error.message.includes("No valid candidates returned") || error.message.includes("blocked by safety settings")
          ? "Image generation failed. The prompt might be unsuitable or a model error occurred (e.g. safety filters)."
          : `Error: ${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}`;
      }
      toast({ title: "Generation Process Error", description: errorMessage, variant: "destructive" });
      if (!currentRefinedPrompt) setRefinedPrompt(""); 
      setImageUrl(`https://placehold.co/768x768.png?rand=${Math.random()}`); 
    } finally {
      setIsProcessingPrompt(false);
      setIsLoadingImage(false);
    }
  };

  const handleParameterChange = (paramName: keyof ImageParameters, value: number) => {
    setImageParameters(prev => ({ ...prev, [paramName]: value }));
  };

  const handleAIAdjustParameters = async () => {
    if (!refinedPrompt || !parameterFeedback.trim()) {
      toast({ title: "Missing Info", description: "Refined prompt and parameter feedback are needed.", variant: "destructive" });
      return;
    }
    if (userClientRole === 'GUEST') {
      toast({ title: "Login Required", description: "Please login to use AI Parameter Adjustment.", variant: "destructive" });
      return;
    }
    setIsAdjustingParams(true);
    try {
      const input: AdjustImageParametersInput = {
        prompt: refinedPrompt,
        userFeedback: parameterFeedback,
        initialParameters: imageParameters,
      };
      const output: AdjustImageParametersOutput = await adjustImageParameters(input);

      const newParams: ImageParameters = { ...defaultParameters };
      Object.keys(output).forEach(key => {
        const paramKey = key as keyof ImageParameters;
        if (typeof output[paramKey] === 'number' && paramKey in newParams) {
          newParams[paramKey] = output[paramKey];
        }
      });
      setImageParameters(newParams);

      toast({ title: "Parameters Adjusted", description: "AI has updated image parameters based on your feedback." });
    } catch (error) {
      console.error("Error adjusting parameters:", error);
      toast({ title: "Adjustment Error", description: "Could not adjust parameters. Please try again.", variant: "destructive" });
    }
    setIsAdjustingParams(false);
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0 && !writtenFeedback.trim()) {
      toast({ title: "Missing Feedback", description: "Please provide a rating or written feedback.", variant: "destructive" });
      return;
    }
     if (userClientRole === 'GUEST') {
      toast({ title: "Login Required", description: "Please login to submit feedback.", variant: "destructive" });
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const input: SelfImproveRealismInput = {
        feedback: `Rating: ${rating}/5. Comments: ${writtenFeedback}`,
        originalPrompt: originalPromptForDisplay,
        refinedPrompt: refinedPrompt,
        imageParameters: imageParameters,
      };
      await selfImproveRealism(input); // We are not using the output directly here for now
      toast({ title: "Feedback Submitted", description: "Thank you! Your feedback helps us improve." });
      setRating(0);
      setWrittenFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({ title: "Feedback Error", description: "Could not submit feedback. Please try again.", variant: "destructive" });
    }
    setIsSubmittingFeedback(false);
  };

  const handleDownloadImage = () => {
    if (!imageUrl || imageUrl.startsWith('https://placehold.co')) {
      toast({ title: "Cannot Download", description: "No image generated or it's a placeholder.", variant: "destructive" });
      return;
    }
    const link = document.createElement('a');
    link.href = imageUrl;
    const filename = (refinedPrompt.split(' ').slice(0, 5).join('_').replace(/[^a-zA-Z0-9_]/g, '') || 'imagegenai_image') + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Image Downloading", description: `Your image ${filename} has started downloading.` });
  };

  const handleShareImage = async () => {
    if (!imageUrl || imageUrl.startsWith('https://placehold.co')) {
      toast({ title: "Cannot Share", description: "No image generated or it's a placeholder.", variant: "destructive" });
      return;
    }

    if (!navigator.share || !navigator.canShare) {
      toast({
        title: "Sharing Not Supported",
        description: "Your browser doesn't support direct image sharing. Try downloading the image.",
        variant: "default",
      });
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = (refinedPrompt.split(' ').slice(0, 5).join('_').replace(/[^a-zA-Z0-9_]/g, '') || 'imagegenai_image') + '.png';
      const file = new File([blob], filename, { type: blob.type });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: refinedPrompt || 'AI Generated Image',
          text: `Image generated with ImageGenAI: ${refinedPrompt || 'Check out this cool image!'}`,
        });
        toast({ title: "Image Sharing", description: "Image sharing dialog opened." });
      } else {
        toast({ title: "Cannot Share Image", description: "This image type or size might not be sharable using your browser.", variant: "default" });
      }
    } catch (err) {
      console.error('Failed to share image: ', err);
      if (err instanceof Error && err.name === 'AbortError') {
        toast({ title: "Sharing Cancelled", description: "You cancelled the image sharing process.", variant: "default" });
      } else {
        toast({ title: "Sharing Failed", description: "Could not share the image at this time.", variant: "destructive" });
      }
    }
  };

  const handleCopyRefinedPrompt = async () => {
    if (!refinedPrompt) {
      toast({ title: "Nothing to Copy", description: "Please refine a prompt first.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(refinedPrompt);
      toast({ title: "Prompt Copied!", description: "The refined prompt has been copied to your clipboard." });
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
      toast({ title: "Copy Failed", description: "Could not copy the prompt to clipboard.", variant: "destructive" });
    }
  };

  const canUsePremiumFeatures = userClientRole === 'PRO' || userClientRole === 'ADMIN';
  
  const getRefinementTierText = () => {
    if (userClientRole === 'ADMIN' || userClientRole === 'PRO') return "Premium Refinement Enabled";
    return "Standard Refinement";
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {userClientRole === 'ADMIN' && (
          <div className="mb-6 flex justify-end">
            <Link href="/admin" passHref>
              <Button variant="outline">
                <Settings className="mr-2 h-5 w-5" />
                Admin Panel
              </Button>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary" />Your Prompt</CardTitle>
                <CardDescription>
                  Enter your idea, and let AI craft the perfect image. ({getRefinementTierText()})
                  {userClientRole === 'GUEST' && <span className="block text-xs text-primary mt-1">Login to unlock Premium Refinement.</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., 'a photo of a cat wearing a tiny hat'"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  rows={3}
                  className="text-base"
                />
                <Button onClick={handleGenerateImage} disabled={isProcessingPrompt || !userPrompt.trim()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  {isProcessingPrompt ? "Generating..." : "Generate Image"}
                </Button>
              </CardContent>
              {(originalPromptForDisplay || refinedPrompt) && (
                <CardFooter className="flex flex-col items-start space-y-3 text-sm">
                  {originalPromptForDisplay && (
                    <div>
                      <Label className="font-semibold text-muted-foreground">Original Prompt:</Label>
                      <p className="mt-1 p-2 bg-muted/50 rounded-md">{originalPromptForDisplay}</p>
                    </div>
                  )}
                  {refinedPrompt && (
                    <div>
                      <Label className="font-semibold text-accent">AI Processed Prompt (Used for Generation):</Label>
                      {refinementModelUsed && <p className="text-xs text-accent/80">({refinementModelUsed})</p>}
                      <p className="mt-1 p-3 bg-accent/10 border border-accent/30 rounded-md text-accent-foreground">{refinedPrompt}</p>
                    </div>
                  )}
                </CardFooter>
              )}
            </Card>

            {refinedPrompt && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><SlidersHorizontal className="mr-2 h-6 w-6 text-primary" />Image Parameters</CardTitle>
                  <CardDescription>Fine-tune the technical aspects of your image. AI provides initial values.
                    {userClientRole === 'GUEST' && <span className="block text-xs text-primary mt-1">AI Parameter Adjustment requires login.</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="cfgScale" className="flex justify-between"><span>CFG Scale</span><span>{imageParameters.cfgScale.toFixed(1)}</span></Label>
                    <Slider
                      id="cfgScale"
                      min={1} max={20} step={0.1}
                      value={[imageParameters.cfgScale]}
                      onValueChange={([val]) => handleParameterChange('cfgScale', val)}
                      className="mt-2 [&>span>span]:bg-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="steps" className="flex justify-between"><span>Steps</span><span>{imageParameters.steps}</span></Label>
                    <Slider
                      id="steps"
                      min={10} max={150} step={1}
                      value={[imageParameters.steps]}
                      onValueChange={([val]) => handleParameterChange('steps', val)}
                      className="mt-2 [&>span>span]:bg-primary"
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="realismEnhancement" className="flex justify-between items-center">
                      <span>Realism Enhancement</span>
                      <span className="flex items-center">
                        {imageParameters.realismEnhancement.toFixed(2)}
                        {!canUsePremiumFeatures && <Lock className="ml-2 h-4 w-4 text-yellow-400" />}
                      </span>
                    </Label>
                    <Slider
                      id="realismEnhancement"
                      min={0} max={1} step={0.01}
                      value={[imageParameters.realismEnhancement]}
                      onValueChange={([val]) => handleParameterChange('realismEnhancement', val)}
                      className={`mt-2 [&>span>span]:${canUsePremiumFeatures ? 'bg-primary' : 'bg-yellow-400'}`}
                      disabled={!canUsePremiumFeatures}
                    />
                     {!canUsePremiumFeatures && (
                        <p className="text-xs text-yellow-500 mt-1">
                            This is a premium feature. <Button variant="link" size="sm" className="p-0 h-auto text-yellow-400 hover:text-yellow-300 inline-flex items-center" onClick={() => document.dispatchEvent(new CustomEvent('loginRequested'))}><LogIn className="mr-1 h-3 w-3" />Login or Upgrade to unlock.</Button>
                        </p>
                     )}
                  </div>
                  <Separator />
                   <Label htmlFor="paramFeedback">Feedback for AI Parameter Adjustment</Label>
                  <Textarea
                    id="paramFeedback"
                    placeholder="e.g., 'Make it sharper', 'More vibrant colors'"
                    value={parameterFeedback}
                    onChange={(e) => setParameterFeedback(e.target.value)}
                    rows={2}
                    disabled={userClientRole === 'GUEST'}
                  />
                  <Button onClick={handleAIAdjustParameters} disabled={isAdjustingParams || !parameterFeedback.trim() || userClientRole === 'GUEST'} className="w-full">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isAdjustingParams ? "AI Adjusting..." : "AI Adjust Parameters"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline flex items-center">Image Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                {isLoadingImage ? (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                  </div>
                ) : (
                  <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer w-full aspect-square relative">
                        <Image
                          src={imageUrl}
                          alt={refinedPrompt || "Generated image preview"}
                          width={768}
                          height={768}
                          className="rounded-lg border border-border shadow-md object-contain aspect-square"
                          data-ai-hint={getAiHintFromPrompt(refinedPrompt)}
                          priority={true}
                          key={imageUrl} 
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-2 bg-background/90 backdrop-blur-sm">
                       <DialogTitle className="sr-only">Expanded Image Preview for {refinedPrompt || "Generated image"}</DialogTitle>
                       <Image
                          src={imageUrl}
                          alt={refinedPrompt || "Generated image preview - expanded"}
                          width={1024}
                          height={1024}
                          className="rounded-lg object-contain w-full h-auto max-h-[80vh]"
                        />
                    </DialogContent>
                  </Dialog>
                )}
                 <div className="mt-4 w-full flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleDownloadImage} disabled={isLoadingImage || !imageUrl || imageUrl.startsWith('https://placehold.co')}>
                        <Download className="mr-2 h-4 w-4" /> Download Image
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleShareImage} disabled={isLoadingImage || !imageUrl || imageUrl.startsWith('https://placehold.co')}>
                        <Share2 className="mr-2 h-4 w-4" /> Share Image
                    </Button>
                 </div>
                 <div className="mt-2 w-full flex flex-col sm:flex-row gap-2">
                     <Button variant="outline" className="flex-1" onClick={handleCopyRefinedPrompt} disabled={!refinedPrompt}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Prompt
                    </Button>
                     <Button variant="outline" className="flex-1" disabled={isLoadingImage || !imageUrl || imageUrl.startsWith('https://placehold.co')}> {/* Add onClick handler for this feature later */}
                        <Edit3 className="mr-2 h-4 w-4" /> Enhance Locally (Canva/Konva.js)
                    </Button>
                 </div>
              </CardContent>
            </Card>

            {refinedPrompt && !isLoadingImage && imageUrl && !imageUrl.startsWith('https://placehold.co') && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><Star className="mr-2 h-6 w-6 text-primary" />Rate & Review</CardTitle>
                  <CardDescription>Your feedback helps the AI learn and improve!
                     {userClientRole === 'GUEST' && <span className="block text-xs text-primary mt-1">Login to submit feedback.</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Overall Rating (1-5 Stars, decimals allowed)</Label>
                    <div className="flex items-center gap-4 mt-2">
                       <StarRatingInput
                          initialRating={rating}
                          onRatingChange={setRating}
                          size={32}
                          readOnly={userClientRole === 'GUEST'}
                        />
                        <Input
                          type="number"
                          value={rating.toString()}
                          onChange={(e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val)) val = 0;
                            if (val < 0) val = 0;
                            if (val > 5) val = 5;
                            setRating(val);
                          }}
                          min="0" max="5" step="0.1"
                          className="w-24 text-lg text-center font-bold"
                          disabled={userClientRole === 'GUEST'}
                        />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="writtenFeedback">Written Feedback (Optional)</Label>
                    <Textarea
                      id="writtenFeedback"
                      placeholder="What did you like or dislike? How can we improve?"
                      value={writtenFeedback}
                      onChange={(e) => setWrittenFeedback(e.target.value)}
                      rows={4}
                      className="mt-2"
                      disabled={userClientRole === 'GUEST'}
                    />
                  </div>
                  <Button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback || userClientRole === 'GUEST'} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
