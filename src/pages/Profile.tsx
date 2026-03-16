import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Bookmark, Flame, Trophy, Settings, Upload } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Leaderboard from "@/components/Leaderboard";
import UploadVideoDialog from "@/components/UploadVideoDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState(7);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [stats, setStats] = useState({
    questionsAsked: 0,
    savedVideos: 0,
    dayStreak: 0,
    xpPoints: 0,
  });
  const [recentQuestions, setRecentQuestions] = useState<any[]>([]);
  const [savedVideosData, setSavedVideosData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    let userId: string | null = null;

    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id || null;
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setEmail(profile.email);
        setGrade(profile.grade);
        setSubjects((profile.subjects as string[]) || []);
      }

      let userStats = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Create user_stats if it doesn't exist
      if (!userStats.data) {
        await supabase.from("user_stats").insert({ user_id: session.user.id });
        userStats = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
      }

      if (userStats.data) {
        const lastLogin = new Date(userStats.data.last_login);
        const now = new Date();
        
        // Reset time to start of day for accurate day comparison
        const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
        const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysDiff = Math.floor((nowDay.getTime() - lastLoginDay.getTime()) / (1000 * 60 * 60 * 24));
        
        let newStreak = userStats.data.day_streak;
        if (daysDiff === 1) {
          // Consecutive day - increment streak
          newStreak = userStats.data.day_streak + 1;
        } else if (daysDiff > 1) {
          // Missed days - reset streak to 1
          newStreak = 1;
        }
        // If daysDiff === 0, same day login - keep current streak

        await supabase
          .from("user_stats")
          .update({ last_login: now.toISOString(), day_streak: newStreak })
          .eq("user_id", session.user.id);

        setStats({
          questionsAsked: userStats.data.questions_asked,
          savedVideos: 0,
          dayStreak: newStreak,
          xpPoints: userStats.data.xp_points,
        });
      }

      const { data: savedVideos, count } = await supabase
        .from("saved_videos")
        .select("*, videos(*)", { count: 'exact' })
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (count !== null) {
        setStats(prev => ({ ...prev, savedVideos: count }));
      }
      if (savedVideos) {
        setSavedVideosData(savedVideos);
      }

      const { data: questions } = await supabase
        .from("ai_questions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (questions) {
        setRecentQuestions(questions);
      }

      setLoading(false);
    };

    fetchUserData();

    // Set up realtime subscription for user stats
    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_stats',
        },
        (payload) => {
          if (payload.new && payload.new.user_id === userId) {
            setStats(prev => ({
              ...prev,
              questionsAsked: payload.new.questions_asked,
              xpPoints: payload.new.xp_points,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const statsData = [
    { label: "Questions Asked", value: stats.questionsAsked.toString(), icon: Sparkles, color: "text-purple-500" },
    { label: "Saved Videos", value: stats.savedVideos.toString(), icon: Bookmark, color: "text-green-500" },
    { label: "Day Streak", value: stats.dayStreak.toString(), icon: Flame, color: "text-orange-500" },
    { label: "XP Points", value: stats.xpPoints.toString(), icon: Trophy, color: "text-yellow-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="pt-6 space-y-4 animate-slide-up">
          <Card className="p-6 space-y-4 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{username}</h2>
                  <p className="text-muted-foreground">Grade {grade}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowUploadDialog(true)}
                  className="rounded-full hover:scale-110 transition-transform"
                >
                  <Upload className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/settings")}
                  className="rounded-full hover:scale-110 transition-transform"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {subjects.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Favorite Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {statsData.map((stat, index) => (
            <Card 
              key={index} 
              className={`p-4 space-y-2 shadow-card hover:shadow-lg transition-all hover:scale-105 ${
                stat.label === "XP Points" ? "cursor-pointer" : ""
              }`}
              onClick={() => stat.label === "XP Points" && setShowLeaderboard(true)}
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Saved Videos</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/all-saved-videos")}>View All</Button>
          </div>
          {savedVideosData.length > 0 ? (
            <div className="space-y-2">
              {savedVideosData.map((saved) => (
                <Card key={saved.id} className="p-3 shadow-card hover:shadow-lg transition-all">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${saved.videos.thumbnail})` }} />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-sm">{saved.videos.title}</h3>
                      <p className="text-xs text-muted-foreground">{saved.videos.subject}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground shadow-card">No saved videos yet</Card>
          )}
        </div>

        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Recent AI Questions</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/all-questions")}>View All</Button>
          </div>
          {recentQuestions.length > 0 ? (
            <div className="space-y-2">
              {recentQuestions.map((q) => (
                <Card key={q.id} className="p-4 shadow-card hover:shadow-lg transition-all">
                  <p className="font-semibold text-sm mb-1">{q.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString()} • {q.subject || "General"}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground shadow-card">No questions asked yet</Card>
          )}
        </div>
      </div>
      <BottomNav />
      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} />
      <UploadVideoDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} />
    </div>
  );
};

export default Profile;
