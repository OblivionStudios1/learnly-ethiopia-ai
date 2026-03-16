import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LeaderboardEntry {
  xp_points: number;
  username: string;
  rank: number;
  show_xp_in_leaderboard: boolean;
}

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Leaderboard = ({ open, onOpenChange }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get current user's username for highlighting
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setCurrentUsername(profile.username || "");
      }
    }

    // Query the secure leaderboard view (respects privacy settings)
    const { data: leaderboardData } = await supabase
      .from("leaderboard_view")
      .select("username, xp_points, show_xp_in_leaderboard");

    if (leaderboardData) {
      const rankedData = leaderboardData.map((entry, index) => ({
        xp_points: entry.xp_points,
        username: entry.username || "Unknown",
        rank: index + 1,
        show_xp_in_leaderboard: entry.show_xp_in_leaderboard,
      }));

      setLeaderboard(rankedData);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            XP Leaderboard
          </DialogTitle>
          <DialogDescription>
            See who has the most XP points and climb the ranks!
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-y-auto space-y-2 pr-2">
            {leaderboard.map((entry, index) => (
              <Card
                key={`${entry.username}-${index}`}
                className={`p-4 transition-all hover:scale-[1.02] ${
                  entry.username === currentUsername 
                    ? "bg-primary/10 border-primary shadow-lg" 
                    : "shadow-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {entry.username}
                      {entry.username === currentUsername && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">Rank #{entry.rank}</p>
                  </div>
                  <div className="text-right">
                    {entry.show_xp_in_leaderboard ? (
                      <>
                        <p className="text-2xl font-bold text-primary">{entry.xp_points}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Hidden</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;
