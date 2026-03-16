import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Bookmark, Share2, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const WatchVideo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("id");
  const { toast } = useToast();
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (!videoId) {
      navigate("/home");
      return;
    }

    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (error || !data) {
        toast({
          title: "Video not found",
          variant: "destructive",
        });
        navigate("/home");
        return;
      }

      setVideo(data);
      setLikes(data.likes || 0);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: savedData } = await supabase
          .from("saved_videos")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("video_id", videoId)
          .single();

        setIsSaved(!!savedData);
      }

      setLoading(false);
    };

    fetchVideo();
  }, [videoId, navigate, toast]);

  const handleSaveToggle = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to save videos",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      await supabase
        .from("saved_videos")
        .delete()
        .eq("user_id", session.user.id)
        .eq("video_id", videoId);

      toast({
        title: "Removed from saved",
        description: "Video removed from your saved list",
      });
    } else {
      await supabase
        .from("saved_videos")
        .insert({
          user_id: session.user.id,
          video_id: videoId,
        });

      toast({
        title: "Saved!",
        description: "Video added to your saved list",
      });
    }

    setIsSaved(!isSaved);
  };

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    const newLikes = likes + (newLiked ? 1 : -1);
    setLikes(newLikes);

    await supabase
      .from("videos")
      .update({ likes: newLikes })
      .eq("id", videoId);
  };

  const handleAskAI = () => {
    navigate(`/ask-ai?video=${videoId}`, {
      state: { video },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold truncate flex-1">{video.title}</h1>
        </div>

        <div className="aspect-video w-full bg-black">
          {video.video_url ? (
            <video
              src={video.video_url}
              controls
              className="w-full h-full"
              poster={video.thumbnail}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              No video available
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">{video.title}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Grade {video.grade}</Badge>
                <Badge variant="outline">{video.subject}</Badge>
                {video.ai_generated && (
                  <Badge className="bg-primary/90 gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={isLiked ? "text-red-500 border-red-500" : ""}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-red-500" : ""}`} />
              {likes}
            </Button>

            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              {video.comments || 0}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToggle}
              className={isSaved ? "text-yellow-500 border-yellow-500" : ""}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? "fill-yellow-400" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>

            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Card className="p-4">
            <Button
              onClick={handleAskAI}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI about this video
            </Button>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default WatchVideo;
