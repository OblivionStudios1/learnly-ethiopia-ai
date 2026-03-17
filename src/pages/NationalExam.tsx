import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, BookOpen, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";

// Ethiopian calendar years 2006–2018 EC
const EXAM_YEARS = [
  2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006,
];

const SUBJECTS_BY_GRADE: Record<number, string[]> = {
  6: ["Mathematics", "English", "Amharic", "General Science", "Social Studies"],
  8: ["Mathematics", "English", "Amharic", "Biology", "Chemistry", "Physics", "Geography", "History"],
};

// Demo exam questions per subject
const DEMO_QUESTIONS: Record<string, Array<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}>> = {
  Mathematics: [
    {
      question: "What is the value of 3² + 4²?",
      options: ["7", "12", "25", "49"],
      correctIndex: 2,
      explanation: "3² + 4² = 9 + 16 = 25. This is related to the Pythagorean theorem where 3² + 4² = 5².",
    },
    {
      question: "Simplify: 2(x + 3) - 4",
      options: ["2x + 2", "2x + 6", "2x - 1", "2x + 10"],
      correctIndex: 0,
      explanation: "2(x + 3) - 4 = 2x + 6 - 4 = 2x + 2",
    },
    {
      question: "What is the LCM of 12 and 18?",
      options: ["6", "36", "72", "216"],
      correctIndex: 1,
      explanation: "12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 4 × 9 = 36",
    },
    {
      question: "If a triangle has angles of 60° and 80°, what is the third angle?",
      options: ["30°", "40°", "50°", "60°"],
      correctIndex: 1,
      explanation: "The sum of angles in a triangle is 180°. So the third angle = 180° - 60° - 80° = 40°.",
    },
    {
      question: "What is 15% of 200?",
      options: ["15", "20", "30", "35"],
      correctIndex: 2,
      explanation: "15% of 200 = (15/100) × 200 = 30",
    },
  ],
  English: [
    {
      question: "Choose the correct form: She ___ to school every day.",
      options: ["go", "goes", "going", "gone"],
      correctIndex: 1,
      explanation: "With third person singular (she), we use 'goes' in simple present tense.",
    },
    {
      question: "Which word is a synonym for 'happy'?",
      options: ["Sad", "Angry", "Joyful", "Tired"],
      correctIndex: 2,
      explanation: "'Joyful' means feeling great happiness, which is a synonym for 'happy'.",
    },
    {
      question: "Identify the noun in: 'The cat sat on the mat.'",
      options: ["sat", "on", "cat", "the"],
      correctIndex: 2,
      explanation: "'Cat' and 'mat' are nouns. 'Cat' is the subject noun in this sentence.",
    },
    {
      question: "What is the past tense of 'write'?",
      options: ["writed", "wrote", "written", "writing"],
      correctIndex: 1,
      explanation: "The past tense of 'write' is 'wrote'. 'Written' is the past participle.",
    },
    {
      question: "Which sentence is correct?",
      options: [
        "Their going to the park.",
        "They're going to the park.",
        "There going to the park.",
        "Theyre going to the park.",
      ],
      correctIndex: 1,
      explanation: "'They're' is the contraction of 'they are', which is correct here.",
    },
  ],
  Amharic: [
    {
      question: "የአማርኛ ፊደል ስንት ነው?",
      options: ["26", "33", "34", "231"],
      correctIndex: 2,
      explanation: "የአማርኛ ፊደል 34 መሰረታዊ ፊደላት አሉት።",
    },
    {
      question: "ከሚከተሉት ውስጥ ስም የሆነው የትኛው ነው?",
      options: ["ሮጠ", "ቤት", "ቀይ", "በፍጥነት"],
      correctIndex: 1,
      explanation: "'ቤት' ስም ነው። 'ሮጠ' ግስ ነው፣ 'ቀይ' ቅፅል ነው፣ 'በፍጥነት' ተውሳከ ግስ ነው።",
    },
    {
      question: "'መፅሐፍ' የሚለው ቃል ምን ዓይነት ቃል ነው?",
      options: ["ግስ", "ስም", "ቅፅል", "መስተዋድድ"],
      correctIndex: 1,
      explanation: "'መፅሐፍ' ስም ነው - የነገር ስም ተብሎ ይከፈላል።",
    },
    {
      question: "ከሚከተሉት ውስጥ ግስ የሆነው?",
      options: ["ውሻ", "ተማረ", "ረጅም", "ዛሬ"],
      correctIndex: 1,
      explanation: "'ተማረ' ግስ ነው - ተግባርን ወይም ሁኔታን ይገልፃል።",
    },
    {
      question: "የ'ደስታ' ተቃራኒ ቃል የትኛው ነው?",
      options: ["ሀዘን", "ፍቅር", "ተስፋ", "ብርታት"],
      correctIndex: 0,
      explanation: "የ'ደስታ' ተቃራኒ ቃል 'ሀዘን' ነው።",
    },
  ],
  "General Science": [
    {
      question: "What is the boiling point of water in Celsius?",
      options: ["50°C", "100°C", "150°C", "200°C"],
      correctIndex: 1,
      explanation: "Water boils at 100°C (212°F) at standard atmospheric pressure.",
    },
    {
      question: "Which planet is closest to the Sun?",
      options: ["Venus", "Earth", "Mercury", "Mars"],
      correctIndex: 2,
      explanation: "Mercury is the closest planet to the Sun in our solar system.",
    },
    {
      question: "What gas do plants absorb from the atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correctIndex: 2,
      explanation: "Plants absorb carbon dioxide (CO₂) during photosynthesis.",
    },
    {
      question: "What is the largest organ in the human body?",
      options: ["Heart", "Liver", "Brain", "Skin"],
      correctIndex: 3,
      explanation: "The skin is the largest organ, covering about 2 square meters in adults.",
    },
    {
      question: "Which state of matter has a definite shape and volume?",
      options: ["Gas", "Liquid", "Solid", "Plasma"],
      correctIndex: 2,
      explanation: "Solids have both a definite shape and a definite volume.",
    },
  ],
  "Social Studies": [
    {
      question: "What is the capital city of Ethiopia?",
      options: ["Dire Dawa", "Hawassa", "Addis Ababa", "Bahir Dar"],
      correctIndex: 2,
      explanation: "Addis Ababa is the capital and largest city of Ethiopia.",
    },
    {
      question: "Which Ethiopian emperor is credited with modernizing the country?",
      options: ["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"],
      correctIndex: 0,
      explanation: "Emperor Menelik II is credited with modernizing Ethiopia, including building railways and establishing Addis Ababa.",
    },
    {
      question: "What is the Ethiopian calendar based on?",
      options: ["Gregorian calendar", "Lunar calendar", "Coptic calendar", "Chinese calendar"],
      correctIndex: 2,
      explanation: "The Ethiopian calendar is based on the Coptic calendar and is approximately 7-8 years behind the Gregorian calendar.",
    },
    {
      question: "How many regional states are in Ethiopia?",
      options: ["9", "10", "11", "12"],
      correctIndex: 2,
      explanation: "Ethiopia currently has 11 regional states and 2 chartered cities.",
    },
    {
      question: "The Battle of Adwa was fought in which year (EC)?",
      options: ["1888", "1889", "1890", "1891"],
      correctIndex: 0,
      explanation: "The Battle of Adwa was fought in 1888 EC (1896 GC), where Ethiopia defeated Italy.",
    },
  ],
  Biology: [
    {
      question: "What is the basic unit of life?",
      options: ["Atom", "Molecule", "Cell", "Organ"],
      correctIndex: 2,
      explanation: "The cell is the basic structural and functional unit of all living organisms.",
    },
    {
      question: "Which organelle is responsible for photosynthesis?",
      options: ["Mitochondria", "Chloroplast", "Ribosome", "Nucleus"],
      correctIndex: 1,
      explanation: "Chloroplasts contain chlorophyll and are responsible for photosynthesis in plant cells.",
    },
    {
      question: "What is the process by which organisms maintain a stable internal environment?",
      options: ["Metabolism", "Homeostasis", "Evolution", "Reproduction"],
      correctIndex: 1,
      explanation: "Homeostasis is the process of maintaining a stable internal environment despite external changes.",
    },
    {
      question: "DNA stands for:",
      options: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribonitric Acid"],
      correctIndex: 1,
      explanation: "DNA stands for Deoxyribonucleic Acid, the molecule that carries genetic information.",
    },
    {
      question: "Which blood type is known as the universal donor?",
      options: ["A+", "B+", "AB+", "O-"],
      correctIndex: 3,
      explanation: "O- (O negative) is the universal donor because it can be given to any blood type.",
    },
  ],
  Chemistry: [
    {
      question: "What is the chemical symbol for water?",
      options: ["HO", "H₂O", "OH₂", "H₃O"],
      correctIndex: 1,
      explanation: "Water's chemical formula is H₂O — two hydrogen atoms and one oxygen atom.",
    },
    {
      question: "How many elements are in the periodic table (approximately)?",
      options: ["92", "100", "118", "150"],
      correctIndex: 2,
      explanation: "There are currently 118 confirmed elements in the periodic table.",
    },
    {
      question: "What is the pH of a neutral solution?",
      options: ["0", "7", "10", "14"],
      correctIndex: 1,
      explanation: "A neutral solution has a pH of 7. Below 7 is acidic, above 7 is basic.",
    },
    {
      question: "Which gas is most abundant in Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
      correctIndex: 2,
      explanation: "Nitrogen makes up about 78% of Earth's atmosphere.",
    },
    {
      question: "What type of bond involves sharing electrons?",
      options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
      correctIndex: 1,
      explanation: "A covalent bond involves the sharing of electron pairs between atoms.",
    },
  ],
  Physics: [
    {
      question: "What is the SI unit of force?",
      options: ["Joule", "Watt", "Newton", "Pascal"],
      correctIndex: 2,
      explanation: "The Newton (N) is the SI unit of force. 1 N = 1 kg⋅m/s².",
    },
    {
      question: "What is the speed of light approximately?",
      options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
      correctIndex: 1,
      explanation: "The speed of light in a vacuum is approximately 3 × 10⁸ m/s (300,000 km/s).",
    },
    {
      question: "Newton's first law is also known as the law of:",
      options: ["Acceleration", "Inertia", "Gravity", "Momentum"],
      correctIndex: 1,
      explanation: "Newton's first law is the law of inertia — an object at rest stays at rest unless acted upon by a force.",
    },
    {
      question: "What form of energy is stored in a stretched rubber band?",
      options: ["Kinetic energy", "Thermal energy", "Elastic potential energy", "Chemical energy"],
      correctIndex: 2,
      explanation: "A stretched rubber band stores elastic potential energy, which converts to kinetic energy when released.",
    },
    {
      question: "What is the unit of electrical resistance?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      correctIndex: 2,
      explanation: "The Ohm (Ω) is the SI unit of electrical resistance.",
    },
  ],
  Geography: [
    {
      question: "What is the longest river in Ethiopia?",
      options: ["Awash", "Blue Nile (Abay)", "Omo", "Wabe Shebelle"],
      correctIndex: 1,
      explanation: "The Blue Nile (Abay) is the longest river originating in Ethiopia, starting from Lake Tana.",
    },
    {
      question: "Which Ethiopian region has the lowest point in Africa?",
      options: ["Tigray", "Afar", "Somali", "Oromia"],
      correctIndex: 1,
      explanation: "The Danakil Depression in the Afar region is one of the lowest points on Earth.",
    },
    {
      question: "What is the Great Rift Valley?",
      options: ["A mountain range", "A tectonic depression", "An ocean trench", "A river valley"],
      correctIndex: 1,
      explanation: "The Great Rift Valley is a tectonic depression caused by the separation of tectonic plates, running through Ethiopia.",
    },
    {
      question: "What type of climate does the Ethiopian highlands have?",
      options: ["Tropical", "Temperate", "Arid", "Arctic"],
      correctIndex: 1,
      explanation: "The Ethiopian highlands have a temperate climate due to their high elevation, despite being near the equator.",
    },
    {
      question: "Lake Tana is the source of which river?",
      options: ["White Nile", "Blue Nile", "Awash", "Omo"],
      correctIndex: 1,
      explanation: "Lake Tana, located in northwestern Ethiopia, is the source of the Blue Nile (Abay).",
    },
  ],
  History: [
    {
      question: "When was the Battle of Adwa fought (Gregorian calendar)?",
      options: ["1886", "1896", "1906", "1916"],
      correctIndex: 1,
      explanation: "The Battle of Adwa was fought on March 1, 1896, resulting in Ethiopian victory over Italy.",
    },
    {
      question: "Who was the last emperor of Ethiopia?",
      options: ["Menelik II", "Haile Selassie", "Tewodros II", "Lij Iyasu"],
      correctIndex: 1,
      explanation: "Haile Selassie was the last emperor of Ethiopia, ruling from 1930 to 1974.",
    },
    {
      question: "The Aksumite Empire was located in present-day:",
      options: ["Kenya", "Sudan", "Northern Ethiopia and Eritrea", "Somalia"],
      correctIndex: 2,
      explanation: "The Aksumite Empire was centered in what is now northern Ethiopia and Eritrea.",
    },
    {
      question: "What ancient Ethiopian city was known for its tall stelae (obelisks)?",
      options: ["Lalibela", "Aksum", "Gondar", "Harar"],
      correctIndex: 1,
      explanation: "Aksum is famous for its tall stelae (obelisks), some of which are over 1,700 years old.",
    },
    {
      question: "The Zagwe Dynasty is known for building:",
      options: ["The Stelae of Aksum", "The Rock-Hewn Churches of Lalibela", "The Castles of Gondar", "The Walls of Harar"],
      correctIndex: 1,
      explanation: "The Zagwe Dynasty, particularly King Lalibela, is credited with building the famous rock-hewn churches of Lalibela.",
    },
  ],
};

type ViewMode = "years" | "subjects" | "exam";

const NationalExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedGrade = parseInt(localStorage.getItem("demo_grade") || "8");
  const gradeFromState = location.state?.grade || (storedGrade === 6 || storedGrade === 8 ? storedGrade : 8);
  
  const [selectedGrade, setSelectedGrade] = useState<number>(gradeFromState);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("years");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [examFinished, setExamFinished] = useState(false);

  const subjects = SUBJECTS_BY_GRADE[selectedGrade] || SUBJECTS_BY_GRADE[8];
  const questions = selectedSubject ? (DEMO_QUESTIONS[selectedSubject] || []) : [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setViewMode("subjects");
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setExamFinished(false);
    setViewMode("exam");
  };

  const handleAnswerSelect = (index: number) => {
    if (answeredQuestions.has(currentQuestionIndex)) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const newAnswered = new Set(answeredQuestions);
    newAnswered.add(currentQuestionIndex);
    setAnsweredQuestions(newAnswered);
    
    if (index === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setExamFinished(true);
    }
  };

  const handleBack = () => {
    if (viewMode === "exam") {
      setViewMode("subjects");
      setSelectedSubject(null);
    } else if (viewMode === "subjects") {
      setViewMode("years");
      setSelectedYear(null);
    } else {
      navigate("/explore");
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setExamFinished(false);
  };

  const handleGradeSwitch = (grade: number) => {
    setSelectedGrade(grade);
    setViewMode("years");
    setSelectedYear(null);
    setSelectedSubject(null);
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
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">National Exam Practice</h1>
                <p className="text-sm text-muted-foreground">
                  Grade {selectedGrade} • Ethiopian Ministry Exams
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">Demo</Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-xl p-3">
            📝 Practice using past Ethiopian Ministry National Exams to prepare for the national assessment.
          </p>

          {/* Grade Toggle */}
          <div className="flex gap-2">
            {[6, 8].map((g) => (
              <button
                key={g}
                onClick={() => handleGradeSwitch(g)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                  selectedGrade === g
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary hover:bg-primary/10'
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Year Selection */}
        {viewMode === "years" && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Select Exam Year (EC)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {EXAM_YEARS.map((year) => (
                <Card
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className="p-4 text-center cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary"
                >
                  <p className="text-2xl font-bold text-primary">{year}</p>
                  <p className="text-xs text-muted-foreground">EC</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {viewMode === "subjects" && selectedYear && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedYear} EC — Choose Subject
            </h2>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <Card
                  key={subject}
                  onClick={() => handleSubjectSelect(subject)}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{subject}</h3>
                        <p className="text-xs text-muted-foreground">5 questions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Exam View */}
        {viewMode === "exam" && selectedSubject && !examFinished && currentQuestion && (
          <div className="space-y-4 animate-fade-in">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{selectedSubject} — {selectedYear} EC</span>
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let optionStyle = "border-border hover:border-primary hover:bg-primary/5";
                  
                  if (showExplanation) {
                    if (index === currentQuestion.correctIndex) {
                      optionStyle = "border-green-500 bg-green-50 dark:bg-green-950/30";
                    } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                      optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/30";
                    } else {
                      optionStyle = "border-border opacity-50";
                    }
                  } else if (selectedAnswer === index) {
                    optionStyle = "border-primary bg-primary/10";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={answeredQuestions.has(currentQuestionIndex)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="font-medium">{option}</span>
                        {showExplanation && index === currentQuestion.correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                        )}
                        {showExplanation && index === selectedAnswer && index !== currentQuestion.correctIndex && (
                          <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Explanation */}
            {showExplanation && (
              <Card className="p-4 bg-muted/50 border-primary/20 animate-slide-up">
                <p className="text-sm font-medium text-primary mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </Card>
            )}

            {/* Next Button */}
            {showExplanation && (
              <Button onClick={handleNext} className="w-full shadow-elegant" size="lg">
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {examFinished && (
          <div className="space-y-4 animate-slide-up">
            <Card className="p-8 text-center shadow-card space-y-4">
              <div className="text-6xl mb-2">
                {score >= questions.length * 0.8 ? "🎉" : score >= questions.length * 0.5 ? "👍" : "📚"}
              </div>
              <h2 className="text-3xl font-bold">
                {score} / {questions.length}
              </h2>
              <p className="text-muted-foreground">
                {selectedSubject} — {selectedYear} EC • Grade {selectedGrade}
              </p>
              <p className="text-lg font-medium">
                {score >= questions.length * 0.8
                  ? "Excellent! You're well prepared!"
                  : score >= questions.length * 0.5
                  ? "Good job! Keep practicing!"
                  : "Keep studying, you'll get better!"}
              </p>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={() => setViewMode("subjects")} className="flex-1">
                  Choose Another Subject
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default NationalExam;
