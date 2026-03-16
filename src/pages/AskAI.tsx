import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AskAI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const video = location.state?.video;
  const { toast } = useToast();
  
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check subscription plan for AI access
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.subscription_plan === "basic") {
        toast({
          title: "Upgrade Required",
          description: "AI assistance is only available for Pro and Premium users. Please upgrade your plan.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: {
          question: question,
          subject: video?.subject,
          grade: video?.grade,
          userId: session.user.id,
          subscriptionPlan: profile.subscription_plan,
          videoContext: video ? {
            title: video.title,
            subject: video.subject,
            grade: video.grade,
            description: video.description || '',
          } : null,
        },
      });

      if (error) {
        console.error("Error calling AI:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data?.response) {
        setResponse(data.response);
        
        // Save question to database
        await supabase.from("ai_questions").insert({
          user_id: session.user.id,
          question: question,
          response: data.response,
          subject: video?.subject,
          grade: video?.grade,
        });

        // Update user stats (create if doesn't exist)
        let currentStats = await supabase
          .from("user_stats")
          .select("questions_asked, xp_points")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!currentStats.data) {
          await supabase.from("user_stats").insert({ user_id: session.user.id });
          currentStats = await supabase
            .from("user_stats")
            .select("questions_asked, xp_points")
            .eq("user_id", session.user.id)
            .single();
        }

        if (currentStats.data) {
          await supabase
            .from("user_stats")
            .update({
              questions_asked: currentStats.data.questions_asked + 1,
              xp_points: currentStats.data.xp_points + 50,
            })
            .eq("user_id", session.user.id);
        }
      } else {
        toast({
          title: "Error",
          description: "No response from AI. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format response to handle markdown bold
  const formatResponse = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ask AI Tutor</h1>
              <p className="text-sm text-muted-foreground">
                Get instant help with your studies
              </p>
            </div>
          </div>

          {video && (
            <Card className="p-4 bg-card shadow-card">
              <div className="flex gap-3">
                <div 
                  className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${video.thumbnail})` }}
                />
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{video.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {video.subject}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Grade {video.grade}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Question Input */}
        <Card className="p-4 space-y-4 shadow-card animate-fade-in">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Your Question
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this topic... e.g., 'Explain the Pythagorean theorem with an example'"
              className="min-h-[120px] resize-none"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="w-full shadow-elegant"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>
        </Card>

        {/* AI Response */}
        {response && (
          <Card className="p-6 space-y-4 shadow-card animate-slide-up bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">AI Tutor Response</h3>
            </div>
            <p className="text-foreground leading-relaxed">{formatResponse(response)}</p>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                💡 Want to learn more? Ask a follow-up question!
              </p>
            </div>
          </Card>
        )}

        {/* Quick prompts */}
        {!response && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm font-medium text-muted-foreground">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Explain with an example",
                "What are the key points?",
                "How is this used in real life?",
                "Can you simplify this?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setQuestion(prompt)}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-all hover:scale-105"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default AskAI;
