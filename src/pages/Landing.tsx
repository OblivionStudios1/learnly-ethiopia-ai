import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, Sparkles, TrendingUp } from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
const Landing = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/home");
      }
    };
    checkSession();
  }, [navigate]);
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered Learning</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl leading-tight sm:text-5xl font-sans font-bold text-left">
                  Learn Smarter with{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Lernly Ai  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Master Ethiopian curriculum with bite-sized videos and instant AI tutoring. 
                  Perfect for grades 7-12 students.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate("/auth")} size="lg" className="text-lg h-14 px-8 shadow-elegant hover:shadow-xl transition-all hover:scale-105">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
                <Button onClick={() => navigate("/home")} variant="outline" size="lg" className="text-lg h-14 px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Explore Videos
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Video Lessons</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Tutor</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">8</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50"></div>
              <img src={heroImage} alt="Students learning" className="relative rounded-3xl shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-card animate-fade-in hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Short-Form Videos</h3>
            <p className="text-muted-foreground">
              Learn complex topics in under 60 seconds. Perfect for quick revision and understanding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-card animate-fade-in hover:shadow-xl transition-all delay-100">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
            <p className="text-muted-foreground">
              Ask questions anytime and get instant, personalized answers from your AI tutor.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-card animate-fade-in hover:shadow-xl transition-all delay-200">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ethiopian Curriculum</h3>
            <p className="text-muted-foreground">
              Aligned with Ethiopian education standards for grades 7-12. All subjects covered.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-primary to-primary-glow rounded-3xl p-12 text-center shadow-2xl animate-slide-up">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of Ethiopian students learning smarter with Lernly AI
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" variant="secondary" className="text-lg h-14 px-8 shadow-xl hover:scale-105 transition-transform">
            Start Learning Now
          </Button>
        </div>
      </div>
    </div>;
};
export default Landing;