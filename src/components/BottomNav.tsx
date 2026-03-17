import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, GraduationCap, Compass, Sparkles, User, Upload } from "lucide-react";
import UploadVideoDialog from "@/components/UploadVideoDialog";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: GraduationCap, label: "Exams", path: "/national-exam" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Upload, label: "Upload", path: "upload" },
    { icon: Sparkles, label: "Ask AI", path: "/ask-ai" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isUpload = item.path === "upload";
            const isActive = !isUpload && location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (isUpload) {
                    setShowUpload(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary scale-110"
                    : isUpload
                    ? "text-primary hover:scale-110"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <UploadVideoDialog open={showUpload} onOpenChange={setShowUpload} />
    </>
  );
};

export default BottomNav;
