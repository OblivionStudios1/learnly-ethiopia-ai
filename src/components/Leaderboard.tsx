import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
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
}

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Leaderboard = ({ open, onOpenChange }: LeaderboardProps) => {
  const demoLeaderboard: LeaderboardEntry[] = [
    { username: "swift_learner", xp_points: 2400, rank: 1 },
    { username: "bright_mind", xp_points: 1850, rank: 2 },
    { username: "DemoUser", xp_points: 750, rank: 3 },
    { username: "clever_student", xp_points: 500, rank: 4 },
    { username: "eager_reader", xp_points: 320, rank: 5 },
  ];

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
            Demo leaderboard — see who has the most XP points!
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto space-y-2 pr-2">
          {demoLeaderboard.map((entry, index) => (
            <Card
              key={`${entry.username}-${index}`}
              className={`p-4 transition-all hover:scale-[1.02] ${
                entry.username === "DemoUser" 
                  ? "bg-primary/10 border-primary shadow-lg" 
                  : "shadow-card"
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {entry.username}
                    {entry.username === "DemoUser" && (
                      <span className="ml-2 text-xs text-primary">(You)</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">Rank #{entry.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{entry.xp_points}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;
