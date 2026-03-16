import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Moon, Sun, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/hooks/useTheme";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
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
            <Badge variant="secondary" className="ml-auto text-xs">Demo Mode</Badge>
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

        {/* Demo Info */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold text-lg">About</h2>
          <Card className="p-6 shadow-card text-center space-y-2">
            <p className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Lernly AI — Demo Mode
            </p>
            <p className="text-sm text-muted-foreground">
              This is a demo build. Account management, payments, and persistent data are disabled.
            </p>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
