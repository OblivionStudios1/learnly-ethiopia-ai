import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Bookmark, Flame, Trophy, Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Leaderboard from "@/components/Leaderboard";

const Profile = () => {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const demoUser = {
    username: "DemoUser",
    grade: 10,
    subjects: ["Mathematics", "Physics", "Biology"],
  };

  const stats = {
    questionsAsked: 12,
    savedVideos: 5,
    dayStreak: 3,
    xpPoints: 750,
  };

  const statsData = [
    { label: "Questions Asked", value: stats.questionsAsked.toString(), icon: Sparkles, color: "text-purple-500" },
    { label: "Saved Videos", value: stats.savedVideos.toString(), icon: Bookmark, color: "text-green-500" },
    { label: "Day Streak", value: stats.dayStreak.toString(), icon: Flame, color: "text-orange-500" },
    { label: "XP Points", value: stats.xpPoints.toString(), icon: Trophy, color: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="pt-6 space-y-4 animate-slide-up">
          <Card className="p-6 space-y-4 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
                  <span className="text-2xl font-bold text-primary-foreground">D</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{demoUser.username}</h2>
                    <Badge variant="secondary" className="text-xs">Demo</Badge>
                  </div>
                  <p className="text-muted-foreground">Grade {demoUser.grade}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
                className="rounded-full hover:scale-110 transition-transform"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Favorite Subjects</p>
              <div className="flex flex-wrap gap-2">
                {demoUser.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">{subject}</Badge>
                ))}
              </div>
            </div>
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
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Saved Videos</h2>
          </div>
          <Card className="p-6 text-center text-muted-foreground shadow-card">
            Demo mode — saved videos not available
          </Card>
        </div>

        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Recent AI Questions</h2>
          </div>
          <Card className="p-6 text-center text-muted-foreground shadow-card">
            Demo mode — question history not available
          </Card>
        </div>
      </div>
      <BottomNav />
      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} />
    </div>
  );
};

export default Profile;
