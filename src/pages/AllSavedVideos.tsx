import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AllSavedVideos = () => {
  const navigate = useNavigate();
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  const fetchSavedVideos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("saved_videos")
      .select("*, videos(*)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSavedVideos(data);
    }
    setLoading(false);
  };

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
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Saved Videos</h1>
            </div>
          </div>
        </div>

        {savedVideos.length > 0 ? (
          <div className="space-y-3">
            {savedVideos.map((saved) => (
              <Card key={saved.id} className="p-4 shadow-card hover:shadow-lg transition-all">
                <div className="flex gap-4">
                  <div 
                    className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${saved.videos.thumbnail})` }}
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{saved.videos.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {saved.videos.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Grade {saved.videos.grade}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saved on {new Date(saved.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground shadow-card">
            No saved videos yet
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllSavedVideos;
