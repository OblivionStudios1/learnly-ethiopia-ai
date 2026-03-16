import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, BookOpen, ArrowRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GRADES = [7, 8, 9, 10, 11, 12];

// Ethiopian curriculum subjects by grade
const SUBJECTS_BY_GRADE: Record<number, string[]> = {
  7: ["Mathematics", "English", "Amharic", "General Science", "Social Studies", "Career and Technical Education", "ICT"],
  8: ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History"],
  9: ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History"],
  10: ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History"],
  11: ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History", "Economics"],
  12: ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History", "Economics"],
};

const DEFAULT_SUBJECTS = ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const availableSubjects = selectedGrade ? SUBJECTS_BY_GRADE[selectedGrade] : DEFAULT_SUBJECTS;

  const handleContinue = async () => {
    if (step === 1 && username.trim()) {
      setStep(2);
    } else if (step === 2 && selectedGrade) {
      setStep(3);
    } else if (step === 3 && selectedSubjects.length > 0) {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // Update the existing profile created by the trigger
        const { error } = await supabase.from('profiles').update({
          username: username.trim(),
          grade: selectedGrade || 7,
          subjects: selectedSubjects,
        }).eq('id', session.user.id);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate('/home');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* Logo and Welcome */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Lernly AI
            </h1>
            <p className="text-muted-foreground mt-2">
              Learn smarter with short videos and AI
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 justify-center">
          <div className={`h-1.5 w-10 rounded-full transition-all ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1.5 w-10 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1.5 w-10 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <Card className="p-6 space-y-6 shadow-card animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Choose a Username</h2>
              <p className="text-sm text-muted-foreground">
                Pick a unique username for your profile
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {username.length}/20 characters
              </p>
            </div>
          </Card>
        )}

        {/* Step 2: Grade Selection */}
        {step === 2 && (
          <Card className="p-6 space-y-6 shadow-card animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Select Your Grade</h2>
              <p className="text-sm text-muted-foreground">
                Choose your current grade level
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GRADES.map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedGrade === grade
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl font-bold">Grade {grade}</div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 3: Subject Selection */}
        {step === 3 && (
          <Card className="p-6 space-y-6 shadow-card animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Favorite Subjects</h2>
              <p className="text-sm text-muted-foreground">
                Pick subjects you want to focus on (select at least one)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 flex items-center gap-2 ${
                    selectedSubjects.includes(subject)
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-sm">{subject}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={
            loading ||
            (step === 1 && !username.trim()) ||
            (step === 2 && !selectedGrade) ||
            (step === 3 && selectedSubjects.length === 0)
          }
          className="w-full h-12 text-base font-semibold shadow-elegant hover:shadow-xl transition-all"
          size="lg"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {step === 3 ? 'Start Learning' : 'Continue'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>

        {step > 1 && (
          <button
            onClick={handleBack}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
