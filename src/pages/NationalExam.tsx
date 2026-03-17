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

// Large question pools per subject — at least 20 questions each
const QUESTION_POOL: Record<string, Array<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}>> = {
  Mathematics: [
    { question: "What is the value of 3² + 4²?", options: ["7", "12", "25", "49"], correctIndex: 2, explanation: "3² + 4² = 9 + 16 = 25." },
    { question: "Simplify: 2(x + 3) - 4", options: ["2x + 2", "2x + 6", "2x - 1", "2x + 10"], correctIndex: 0, explanation: "2(x + 3) - 4 = 2x + 6 - 4 = 2x + 2" },
    { question: "What is the LCM of 12 and 18?", options: ["6", "36", "72", "216"], correctIndex: 1, explanation: "LCM = 2² × 3² = 36" },
    { question: "If a triangle has angles of 60° and 80°, what is the third angle?", options: ["30°", "40°", "50°", "60°"], correctIndex: 1, explanation: "180° - 60° - 80° = 40°" },
    { question: "What is 15% of 200?", options: ["15", "20", "30", "35"], correctIndex: 2, explanation: "15% of 200 = 30" },
    { question: "What is the GCF of 24 and 36?", options: ["6", "8", "12", "24"], correctIndex: 2, explanation: "24 = 2³×3, 36 = 2²×3². GCF = 2²×3 = 12" },
    { question: "Solve: 5x = 35", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "x = 35/5 = 7" },
    { question: "What is the area of a rectangle with length 8 and width 5?", options: ["13", "26", "40", "45"], correctIndex: 2, explanation: "Area = 8 × 5 = 40" },
    { question: "Which number is prime?", options: ["15", "21", "23", "27"], correctIndex: 2, explanation: "23 is only divisible by 1 and itself." },
    { question: "What is 3/4 + 1/4?", options: ["1/2", "3/4", "1", "4/4"], correctIndex: 2, explanation: "3/4 + 1/4 = 4/4 = 1" },
    { question: "Convert 0.75 to a fraction.", options: ["1/2", "3/4", "7/10", "3/5"], correctIndex: 1, explanation: "0.75 = 75/100 = 3/4" },
    { question: "What is the perimeter of a square with side 9?", options: ["18", "27", "36", "81"], correctIndex: 2, explanation: "Perimeter = 4 × 9 = 36" },
    { question: "Evaluate: (-3) × (-4)", options: ["-12", "-7", "7", "12"], correctIndex: 3, explanation: "Negative × negative = positive. 3 × 4 = 12" },
    { question: "What is the median of 2, 5, 7, 8, 10?", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "The middle value of the sorted set is 7." },
    { question: "Solve: x + 7 = 15", options: ["7", "8", "9", "22"], correctIndex: 1, explanation: "x = 15 - 7 = 8" },
    { question: "What is 2⁵?", options: ["10", "16", "25", "32"], correctIndex: 3, explanation: "2⁵ = 2×2×2×2×2 = 32" },
    { question: "How many degrees are in a straight angle?", options: ["90°", "120°", "180°", "360°"], correctIndex: 2, explanation: "A straight angle measures 180°." },
    { question: "What is the volume of a cube with side 3 cm?", options: ["9 cm³", "18 cm³", "27 cm³", "81 cm³"], correctIndex: 2, explanation: "Volume = 3³ = 27 cm³" },
    { question: "Simplify: 12/16", options: ["2/3", "3/4", "4/5", "6/8"], correctIndex: 1, explanation: "12/16 = 3/4 (divide both by 4)" },
    { question: "What is the next number: 2, 6, 18, 54, ...?", options: ["72", "108", "162", "216"], correctIndex: 2, explanation: "Each number is multiplied by 3. 54 × 3 = 162" },
  ],
  English: [
    { question: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], correctIndex: 1, explanation: "Third person singular uses 'goes' in simple present." },
    { question: "Which word is a synonym for 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], correctIndex: 2, explanation: "'Joyful' is a synonym for 'happy'." },
    { question: "Identify the noun in: 'The cat sat on the mat.'", options: ["sat", "on", "cat", "the"], correctIndex: 2, explanation: "'Cat' is the subject noun." },
    { question: "What is the past tense of 'write'?", options: ["writed", "wrote", "written", "writing"], correctIndex: 1, explanation: "Past tense of 'write' is 'wrote'." },
    { question: "Which sentence is correct?", options: ["Their going to the park.", "They're going to the park.", "There going to the park.", "Theyre going to the park."], correctIndex: 1, explanation: "'They're' = 'they are'." },
    { question: "What is an antonym of 'ancient'?", options: ["Old", "Modern", "Historic", "Classic"], correctIndex: 1, explanation: "'Modern' is the opposite of 'ancient'." },
    { question: "Choose the correct word: The dog wagged ___ tail.", options: ["it's", "its", "it", "their"], correctIndex: 1, explanation: "'Its' is the possessive form (no apostrophe)." },
    { question: "Which is a compound sentence?", options: ["I ran fast.", "I ran fast, and I won the race.", "Running fast.", "The fast runner."], correctIndex: 1, explanation: "A compound sentence has two independent clauses joined by a conjunction." },
    { question: "What part of speech is 'quickly'?", options: ["Noun", "Verb", "Adjective", "Adverb"], correctIndex: 3, explanation: "'Quickly' modifies a verb, making it an adverb." },
    { question: "Which word is spelled correctly?", options: ["Recieve", "Receive", "Receve", "Receeve"], correctIndex: 1, explanation: "'Receive' follows the 'i before e except after c' rule." },
    { question: "What is the plural of 'child'?", options: ["Childs", "Children", "Childes", "Childrens"], correctIndex: 1, explanation: "'Children' is the irregular plural of 'child'." },
    { question: "Choose the correct preposition: The book is ___ the table.", options: ["in", "on", "at", "by"], correctIndex: 1, explanation: "'On' indicates the book is resting on the surface." },
    { question: "What does 'benevolent' mean?", options: ["Evil", "Kind", "Lazy", "Brave"], correctIndex: 1, explanation: "'Benevolent' means well-meaning and kind." },
    { question: "Which is a proper noun?", options: ["city", "river", "Ethiopia", "country"], correctIndex: 2, explanation: "'Ethiopia' is a proper noun (specific name)." },
    { question: "The comparative form of 'good' is:", options: ["gooder", "more good", "better", "best"], correctIndex: 2, explanation: "'Better' is the comparative form of 'good'." },
    { question: "Which sentence uses a simile?", options: ["She is brave.", "She is as brave as a lion.", "She bravely fought.", "Her bravery was noted."], correctIndex: 1, explanation: "A simile uses 'as...as' or 'like' to compare." },
    { question: "What type of sentence is: 'Close the door!'?", options: ["Declarative", "Interrogative", "Imperative", "Exclamatory"], correctIndex: 2, explanation: "An imperative sentence gives a command." },
    { question: "Which word has a prefix?", options: ["running", "unhappy", "quickly", "teacher"], correctIndex: 1, explanation: "'Un-' is a prefix meaning 'not'." },
    { question: "A paragraph's main idea is usually found in the:", options: ["Last sentence", "Topic sentence", "Middle sentence", "Title"], correctIndex: 1, explanation: "The topic sentence states the main idea of the paragraph." },
    { question: "Which is the correct contraction for 'will not'?", options: ["willn't", "won't", "will't", "wouldn't"], correctIndex: 1, explanation: "'Won't' is the correct contraction of 'will not'." },
  ],
  Amharic: [
    { question: "የአማርኛ ፊደል ስንት ነው?", options: ["26", "33", "34", "231"], correctIndex: 2, explanation: "የአማርኛ ፊደል 34 መሰረታዊ ፊደላት አሉት።" },
    { question: "ከሚከተሉት ውስጥ ስም የሆነው የትኛው ነው?", options: ["ሮጠ", "ቤት", "ቀይ", "በፍጥነት"], correctIndex: 1, explanation: "'ቤት' ስም ነው።" },
    { question: "'መፅሐፍ' የሚለው ቃል ምን ዓይነት ቃል ነው?", options: ["ግስ", "ስም", "ቅፅል", "መስተዋድድ"], correctIndex: 1, explanation: "'መፅሐፍ' ስም ነው።" },
    { question: "ከሚከተሉት ውስጥ ግስ የሆነው?", options: ["ውሻ", "ተማረ", "ረጅም", "ዛሬ"], correctIndex: 1, explanation: "'ተማረ' ግስ ነው።" },
    { question: "የ'ደስታ' ተቃራኒ ቃል የትኛው ነው?", options: ["ሀዘን", "ፍቅር", "ተስፋ", "ብርታት"], correctIndex: 0, explanation: "የ'ደስታ' ተቃራኒ ቃል 'ሀዘን' ነው።" },
    { question: "ከሚከተሉት ውስጥ ቅፅል የሆነው?", options: ["ሰማይ", "ሮጠ", "ቆንጆ", "ዛሬ"], correctIndex: 2, explanation: "'ቆንጆ' ቅፅል ነው - ገለጻ ይሰጣል።" },
    { question: "'ት/ቤት' ምን ማለት ነው?", options: ["ቤተ-መንግሥት", "ትምህርት ቤት", "ቤተ-ክርስቲያን", "ሆስፒታል"], correctIndex: 1, explanation: "'ት/ቤት' የ'ትምህርት ቤት' ምህፃረ ቃል ነው።" },
    { question: "በአማርኛ ዓ.ም ምን ማለት ነው?", options: ["ዓለም ምድር", "ዓመተ ምህረት", "ዓመት ማለት", "ዓቢይ ምህረት"], correctIndex: 1, explanation: "ዓ.ም = ዓመተ ምህረት" },
    { question: "ከሚከተሉት ውስጥ መስተዋድድ የሆነው?", options: ["ቤት", "ውስጥ", "ሮጠ", "ቀይ"], correctIndex: 1, explanation: "'ውስጥ' መስተዋድድ ነው - ቦታ ያሳያል።" },
    { question: "'አበበ በሶ በላ' ውስጥ ባለቤት ማን ነው?", options: ["በሶ", "በላ", "አበበ", "ውስጥ"], correctIndex: 2, explanation: "'አበበ' የዓረፍተ ነገሩ ባለቤት (ፋዊል) ነው።" },
    { question: "የ'ሞቃት' ተቃራኒ ቃል?", options: ["ቀዝቃዛ", "ደረቅ", "እርጥብ", "ጨለማ"], correctIndex: 0, explanation: "የ'ሞቃት' ተቃራኒ 'ቀዝቃዛ' ነው።" },
    { question: "ከሚከተሉት ውስጥ ተውሳከ ግስ የሆነው?", options: ["ቤት", "ዛሬ", "መጣ", "ረጅም"], correctIndex: 1, explanation: "'ዛሬ' ተውሳከ ግስ ነው - ጊዜ ያሳያል።" },
    { question: "የ'ፈጣን' ተቃራኒ ቃል?", options: ["ረጅም", "ዘገምተኛ", "ትንሽ", "ትልቅ"], correctIndex: 1, explanation: "የ'ፈጣን' ተቃራኒ 'ዘገምተኛ' ነው።" },
    { question: "'ልጅ' የሚለው ቃል ብዙ ቁጥር?", options: ["ልጆች", "ልጅች", "ልጅዎች", "ልጆቹ"], correctIndex: 0, explanation: "'ልጅ' ብዙ ቁጥሩ 'ልጆች' ነው።" },
    { question: "ከሚከተሉት ውስጥ ድርብ ፊደል ያለው?", options: ["ሰላም", "ቸርነት", "ብርሃን", "መልካም"], correctIndex: 1, explanation: "'ቸ' ድርብ ፊደል ነው።" },
    { question: "የአንቀጽ ዋና ሀሳብ በተለምዶ የት ይገኛል?", options: ["በመጨረሻ", "በመጀመሪያ ዓረፍተ ነገር", "በመሐል", "በርዕሱ"], correctIndex: 1, explanation: "የአንቀጽ ዋና ሀሳብ ብዙ ጊዜ በመጀመሪያ ዓረፍተ ነገር ውስጥ ይገኛል።" },
    { question: "ከሚከተሉት ውስጥ ትክክለኛ ሥርዓተ-ነጥብ ያለው?", options: ["ሰላም ነህ", "ሰላም ነህ?", "ሰላም ነህ!", "ሰላም፣ ነህ"], correctIndex: 1, explanation: "ጥያቄ ስለሆነ የጥያቄ ምልክት (?) ያስፈልጋል።" },
    { question: "የ'ትልቅ' ተቃራኒ ቃል?", options: ["ረጅም", "አጭር", "ትንሽ", "ሰፊ"], correctIndex: 2, explanation: "የ'ትልቅ' ተቃራኒ 'ትንሽ' ነው።" },
    { question: "'ኢትዮጵያ' ምን ዓይነት ስም ነው?", options: ["የነገር ስም", "የባሕሪ ስም", "የእውነተኛ ስም", "የሰው ስም"], correctIndex: 2, explanation: "'ኢትዮጵያ' የእውነተኛ ስም (proper noun) ነው - የአገር ስም።" },
    { question: "በአማርኛ ስንት ፊደል ቤተሰቦች አሉ?", options: ["5", "7", "8", "10"], correctIndex: 1, explanation: "በአማርኛ 7 ፊደል ቤተሰቦች (orders) አሉ።" },
  ],
  "General Science": [
    { question: "What is the boiling point of water?", options: ["50°C", "100°C", "150°C", "200°C"], correctIndex: 1, explanation: "Water boils at 100°C at standard pressure." },
    { question: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], correctIndex: 2, explanation: "Mercury is the closest planet to the Sun." },
    { question: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2, explanation: "Plants absorb CO₂ during photosynthesis." },
    { question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Brain", "Skin"], correctIndex: 3, explanation: "The skin is the largest organ." },
    { question: "Which state of matter has a definite shape?", options: ["Gas", "Liquid", "Solid", "Plasma"], correctIndex: 2, explanation: "Solids have definite shape and volume." },
    { question: "What is the chemical symbol for oxygen?", options: ["Ox", "O", "O₂", "Og"], correctIndex: 1, explanation: "The chemical symbol for oxygen is O." },
    { question: "How many bones does an adult human have?", options: ["106", "156", "206", "306"], correctIndex: 2, explanation: "An adult human has 206 bones." },
    { question: "What is the process plants use to make food?", options: ["Respiration", "Digestion", "Photosynthesis", "Fermentation"], correctIndex: 2, explanation: "Photosynthesis converts light energy to food." },
    { question: "Which force keeps us on the ground?", options: ["Friction", "Magnetism", "Gravity", "Tension"], correctIndex: 2, explanation: "Gravity pulls objects toward Earth's center." },
    { question: "What organ pumps blood in the body?", options: ["Brain", "Lungs", "Liver", "Heart"], correctIndex: 3, explanation: "The heart pumps blood throughout the body." },
    { question: "What is the freezing point of water?", options: ["-10°C", "0°C", "10°C", "32°C"], correctIndex: 1, explanation: "Water freezes at 0°C (32°F)." },
    { question: "Which vitamin does the Sun help produce?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctIndex: 3, explanation: "Sunlight helps the body produce Vitamin D." },
    { question: "What do we call animals that eat only plants?", options: ["Carnivores", "Herbivores", "Omnivores", "Decomposers"], correctIndex: 1, explanation: "Herbivores eat only plants." },
    { question: "Sound travels fastest through:", options: ["Air", "Water", "Solids", "Vacuum"], correctIndex: 2, explanation: "Sound travels fastest through solids due to closely packed molecules." },
    { question: "Which part of the plant absorbs water?", options: ["Leaves", "Stem", "Roots", "Flowers"], correctIndex: 2, explanation: "Roots absorb water and minerals from the soil." },
    { question: "What is the main gas in the air we breathe?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correctIndex: 1, explanation: "Nitrogen makes up about 78% of air." },
    { question: "How many legs does an insect have?", options: ["4", "6", "8", "10"], correctIndex: 1, explanation: "All insects have 6 legs." },
    { question: "The Earth revolves around the Sun in about:", options: ["24 hours", "30 days", "365 days", "100 days"], correctIndex: 2, explanation: "Earth takes about 365 days to orbit the Sun." },
    { question: "Which sense organ detects sound?", options: ["Eyes", "Nose", "Ears", "Tongue"], correctIndex: 2, explanation: "Ears detect sound waves." },
    { question: "Water is made up of which elements?", options: ["Hydrogen and Oxygen", "Carbon and Oxygen", "Nitrogen and Hydrogen", "Sodium and Chlorine"], correctIndex: 0, explanation: "Water (H₂O) = hydrogen + oxygen." },
  ],
  "Social Studies": [
    { question: "What is the capital city of Ethiopia?", options: ["Dire Dawa", "Hawassa", "Addis Ababa", "Bahir Dar"], correctIndex: 2, explanation: "Addis Ababa is the capital." },
    { question: "Which emperor modernized Ethiopia?", options: ["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"], correctIndex: 0, explanation: "Menelik II modernized Ethiopia." },
    { question: "The Ethiopian calendar is based on:", options: ["Gregorian calendar", "Lunar calendar", "Coptic calendar", "Chinese calendar"], correctIndex: 2, explanation: "Based on the Coptic calendar." },
    { question: "How many regional states are in Ethiopia?", options: ["9", "10", "11", "12"], correctIndex: 2, explanation: "Ethiopia has 11 regional states and 2 chartered cities." },
    { question: "The Battle of Adwa was in which year (EC)?", options: ["1888", "1889", "1890", "1891"], correctIndex: 0, explanation: "1888 EC (1896 GC)." },
    { question: "What is the Ethiopian national currency?", options: ["Dollar", "Shilling", "Birr", "Pound"], correctIndex: 2, explanation: "The Ethiopian Birr is the national currency." },
    { question: "Lucy (Dinknesh) was discovered in which region?", options: ["Tigray", "Afar", "Amhara", "Oromia"], correctIndex: 1, explanation: "Lucy was found in the Afar region in 1974." },
    { question: "Which Ethiopian holiday celebrates finding of the True Cross?", options: ["Timkat", "Meskel", "Enkutatash", "Fasika"], correctIndex: 1, explanation: "Meskel celebrates the finding of the True Cross." },
    { question: "The Ethiopian flag has which colors?", options: ["Red, White, Blue", "Green, Yellow, Red", "Black, Red, Green", "Blue, Yellow, Green"], correctIndex: 1, explanation: "Green, Yellow, and Red are the Ethiopian flag colors." },
    { question: "Enkutatash is the Ethiopian:", options: ["Easter", "Christmas", "New Year", "Harvest festival"], correctIndex: 2, explanation: "Enkutatash is the Ethiopian New Year (Meskerem 1)." },
    { question: "Which body of water borders Ethiopia?", options: ["Red Sea", "Mediterranean", "None — Ethiopia is landlocked", "Indian Ocean"], correctIndex: 2, explanation: "Ethiopia is a landlocked country." },
    { question: "The African Union headquarters is in:", options: ["Nairobi", "Cairo", "Addis Ababa", "Lagos"], correctIndex: 2, explanation: "The AU headquarters is in Addis Ababa." },
    { question: "What is the largest ethnic group in Ethiopia?", options: ["Amhara", "Oromo", "Tigray", "Somali"], correctIndex: 1, explanation: "The Oromo are the largest ethnic group." },
    { question: "Which river is called 'Abay' in Amharic?", options: ["White Nile", "Blue Nile", "Awash", "Omo"], correctIndex: 1, explanation: "The Blue Nile is called 'Abay' in Amharic." },
    { question: "Timkat celebrates:", options: ["Ethiopian New Year", "Epiphany/Baptism of Jesus", "Finding of the Cross", "Easter"], correctIndex: 1, explanation: "Timkat celebrates the Epiphany — the baptism of Jesus." },
    { question: "Coffee originated from which part of Ethiopia?", options: ["Harar", "Kaffa", "Gondar", "Axum"], correctIndex: 1, explanation: "Coffee is believed to have originated from the Kaffa region." },
    { question: "The Solomonic Dynasty claimed descent from:", options: ["Moses", "Muhammad", "King Solomon", "Alexander"], correctIndex: 2, explanation: "The dynasty claimed descent from King Solomon and Queen of Sheba." },
    { question: "Harar is known as:", options: ["City of Saints", "City of Churches", "City of Mosques", "City of Kings"], correctIndex: 2, explanation: "Harar is called the City of Mosques with 82+ mosques." },
    { question: "Which is the highest mountain in Ethiopia?", options: ["Mt. Batu", "Mt. Tullu Demtu", "Ras Dashen", "Mt. Abuna Yosef"], correctIndex: 2, explanation: "Ras Dashen is the highest peak in Ethiopia at 4,550m." },
    { question: "The Derg regime ruled Ethiopia from:", options: ["1954-1974", "1974-1991", "1991-2000", "1960-1980"], correctIndex: 1, explanation: "The Derg military regime ruled from 1974 to 1991." },
  ],
  Biology: [
    { question: "What is the basic unit of life?", options: ["Atom", "Molecule", "Cell", "Organ"], correctIndex: 2, explanation: "The cell is the basic unit of life." },
    { question: "Which organelle does photosynthesis?", options: ["Mitochondria", "Chloroplast", "Ribosome", "Nucleus"], correctIndex: 1, explanation: "Chloroplasts perform photosynthesis." },
    { question: "Homeostasis is:", options: ["Metabolism", "Maintaining stable internal environment", "Evolution", "Reproduction"], correctIndex: 1, explanation: "Homeostasis maintains internal stability." },
    { question: "DNA stands for:", options: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribonitric Acid"], correctIndex: 1, explanation: "Deoxyribonucleic Acid." },
    { question: "Universal donor blood type?", options: ["A+", "B+", "AB+", "O-"], correctIndex: 3, explanation: "O- can be given to any blood type." },
    { question: "The powerhouse of the cell is:", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctIndex: 2, explanation: "Mitochondria produce ATP — cellular energy." },
    { question: "Which gas is released during respiration?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2, explanation: "CO₂ is released during cellular respiration." },
    { question: "Genes are located on:", options: ["Cell membrane", "Cytoplasm", "Chromosomes", "Ribosomes"], correctIndex: 2, explanation: "Genes are segments of DNA on chromosomes." },
    { question: "Which kingdom includes mushrooms?", options: ["Plantae", "Animalia", "Fungi", "Protista"], correctIndex: 2, explanation: "Mushrooms belong to Kingdom Fungi." },
    { question: "What is the function of red blood cells?", options: ["Fight infection", "Carry oxygen", "Clot blood", "Produce hormones"], correctIndex: 1, explanation: "Red blood cells carry oxygen using hemoglobin." },
    { question: "Photosynthesis occurs mainly in:", options: ["Roots", "Stem", "Leaves", "Flowers"], correctIndex: 2, explanation: "Leaves have chloroplasts where photosynthesis occurs." },
    { question: "Which organ filters blood?", options: ["Heart", "Lungs", "Kidneys", "Stomach"], correctIndex: 2, explanation: "Kidneys filter blood and produce urine." },
    { question: "An organism with both male and female parts is:", options: ["Asexual", "Hermaphrodite", "Parasite", "Predator"], correctIndex: 1, explanation: "Hermaphrodites have both reproductive organs." },
    { question: "What is an ecosystem?", options: ["A single organism", "A group of same species", "Living and non-living things interacting", "Only plants in an area"], correctIndex: 2, explanation: "An ecosystem includes all living and non-living components interacting." },
    { question: "Which vitamin prevents scurvy?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctIndex: 2, explanation: "Vitamin C deficiency causes scurvy." },
    { question: "Bacteria are:", options: ["Eukaryotic", "Prokaryotic", "Multicellular", "Plants"], correctIndex: 1, explanation: "Bacteria are prokaryotic — they lack a nucleus." },
    { question: "The smallest bone in the human body is in the:", options: ["Hand", "Foot", "Ear", "Spine"], correctIndex: 2, explanation: "The stapes (stirrup) in the middle ear is the smallest bone." },
    { question: "What is osmosis?", options: ["Movement of solute", "Movement of water across a membrane", "Cell division", "Energy production"], correctIndex: 1, explanation: "Osmosis is water movement through a semipermeable membrane." },
    { question: "Dominant traits are expressed when:", options: ["Both alleles are recessive", "At least one dominant allele is present", "No alleles are present", "Only in males"], correctIndex: 1, explanation: "A dominant trait needs at least one dominant allele." },
    { question: "The process of cell division is called:", options: ["Osmosis", "Mitosis", "Photosynthesis", "Diffusion"], correctIndex: 1, explanation: "Mitosis is the process of cell division." },
  ],
  Chemistry: [
    { question: "Chemical symbol for water?", options: ["HO", "H₂O", "OH₂", "H₃O"], correctIndex: 1, explanation: "Water = H₂O." },
    { question: "How many elements in the periodic table?", options: ["92", "100", "118", "150"], correctIndex: 2, explanation: "118 confirmed elements." },
    { question: "pH of a neutral solution?", options: ["0", "7", "10", "14"], correctIndex: 1, explanation: "Neutral pH = 7." },
    { question: "Most abundant gas in atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correctIndex: 2, explanation: "Nitrogen ≈ 78%." },
    { question: "Covalent bonds involve:", options: ["Transferring electrons", "Sharing electrons", "Losing electrons", "Gaining protons"], correctIndex: 1, explanation: "Covalent bonds share electron pairs." },
    { question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correctIndex: 1, explanation: "Carbon has 6 protons, so atomic number = 6." },
    { question: "An acid has a pH of:", options: ["Above 7", "Exactly 7", "Below 7", "Exactly 14"], correctIndex: 2, explanation: "Acids have pH below 7." },
    { question: "Chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correctIndex: 2, explanation: "Au comes from Latin 'aurum'." },
    { question: "NaCl is commonly known as:", options: ["Baking soda", "Table salt", "Sugar", "Vinegar"], correctIndex: 1, explanation: "NaCl = sodium chloride = table salt." },
    { question: "How many electrons in the outer shell of noble gases (except He)?", options: ["2", "4", "6", "8"], correctIndex: 3, explanation: "Noble gases have 8 valence electrons (octet)." },
    { question: "Rusting is an example of:", options: ["Physical change", "Chemical change", "Nuclear change", "No change"], correctIndex: 1, explanation: "Rusting involves iron reacting with oxygen — a chemical change." },
    { question: "The smallest particle of an element is:", options: ["Molecule", "Atom", "Cell", "Ion"], correctIndex: 1, explanation: "An atom is the smallest particle of an element." },
    { question: "Which is a noble gas?", options: ["Oxygen", "Nitrogen", "Neon", "Chlorine"], correctIndex: 2, explanation: "Neon is a noble gas (Group 18)." },
    { question: "Photosynthesis produces:", options: ["CO₂ and water", "Glucose and O₂", "Protein and fat", "Salt and water"], correctIndex: 1, explanation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
    { question: "An isotope differs in the number of:", options: ["Protons", "Neutrons", "Electrons", "Bonds"], correctIndex: 1, explanation: "Isotopes have the same protons but different neutrons." },
    { question: "What is the formula for carbon dioxide?", options: ["CO", "CO₂", "C₂O", "CO₃"], correctIndex: 1, explanation: "Carbon dioxide = CO₂." },
    { question: "Mixing an acid and a base produces:", options: ["An acid", "A base", "Salt and water", "A gas"], correctIndex: 2, explanation: "Acid + Base → Salt + Water (neutralization)." },
    { question: "Which element is liquid at room temperature?", options: ["Iron", "Mercury", "Lead", "Copper"], correctIndex: 1, explanation: "Mercury (Hg) is a liquid metal at room temperature." },
    { question: "Protons have what charge?", options: ["Negative", "Positive", "Neutral", "Variable"], correctIndex: 1, explanation: "Protons carry a positive charge." },
    { question: "The process of a solid turning to gas is:", options: ["Evaporation", "Condensation", "Sublimation", "Melting"], correctIndex: 2, explanation: "Sublimation = solid directly to gas." },
  ],
  Physics: [
    { question: "SI unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], correctIndex: 2, explanation: "Newton (N) = kg⋅m/s²." },
    { question: "Speed of light approximately?", options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], correctIndex: 1, explanation: "≈ 3 × 10⁸ m/s." },
    { question: "Newton's first law is the law of:", options: ["Acceleration", "Inertia", "Gravity", "Momentum"], correctIndex: 1, explanation: "Law of inertia." },
    { question: "Energy in a stretched rubber band?", options: ["Kinetic", "Thermal", "Elastic potential", "Chemical"], correctIndex: 2, explanation: "Elastic potential energy." },
    { question: "Unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], correctIndex: 2, explanation: "Ohm (Ω)." },
    { question: "What is the SI unit of energy?", options: ["Newton", "Joule", "Watt", "Pascal"], correctIndex: 1, explanation: "The Joule (J) is the SI unit of energy." },
    { question: "Which type of lens converges light?", options: ["Concave", "Convex", "Flat", "Cylindrical"], correctIndex: 1, explanation: "Convex lenses converge light rays to a focal point." },
    { question: "What does a speedometer measure?", options: ["Acceleration", "Distance", "Speed", "Force"], correctIndex: 2, explanation: "A speedometer measures instantaneous speed." },
    { question: "Current is measured in:", options: ["Volts", "Ohms", "Amperes", "Watts"], correctIndex: 2, explanation: "Electric current is measured in Amperes (A)." },
    { question: "Which is a renewable energy source?", options: ["Coal", "Natural gas", "Solar", "Petroleum"], correctIndex: 2, explanation: "Solar energy is renewable — the Sun continuously provides it." },
    { question: "What is acceleration?", options: ["Speed × time", "Change in velocity over time", "Distance over time", "Force × mass"], correctIndex: 1, explanation: "Acceleration = Δv / Δt." },
    { question: "Frequency is measured in:", options: ["Meters", "Seconds", "Hertz", "Newtons"], correctIndex: 2, explanation: "Hertz (Hz) = cycles per second." },
    { question: "A lever is an example of a:", options: ["Complex machine", "Simple machine", "Engine", "Motor"], correctIndex: 1, explanation: "A lever is one of the six simple machines." },
    { question: "What color light has the longest wavelength?", options: ["Blue", "Green", "Yellow", "Red"], correctIndex: 3, explanation: "Red light has the longest wavelength in visible spectrum." },
    { question: "Mass is measured in:", options: ["Newtons", "Kilograms", "Meters", "Liters"], correctIndex: 1, explanation: "Mass is measured in kilograms (kg)." },
    { question: "What is the formula for speed?", options: ["Force × Time", "Distance / Time", "Mass × Acceleration", "Energy / Power"], correctIndex: 1, explanation: "Speed = Distance / Time." },
    { question: "Sound cannot travel through:", options: ["Air", "Water", "Steel", "Vacuum"], correctIndex: 3, explanation: "Sound needs a medium; it cannot travel through a vacuum." },
    { question: "Potential energy depends on:", options: ["Speed", "Height and mass", "Color", "Temperature"], correctIndex: 1, explanation: "Gravitational PE = mgh (mass × gravity × height)." },
    { question: "What type of energy does a moving car have?", options: ["Potential", "Kinetic", "Chemical", "Nuclear"], correctIndex: 1, explanation: "A moving object has kinetic energy." },
    { question: "An echo is caused by:", options: ["Refraction", "Diffraction", "Reflection of sound", "Absorption"], correctIndex: 2, explanation: "An echo is the reflection of sound waves off a surface." },
  ],
  Geography: [
    { question: "Longest river in Ethiopia?", options: ["Awash", "Blue Nile (Abay)", "Omo", "Wabe Shebelle"], correctIndex: 1, explanation: "Blue Nile (Abay) starts from Lake Tana." },
    { question: "Lowest point in Africa is in which Ethiopian region?", options: ["Tigray", "Afar", "Somali", "Oromia"], correctIndex: 1, explanation: "Danakil Depression in Afar." },
    { question: "What is the Great Rift Valley?", options: ["Mountain range", "Tectonic depression", "Ocean trench", "River valley"], correctIndex: 1, explanation: "Tectonic depression from separating plates." },
    { question: "Ethiopian highlands climate?", options: ["Tropical", "Temperate", "Arid", "Arctic"], correctIndex: 1, explanation: "Temperate due to high elevation." },
    { question: "Lake Tana is the source of which river?", options: ["White Nile", "Blue Nile", "Awash", "Omo"], correctIndex: 1, explanation: "Lake Tana is the source of the Blue Nile." },
    { question: "What is the largest lake in Ethiopia?", options: ["Lake Hawassa", "Lake Tana", "Lake Abaya", "Lake Chamo"], correctIndex: 1, explanation: "Lake Tana is the largest lake in Ethiopia." },
    { question: "The Simien Mountains are in which region?", options: ["Oromia", "Amhara", "Tigray", "SNNPR"], correctIndex: 1, explanation: "The Simien Mountains are in the Amhara region." },
    { question: "What is the main cash crop of Ethiopia?", options: ["Wheat", "Coffee", "Teff", "Barley"], correctIndex: 1, explanation: "Coffee is Ethiopia's primary export crop." },
    { question: "Which zone gets the most rainfall in Ethiopia?", options: ["Kolla", "Woina Dega", "Dega", "Bereha"], correctIndex: 1, explanation: "Woina Dega (temperate) zone receives the most rainfall." },
    { question: "Ethiopia shares a border with how many countries?", options: ["4", "5", "6", "7"], correctIndex: 1, explanation: "Ethiopia borders: Eritrea, Djibouti, Somalia, Kenya, South Sudan, Sudan." },
    { question: "The Awash River ends in:", options: ["The sea", "Lake Abbe", "Lake Tana", "The Nile"], correctIndex: 1, explanation: "The Awash River ends in Lake Abbe in the Afar region." },
    { question: "Which city is the hottest in Ethiopia?", options: ["Addis Ababa", "Gondar", "Dallol", "Jimma"], correctIndex: 2, explanation: "Dallol in Afar is one of the hottest places on Earth." },
    { question: "Teff is primarily grown in which climate zone?", options: ["Kolla", "Woina Dega", "Dega", "Wurch"], correctIndex: 1, explanation: "Teff grows best in the Woina Dega zone." },
    { question: "The Bale Mountains are known for:", options: ["Deserts", "Ethiopian Wolf habitat", "Coffee plantations", "Gold mines"], correctIndex: 1, explanation: "Bale Mountains host the endangered Ethiopian Wolf." },
    { question: "What percentage of Ethiopia's population lives in rural areas (approx)?", options: ["40%", "60%", "80%", "95%"], correctIndex: 2, explanation: "About 80% of Ethiopians live in rural areas." },
    { question: "Which ocean is closest to Ethiopia?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correctIndex: 2, explanation: "The Indian Ocean is closest, via Djibouti and Somalia." },
    { question: "The main staple grain unique to Ethiopia is:", options: ["Rice", "Wheat", "Teff", "Corn"], correctIndex: 2, explanation: "Teff is a grain unique to Ethiopia, used for injera." },
    { question: "Addis Ababa's elevation is approximately:", options: ["1,000m", "1,500m", "2,400m", "3,500m"], correctIndex: 2, explanation: "Addis Ababa sits at about 2,400 meters above sea level." },
    { question: "The Omo Valley is famous for:", options: ["Industry", "Diverse ethnic groups", "Modern cities", "Mining"], correctIndex: 1, explanation: "The Omo Valley is home to many diverse indigenous ethnic groups." },
    { question: "Which Ethiopian lake is in the Rift Valley?", options: ["Lake Tana", "Lake Ziway", "Both", "Neither"], correctIndex: 1, explanation: "Lake Ziway is in the Rift Valley; Lake Tana is in the highlands." },
  ],
  History: [
    { question: "When was the Battle of Adwa (GC)?", options: ["1886", "1896", "1906", "1916"], correctIndex: 1, explanation: "March 1, 1896." },
    { question: "Last emperor of Ethiopia?", options: ["Menelik II", "Haile Selassie", "Tewodros II", "Lij Iyasu"], correctIndex: 1, explanation: "Haile Selassie ruled 1930-1974." },
    { question: "Aksumite Empire was in:", options: ["Kenya", "Sudan", "Northern Ethiopia and Eritrea", "Somalia"], correctIndex: 2, explanation: "Northern Ethiopia and Eritrea." },
    { question: "Aksum is famous for:", options: ["Lalibela Churches", "Stelae (obelisks)", "Castles", "Walls"], correctIndex: 1, explanation: "Aksum's stelae are over 1,700 years old." },
    { question: "Zagwe Dynasty built:", options: ["Stelae of Aksum", "Rock-Hewn Churches of Lalibela", "Castles of Gondar", "Walls of Harar"], correctIndex: 1, explanation: "King Lalibela built the rock-hewn churches." },
    { question: "Who united Ethiopia in the 19th century?", options: ["Menelik II", "Haile Selassie", "Tewodros II", "Yohannes IV"], correctIndex: 2, explanation: "Emperor Tewodros II is credited with beginning Ethiopia's unification." },
    { question: "The Gondar castles were built during:", options: ["Aksumite era", "Zagwe era", "Gondarine era", "Modern era"], correctIndex: 2, explanation: "The Gondar castles were built during the Gondarine period (17th-18th century)." },
    { question: "Ethiopia was occupied by Italy during:", options: ["1896-1900", "1936-1941", "1941-1950", "1914-1918"], correctIndex: 1, explanation: "Italy occupied Ethiopia from 1936-1941." },
    { question: "The Queen of Sheba is linked to which Ethiopian city?", options: ["Gondar", "Lalibela", "Aksum", "Harar"], correctIndex: 2, explanation: "The Queen of Sheba is traditionally linked to Aksum." },
    { question: "Ethiopia adopted Christianity in which century?", options: ["1st", "4th", "7th", "10th"], correctIndex: 1, explanation: "Ethiopia adopted Christianity in the 4th century under King Ezana." },
    { question: "The EPRDF took power in:", options: ["1974", "1983", "1991", "2000"], correctIndex: 2, explanation: "The EPRDF took power in 1991 after overthrowing the Derg." },
    { question: "The Ark of the Covenant is believed to be in:", options: ["Lalibela", "Aksum", "Gondar", "Addis Ababa"], correctIndex: 1, explanation: "Tradition holds the Ark is in the Church of Our Lady Mary of Zion in Aksum." },
    { question: "Emperor Haile Selassie founded:", options: ["AU (then OAU)", "United Nations", "Red Cross", "FIFA"], correctIndex: 0, explanation: "Haile Selassie helped found the OAU (now AU) in 1963." },
    { question: "The ancient port city of Adulis was part of:", options: ["Zagwe Kingdom", "Aksumite Empire", "Sultanate of Adal", "Gondarine Kingdom"], correctIndex: 1, explanation: "Adulis was a major port of the Aksumite Empire." },
    { question: "Tewodros II died at:", options: ["Adwa", "Magdala", "Gondar", "Aksum"], correctIndex: 1, explanation: "Tewodros II died at Magdala in 1868 rather than surrender to the British." },
    { question: "The Kebra Nagast is:", options: ["A law book", "An epic about the glory of kings", "A geography text", "A math book"], correctIndex: 1, explanation: "The Kebra Nagast ('Glory of Kings') traces the Solomonic Dynasty." },
    { question: "Lucy (Dinknesh) is approximately how old?", options: ["1 million years", "3.2 million years", "5 million years", "10 million years"], correctIndex: 1, explanation: "Lucy is approximately 3.2 million years old." },
    { question: "The Ethiopian Revolution occurred in:", options: ["1960", "1974", "1991", "2005"], correctIndex: 1, explanation: "The 1974 revolution overthrew Haile Selassie and brought the Derg to power." },
    { question: "Which empire controlled trade routes between Rome and India?", options: ["Zagwe", "Aksumite", "Ottoman", "Persian"], correctIndex: 1, explanation: "The Aksumite Empire controlled trade between Rome and India." },
    { question: "The first Ethiopian newspaper was published in:", options: ["1890s", "1900s", "1920s", "1950s"], correctIndex: 1, explanation: "Aïmero, the first Ethiopian newspaper, was published in the early 1900s." },
  ],
};

// Seeded shuffle: picks 10 unique questions per subject+year combination
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionsForExam(subject: string, year: number, grade: number): typeof QUESTION_POOL[string] {
  const pool = QUESTION_POOL[subject] || [];
  const seed = year * 1000 + grade * 100 + subject.length * 7;
  const shuffled = seededShuffle(pool, seed);
  return shuffled.slice(0, 10);
}

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
