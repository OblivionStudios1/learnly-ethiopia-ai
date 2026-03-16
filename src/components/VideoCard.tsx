import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Bookmark, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  subject: string;
  grade: number;
  thumbnail: string;
  video_url?: string;
  likes: number;
  comments: number;
  isAI: boolean;
}

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onAskAI: () => void;
}

const VideoCard = ({ video, isActive, onAskAI }: VideoCardProps) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkIfSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("saved_videos")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("video_id", video.id)
        .maybeSingle();

      setIsSaved(!!data);
    };

    checkIfSaved();
  }, [video.id]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        setVideoEnded(false);
        setProgress(0);
        setIsPaused(false);
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {
          // Autoplay failed, try muted first
          videoRef.current!.muted = true;
          videoRef.current!.play();
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

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
        .eq("video_id", video.id);
      
      toast({
        title: "Removed from saved",
        description: "Video removed from your saved list",
      });
    } else {
      await supabase
        .from("saved_videos")
        .insert({
          user_id: session.user.id,
          video_id: video.id,
        });
      
      toast({
        title: "Saved!",
        description: "Video added to your saved list",
      });
    }

    setIsSaved(!isSaved);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-background">
      {/* Video Player */}
      {video.video_url ? (
        <div className="relative w-full h-full" onClick={handleVideoClick}>
          <video
            ref={videoRef}
            src={video.video_url}
            className="absolute inset-0 w-full h-full object-contain"
            loop
            playsInline
            onEnded={() => setVideoEnded(true)}
            onTimeUpdate={handleTimeUpdate}
            onWaiting={() => setIsBuffering(true)}
            onCanPlay={() => setIsBuffering(false)}
          />
          
          {/* Buffering indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          
          {/* Pause indicator */}
          {isPaused && !isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${video.thumbnail})` }}
        />
      )}
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-background/20">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pb-24 pointer-events-none">
        {/* Top badges */}
        <div className="flex gap-2 justify-end pointer-events-auto">
          <Badge variant="secondary" className="bg-black/50 text-white border-0">
            Grade {video.grade}
          </Badge>
          {video.isAI && (
            <Badge className="bg-primary/90 text-primary-foreground border-0 gap-1">
              <Sparkles className="w-3 h-3" />
              AI Enhanced
            </Badge>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-3 pointer-events-auto">
          {/* Video info */}
          <div className="space-y-1 animate-slide-up max-w-[70%]">
            <h2 className="text-white text-xl font-bold drop-shadow-lg line-clamp-2">
              {video.title}
            </h2>
            <p className="text-white/90 text-sm font-medium">
              {video.subject}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-end justify-between gap-4">
            {videoEnded && (
              <Button
                onClick={onAskAI}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-elegant animate-scale-in"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ask AI about this
              </Button>
            )}

            {/* Engagement buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
              >
                <Heart
                  className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                />
                <span className="text-xs font-medium drop-shadow-lg">
                  {formatNumber(video.likes + (isLiked ? 1 : 0))}
                </span>
              </button>

              <button 
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
              >
                <MessageCircle className="w-7 h-7" />
                <span className="text-xs font-medium drop-shadow-lg">
                  {formatNumber(video.comments)}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveToggle();
                }}
                className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
              >
                <Bookmark
                  className={`w-7 h-7 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''} transition-all`}
                />
                <span className="text-xs font-medium drop-shadow-lg">Save</span>
              </button>

              <button 
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
              >
                <Share2 className="w-7 h-7" />
                <span className="text-xs font-medium drop-shadow-lg">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
