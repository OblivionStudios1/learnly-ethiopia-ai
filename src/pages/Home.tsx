import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    return () => {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    const loadVideos = async () => {
      const filterSubject = location.state?.filterSubject;
      const filterGrade = location.state?.filterGrade;

      let query = supabase.from('videos').select('*');

      if (filterGrade) {
        query = query.eq('grade', filterGrade);
      }
      if (filterSubject) {
        query = query.eq('subject', filterSubject);
      }

      const { data: videosData } = await query.order('created_at', { ascending: false });
      setVideos(videosData || []);
      setLoading(false);
    };

    loadVideos();
  }, [location.state]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: currentIndex * window.innerHeight,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const handleAskAI = (video: any) => {
    navigate('/ask-ai', { state: { video } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce-in">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 animate-fade-in">
        <Badge variant="outline" className="mb-4 text-xs">Demo Mode</Badge>
        <div className="text-6xl mb-4 animate-bounce-in">📚</div>
        <h2 className="text-2xl font-bold mb-2">No videos available</h2>
        <p className="text-muted-foreground text-center">
          Be the first to upload educational content!
        </p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="h-screen overflow-hidden snap-y snap-mandatory bg-background"
    >
      {/* Demo Mode Badge */}
      <div className="fixed top-4 left-4 z-50">
        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
          Demo Mode
        </Badge>
      </div>
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="h-screen snap-start flex items-center justify-center"
        >
          <div className="w-full max-w-md h-full mx-auto" style={{ aspectRatio: '9/16' }}>
            <VideoCard
              video={{
                id: video.id,
                title: video.title,
                subject: video.subject,
                grade: video.grade,
                thumbnail: video.thumbnail,
                video_url: video.video_url,
                likes: video.likes || 0,
                comments: video.comments || 0,
                isAI: video.ai_generated || false,
              }}
              isActive={index === currentIndex}
              onAskAI={() => handleAskAI(video)}
            />
          </div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
};

export default Home;
