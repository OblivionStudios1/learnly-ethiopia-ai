import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Search, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

const SUBJECTS = [
  { name: "Mathematics", icon: "📐", color: "from-blue-500 to-blue-600" },
  { name: "Physics", icon: "⚡", color: "from-purple-500 to-purple-600" },
  { name: "Chemistry", icon: "🧪", color: "from-green-500 to-green-600" },
  { name: "Biology", icon: "🧬", color: "from-emerald-500 to-emerald-600" },
  { name: "English", icon: "📚", color: "from-orange-500 to-orange-600" },
  { name: "History", icon: "🏛️", color: "from-amber-500 to-amber-600" },
  { name: "Geography", icon: "🌍", color: "from-cyan-500 to-cyan-600" },
  { name: "Amharic", icon: "🔤", color: "from-red-500 to-red-600" },
];

const TRENDING_TOPICS = [
  "Quadratic Equations",
  "Cell Division",
  "World War II",
  "Chemical Reactions",
  "Climate Change",
];

const NATIONAL_EXAM_GRADES = [6, 8];

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchVideoCounts = async () => {
      const { data: videos } = await supabase
        .from('videos')
        .select('subject');
      
      if (videos) {
        const counts: Record<string, number> = {};
        videos.forEach(video => {
          counts[video.subject] = (counts[video.subject] || 0) + 1;
        });
        setVideoCounts(counts);
      }
    };
    fetchVideoCounts();
  }, []);

  const filteredSubjects = SUBJECTS.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubjectClick = (subjectName: string) => {
    navigate('/home', { state: { filterSubject: subjectName, filterGrade: selectedGrade } });
  };

  const handleGradeClick = (grade: number) => {
    setSelectedGrade(grade === selectedGrade ? null : grade);
  };

  const showNationalExamSection = selectedGrade !== null && NATIONAL_EXAM_GRADES.includes(selectedGrade);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="pt-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Explore</h1>
              <p className="text-muted-foreground">
                Discover content by subject and grade
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">Demo Mode</Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects..."
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Grade Filter */}
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-semibold">Filter by Grade</h2>
          <div className="flex flex-wrap gap-2">
            {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
              <button
                key={grade}
                onClick={() => handleGradeClick(grade)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                  selectedGrade === grade
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary hover:bg-primary/10'
                }`}
              >
                Grade {grade}
              </button>
            ))}
          </div>
        </div>

        {/* National Exam Practice Section */}
        {showNationalExamSection && (
          <div className="space-y-3 animate-slide-up">
            <Card 
              className="p-5 shadow-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => navigate('/national-exam', { state: { grade: selectedGrade } })}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant flex-shrink-0">
                  <GraduationCap className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">National Exam Practice</h3>
                    <Badge variant="secondary" className="text-xs">Grade {selectedGrade}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Practice using past Ethiopian Ministry National Exams to prepare for the national assessment.
                  </p>
                  <p className="text-xs text-primary font-medium mt-2">
                    Tap to browse exams by year →
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trending Topics */}
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TOPICS.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Browse by Subject</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredSubjects.map((subject) => (
              <Card
                key={subject.name}
                onClick={() => handleSubjectClick(subject.name)}
                className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105 group"
              >
                <div className="space-y-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {videoCounts[subject.name] || 0} videos
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Explore;
