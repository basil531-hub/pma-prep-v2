export const starterWatWords = [
  "Ability", "Action", "Adventure", "Ambition", "Army", "Balance", "Bravery", "Calm", "Challenge", "Character",
  "Courage", "Command", "Confidence", "Cooperation", "Country", "Decision", "Determination", "Discipline", "Duty", "Effort",
  "Energy", "Failure", "Family", "Friend", "Future", "Goal", "Growth", "Hardship", "Health", "Help",
  "Honesty", "Hope", "Honor", "Idea", "Initiative", "Journey", "Justice", "Kindness", "Knowledge", "Leader",
  "Learning", "Life", "Loyalty", "Mistake", "Nation", "Nature", "Obstacle", "Opportunity", "Order", "Patience",
  "Peace", "Plan", "Practice", "Pride", "Problem", "Progress", "Promise", "Purpose", "Quality", "Respect",
  "Responsibility", "Risk", "Sacrifice", "School", "Service", "Skill", "Soldier", "Strength", "Success", "Support",
  "Team", "Time", "Truth", "Trust", "Unity", "Value", "Victory", "Vision", "Weakness", "Wisdom",
  "Work", "Youth", "Adapt", "Build", "Create", "Defend", "Improve", "Lead", "Listen", "Overcome",
  "Prepare", "Protect", "Serve", "Solve", "Train", "Volunteer", "Win", "Achieve", "Believe", "Persist",
];

export const starterSctItems = [
  "I feel proud when I...", "My greatest strength is...", "When I make a mistake, I...", "A good leader should...", "My family expects me to...",
  "I become worried when...", "The future seems...", "My closest friend knows that I...", "At school, I enjoy...", "I find it difficult to...",
  "When someone disagrees with me, I...", "Success means...", "I respect people who...", "One thing I want to improve is...", "In a team, I usually...",
  "My country needs young people who...", "When I face a problem, I...", "I feel confident when...", "The best lesson I have learned is...", "I hope to become...",
].map((text, index) => ({ id: `starter-en-${index}`, text, language: "en" as const }));

export const starterUrduSctItems = [
  "میں اس وقت خوش ہوتا ہوں جب میں...", "میری سب سے بڑی خوبی یہ ہے کہ میں...", "جب مجھ سے غلطی ہو جائے تو میں...", "ایک اچھا رہنما وہ ہوتا ہے جو...", "میرا خاندان مجھ سے توقع کرتا ہے کہ میں...",
  "مجھے فکر ہوتی ہے جب...", "میرا مستقبل مجھے...", "میرا قریبی دوست جانتا ہے کہ میں...", "مجھے اسکول میں یہ کام پسند ہے کہ...", "مجھے یہ کام مشکل لگتا ہے کہ...",
  "جب کوئی مجھ سے اختلاف کرے تو میں...", "میرے نزدیک کامیابی کا مطلب...", "میں ان لوگوں کی عزت کرتا ہوں جو...", "میں اپنی اس عادت کو بہتر بنانا چاہتا ہوں کہ...", "ٹیم میں میں عموماً...",
  "میرے ملک کو ایسے نوجوانوں کی ضرورت ہے جو...", "جب مجھے کوئی مسئلہ پیش آئے تو میں...", "مجھے اس وقت اعتماد محسوس ہوتا ہے جب...", "میں نے زندگی میں سب سے اہم سبق یہ سیکھا کہ...", "میں امید کرتا ہوں کہ میں...",
].map((text, index) => ({ id: `starter-ur-${index}`, text, language: "ur" as const }));

export const starterSelfDescription = [
  "Describe yourself as a student.", "How do your parents see you?", "How do your friends see you?",
  "What are your strengths and areas you want to improve?", "What kind of officer and citizen do you want to become?",
].map((text, index) => ({ id: `starter-self-${index}`, text }));

export const starterTatItems = [
  { id: "starter-tat-1", imageUrl: "/tat/teamwork.svg", text: "Write a complete story based on the picture." },
  { id: "starter-tat-2", imageUrl: "/tat/helping.svg", text: "Write a complete story based on the picture." },
  { id: "starter-tat-3", imageUrl: "/tat/planning.svg", text: "Write a complete story based on the picture." },
];
