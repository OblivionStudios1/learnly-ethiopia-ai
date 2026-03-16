import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Moon, Sun, LogOut, ArrowLeft, User, Trash2, Key, BookOpen, Eye, EyeOff, Bell, Globe, Mic, Volume2, Shield, Lock, Search, Video, MessageSquare, Brain, Zap, Type, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";
import { z } from "zod";

// Password must have at least 5 letters and 1 number
const passwordSchema = z.string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*[a-zA-Z]/, "Password must contain at least 5 letters")
  .regex(/[0-9]/, "Password must contain at least 1 number");

const SUBJECTS = ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History", "Economics", "General Science", "Social Studies", "Career and Technical Education", "ICT"];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [showXpInLeaderboard, setShowXpInLeaderboard] = useState(true);
  
  // Privacy settings
  const [accountPrivate, setAccountPrivate] = useState(false);
  const [commentPrivacy, setCommentPrivacy] = useState("everyone");
  const [searchVisible, setSearchVisible] = useState(true);
  
  // Content settings
  const [language, setLanguage] = useState("english");
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [contentDifficulty, setContentDifficulty] = useState("normal");
  const [dailyTimeGoal, setDailyTimeGoal] = useState(30);
  
  // AI settings
  const [aiAssistanceLevel, setAiAssistanceLevel] = useState("normal");
  const [aiAnswerMode, setAiAnswerMode] = useState("text");
  const [aiPersonality, setAiPersonality] = useState("friendly");
  const [allowAiDataUsage, setAllowAiDataUsage] = useState(true);
  
  // Creator settings
  const [uploadQuality, setUploadQuality] = useState("auto");
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationLikes, setNotificationLikes] = useState(true);
  const [notificationComments, setNotificationComments] = useState(true);
  const [notificationReminders, setNotificationReminders] = useState(true);
  const [notificationAiSuggestions, setNotificationAiSuggestions] = useState(true);
  
  // Accessibility settings
  const [textSize, setTextSize] = useState("medium");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUsername(profile.username || "");
        setNewUsername(profile.username || "");
        setDisplayName(profile.display_name || "");
        const subjects = profile.subjects;
        setFavoriteSubjects(Array.isArray(subjects) ? subjects.filter((s): s is string => typeof s === 'string') : []);
        setShowXpInLeaderboard(profile.show_xp_in_leaderboard ?? true);
        
        // Privacy
        setAccountPrivate(profile.account_private ?? false);
        setCommentPrivacy(profile.comment_privacy || "everyone");
        setSearchVisible(profile.search_visible ?? true);
        
        // Content
        setLanguage(profile.language || "english");
        setAutoplayVideos(profile.autoplay_videos ?? true);
        setContentDifficulty(profile.content_difficulty || "normal");
        setDailyTimeGoal(profile.daily_time_goal || 30);
        
        // AI
        setAiAssistanceLevel(profile.ai_assistance_level || "normal");
        setAiAnswerMode(profile.ai_answer_mode || "text");
        setAiPersonality(profile.ai_personality || "friendly");
        setAllowAiDataUsage(profile.allow_ai_data_usage ?? true);
        
        // Creator
        setUploadQuality(profile.upload_quality || "auto");
        
        // Notifications
        setNotificationsEnabled(profile.notifications_enabled ?? true);
        setNotificationLikes(profile.notification_likes ?? true);
        setNotificationComments(profile.notification_comments ?? true);
        setNotificationReminders(profile.notification_reminders ?? true);
        setNotificationAiSuggestions(profile.notification_ai_suggestions ?? true);
        
        // Accessibility
        setTextSize(profile.text_size || "medium");
        setSubtitlesEnabled(profile.subtitles_enabled ?? false);
        setDyslexiaFont(profile.dyslexia_font ?? false);
      }
    };
    checkSession();
  }, [navigate]);


  const handleUsernameUpdate = async () => {
    if (!newUsername.trim() || newUsername === username) {
      setIsEditingUsername(false);
      return;
    }

    // Validate username format
    const usernameSchema = z.string().regex(/^[a-zA-Z0-9_-]{3,20}$/, {
      message: "Username must be 3-20 characters and contain only letters, numbers, dashes, and underscores"
    });

    try {
      usernameSchema.parse(newUsername.trim());
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast({
          title: "Invalid username",
          description: e.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.trim() })
        .eq("id", session.user.id);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Error",
            description: "This username is already taken",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setUsername(newUsername);
      setIsEditingUsername(false);
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: deletePassword,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password. Please try again.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      // Call edge function to delete user account (includes auth.users deletion)
      const { data: authData } = await supabase.auth.getSession();
      const { error: deleteError } = await supabase.functions.invoke('delete-user', {
        headers: {
          Authorization: `Bearer ${authData.session?.access_token}`,
        },
      });

      if (deleteError) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again or contact support.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletePassword("");
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFavoriteSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSaveSubjects = async () => {
    if (favoriteSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one subject.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({ subjects: favoriteSubjects })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Favorite subjects updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subjects.",
        variant: "destructive",
      });
    }
  };

  const handleToggleXpVisibility = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newValue = !showXpInLeaderboard;
      
      const { error } = await supabase
        .from("profiles")
        .update({ show_xp_in_leaderboard: newValue })
        .eq("id", session.user.id);

      if (error) throw error;

      setShowXpInLeaderboard(newValue);
      toast({
        title: "Success",
        description: newValue 
          ? "Your XP is now visible in the leaderboard" 
          : "Your XP is now hidden from the leaderboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update XP visibility.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (field: string, value: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", session.user.id);

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
                <SettingsIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg">Appearance</h2>
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark theme
                  </p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </Card>
        </div>

        {/* Profile */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg">Profile</h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={isEditingUsername ? newUsername : username}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={!isEditingUsername}
                  placeholder="Enter username"
                />
                {isEditingUsername ? (
                  <div className="flex gap-2">
                    <Button onClick={handleUsernameUpdate} size="sm">
                      Save
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername(username);
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsEditingUsername(true)} 
                    variant="outline"
                    size="sm"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Favorite Subjects */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <Label>Favorite Subjects</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      favoriteSubjects.includes(subject)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              
              <Button
                onClick={handleSaveSubjects}
                disabled={favoriteSubjects.length === 0}
                variant="outline"
                className="w-full"
              >
                Save Subjects
              </Button>
            </div>
          </Card>
        </div>

        {/* Privacy */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy & Safety
          </h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Private Account</p>
                <p className="text-sm text-muted-foreground">
                  Only approved followers can see your content
                </p>
              </div>
              <Switch
                checked={accountPrivate}
                onCheckedChange={(val) => {
                  setAccountPrivate(val);
                  updateSetting("account_private", val);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Comment Privacy</Label>
              <Select value={commentPrivacy} onValueChange={(val) => {
                setCommentPrivacy(val);
                updateSetting("comment_privacy", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followers">Followers Only</SelectItem>
                  <SelectItem value="none">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Visibility
                </p>
                <p className="text-sm text-muted-foreground">
                  Allow others to find you via search
                </p>
              </div>
              <Switch
                checked={searchVisible}
                onCheckedChange={(val) => {
                  setSearchVisible(val);
                  updateSetting("search_visible", val);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Show XP in Leaderboard
                </p>
                <p className="text-sm text-muted-foreground">
                  {showXpInLeaderboard 
                    ? "Your XP points are visible to everyone" 
                    : "Your XP points are hidden from others"}
                </p>
              </div>
              <Switch
                checked={showXpInLeaderboard}
                onCheckedChange={handleToggleXpVisibility}
              />
            </div>
          </Card>
        </div>

        {/* Content & Feed */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Content & Feed
          </h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="space-y-2">
              <Label>Language Preference</Label>
              <Select value={language} onValueChange={(val) => {
                setLanguage(val);
                updateSetting("language", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="amharic">አማርኛ (Amharic)</SelectItem>
                  <SelectItem value="oromo">Afaan Oromoo (Oromo)</SelectItem>
                  <SelectItem value="tigrinya">ትግርኛ (Tigrinya)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Auto-play Videos</p>
                <p className="text-sm text-muted-foreground">
                  Videos start playing automatically
                </p>
              </div>
              <Switch
                checked={autoplayVideos}
                onCheckedChange={(val) => {
                  setAutoplayVideos(val);
                  updateSetting("autoplay_videos", val);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Content Difficulty Level</Label>
              <Select value={contentDifficulty} onValueChange={(val) => {
                setContentDifficulty(val);
                updateSetting("content_difficulty", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="normal">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Daily Time Goal: {dailyTimeGoal} min</span>
              </Label>
              <Slider
                value={[dailyTimeGoal]}
                onValueChange={(vals) => {
                  setDailyTimeGoal(vals[0]);
                }}
                onValueCommit={(vals) => {
                  updateSetting("daily_time_goal", vals[0]);
                }}
                min={10}
                max={180}
                step={10}
              />
            </div>
          </Card>
        </div>

        {/* AI & Personalization */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI & Personalization
          </h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="space-y-2">
              <Label>AI Assistance Level</Label>
              <Select value={aiAssistanceLevel} onValueChange={(val) => {
                setAiAssistanceLevel(val);
                updateSetting("ai_assistance_level", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Explain Simply</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Answer Mode
              </Label>
              <Select value={aiAnswerMode} onValueChange={(val) => {
                setAiAnswerMode(val);
                updateSetting("ai_answer_mode", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="voice">Voice (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>AI Personality</Label>
              <Select value={aiPersonality} onValueChange={(val) => {
                setAiPersonality(val);
                updateSetting("ai_personality", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Allow AI Data Usage</p>
                <p className="text-sm text-muted-foreground">
                  Use my activity to improve suggestions
                </p>
              </div>
              <Switch
                checked={allowAiDataUsage}
                onCheckedChange={(val) => {
                  setAllowAiDataUsage(val);
                  updateSetting("allow_ai_data_usage", val);
                }}
              />
            </div>
          </Card>
        </div>

        {/* Creator Settings */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Creator Settings
          </h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Upload Quality
              </Label>
              <Select value={uploadQuality} onValueChange={(val) => {
                setUploadQuality(val);
                updateSetting("upload_quality", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hd">HD (High Quality)</SelectItem>
                  <SelectItem value="sd">SD (Faster Upload)</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Master toggle for all notifications
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(val) => {
                  setNotificationsEnabled(val);
                  updateSetting("notifications_enabled", val);
                }}
              />
            </div>
            
            {notificationsEnabled && (
              <>
                <Separator />
                
                <div className="space-y-3 pl-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Likes</p>
                    <Switch
                      checked={notificationLikes}
                      onCheckedChange={(val) => {
                        setNotificationLikes(val);
                        updateSetting("notification_likes", val);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Comments</p>
                    <Switch
                      checked={notificationComments}
                      onCheckedChange={(val) => {
                        setNotificationComments(val);
                        updateSetting("notification_comments", val);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Study Reminders</p>
                    <Switch
                      checked={notificationReminders}
                      onCheckedChange={(val) => {
                        setNotificationReminders(val);
                        updateSetting("notification_reminders", val);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm">AI Suggestions</p>
                    <Switch
                      checked={notificationAiSuggestions}
                      onCheckedChange={(val) => {
                        setNotificationAiSuggestions(val);
                        updateSetting("notification_ai_suggestions", val);
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Accessibility */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Accessibility
          </h2>
          <Card className="p-4 space-y-4 shadow-card">
            <div className="space-y-2">
              <Label>Text Size</Label>
              <Select value={textSize} onValueChange={(val) => {
                setTextSize(val);
                updateSetting("text_size", val);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Enable Subtitles</p>
                <p className="text-sm text-muted-foreground">
                  Show captions on videos
                </p>
              </div>
              <Switch
                checked={subtitlesEnabled}
                onCheckedChange={(val) => {
                  setSubtitlesEnabled(val);
                  updateSetting("subtitles_enabled", val);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Dyslexia-Friendly Font</p>
                <p className="text-sm text-muted-foreground">
                  Use easier-to-read font
                </p>
              </div>
              <Switch
                checked={dyslexiaFont}
                onCheckedChange={(val) => {
                  setDyslexiaFont(val);
                  updateSetting("dyslexia_font", val);
                }}
              />
            </div>
          </Card>
        </div>

        {/* Account */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg">Account</h2>
          <Card className="p-4 space-y-3 shadow-card">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
              className="w-full"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full gap-2 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
      <BottomNav />

      {/* Password Change Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current password and choose a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground">
                Must have at least 5 letters and 1 number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete-password">Enter your password to confirm</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
