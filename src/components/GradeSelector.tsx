import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

const GRADES = [6, 7, 8, 9, 10, 11, 12];

interface GradeSelectorProps {
  onGradeSelected: (grade: number) => void;
}

const GradeSelector = ({ onGradeSelected }: GradeSelectorProps) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedGrade) {
      localStorage.setItem("demo_grade", selectedGrade.toString());
      onGradeSelected(selectedGrade);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Lernly AI
            </h1>
            <p className="text-muted-foreground mt-2">
              Select your grade to get started
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6 shadow-card">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-center">What grade are you in?</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  selectedGrade === grade
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-lg font-bold">Grade {grade}</div>
              </button>
            ))}
          </div>
        </Card>

        <Button
          onClick={handleConfirm}
          disabled={!selectedGrade}
          className="w-full h-12 text-base font-semibold shadow-elegant hover:shadow-xl transition-all"
          size="lg"
        >
          Start Learning
        </Button>
      </div>
    </div>
  );
};

export default GradeSelector;
