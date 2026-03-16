import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UploadVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadVideoDialog = ({ open, onOpenChange }: UploadVideoDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");

  const subjects = [
    "Mathematics",
    "English",
    "Amharic",
    "General Science",
    "Social Studies",
    "ICT",
    "Biology",
    "Chemistry",
    "Physics",
    "Geography",
    "History",
  ];

  const grades = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be less than 500MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", subject: "", grade: "" });
    setVideoFile(null);
    setVideoPreview("");
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile || !formData.title || !formData.subject || !formData.grade) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a video",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const userId = session.user.id;

      // Check subscription plan and upload limits
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan, last_upload_date, upload_count_today")
        .eq("id", userId)
        .single();

      if (!profile || profile.subscription_plan === "basic") {
        toast({
          title: "Upgrade Required",
          description: "Basic plan users cannot upload videos. Please upgrade to Pro or Premium.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Check daily upload limit for Pro users
      if (profile.subscription_plan === "pro") {
        const today = new Date().toISOString().split('T')[0];
        const lastUploadDate = profile.last_upload_date;
        const uploadCount = profile.upload_count_today || 0;

        if (lastUploadDate === today && uploadCount >= 1) {
          toast({
            title: "Daily Limit Reached",
            description: "Pro users can upload 1 video per day. Upgrade to Premium for unlimited uploads.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }
      const timestamp = Date.now();
      
      console.log("Starting video upload...", { fileName: videoFile.name, size: videoFile.size });
      
      setUploadProgress(20);
      const videoPath = `${userId}/${timestamp}_${videoFile.name}`;
      
      // Simulated chunked upload with progress updates
      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 60) return prev + 5;
          return prev;
        });
      }, 200);

      const { error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoPath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(simulateProgress);

      if (videoError) {
        console.error("Video upload error:", videoError);
        throw videoError;
      }
      
      console.log("Video uploaded successfully");
      setUploadProgress(70);

      const { data: videoUrl } = supabase.storage
        .from("videos")
        .getPublicUrl(videoPath);

      console.log("Creating database entry...");
      setUploadProgress(85);

      const { error: dbError } = await supabase
        .from("videos")
        .insert({
          title: formData.title,
          subject: formData.subject,
          grade: parseInt(formData.grade),
          video_url: videoUrl.publicUrl,
          thumbnail: null,
          creator_id: userId,
          ai_generated: false,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
      
      console.log("Upload complete!");
      setUploadProgress(100);

      // Update upload count
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("subscription_plan, last_upload_date, upload_count_today")
          .eq("id", currentSession.user.id)
          .single();

        const today = new Date().toISOString().split('T')[0];
        const isNewDay = currentProfile?.last_upload_date !== today;

        await supabase
          .from("profiles")
          .update({
            last_upload_date: today,
            upload_count_today: isNewDay ? 1 : (currentProfile?.upload_count_today || 0) + 1,
          })
          .eq("id", currentSession.user.id);
      }

      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      });

      setTimeout(() => {
        resetForm();
        onOpenChange(false);
        navigate("/home");
      }, 500);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
              className="transition-all focus:scale-[1.02]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger className="transition-all focus:scale-[1.02]">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger className="transition-all focus:scale-[1.02]">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="video">Video File (Max 500MB)</Label>
            <div className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-all cursor-pointer hover:scale-[1.02]">
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <label htmlFor="video" className="cursor-pointer">
                {videoPreview ? (
                  <div className="space-y-2">
                    <video src={videoPreview} className="w-full h-40 object-cover rounded-lg" />
                    <p className="text-sm text-muted-foreground">{videoFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload video</p>
                  </>
                )}
              </label>
              {videoFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium text-primary">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 transition-all hover:scale-105 active:scale-95"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="transition-all hover:scale-105 active:scale-95"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideoDialog;
