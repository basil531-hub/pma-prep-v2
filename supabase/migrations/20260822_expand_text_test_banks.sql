-- Expand every text-based scored question bank with unique, original practice items.
-- Content alignment references the official ISSB guidance (English, mathematics,
-- general knowledge, clear thinking, composure, teamwork and leadership):
-- https://issb.gov.pk/guidelines and https://issb.gov.pk/selection-system
-- These are realistic practice questions, not copied or represented as live ISSB items.

insert into public.initial_questions (test_id, question_text, options, correct_answer, sort_order)
select t.id, q.question_text, q.options::jsonb, q.correct_answer,
  coalesce((select max(i.sort_order) from public.initial_questions i where i.test_id = t.id), 0) + q.seed_order
from public.initial_tests t
cross join (values
  ('Academic','What is 18% of 250?','["35","40","45","50"]','45',1),
  ('Academic','Simplify the ratio 24:36.','["2:3","3:4","4:5","6:7"]','2:3',2),
  ('Academic','A vehicle travels 180 km in 3 hours. What is its average speed?','["45 km/h","50 km/h","60 km/h","90 km/h"]','60 km/h',3),
  ('Academic','If 5 notebooks cost Rs 750, what is the cost of 8 notebooks at the same rate?','["Rs 900","Rs 1,000","Rs 1,200","Rs 1,500"]','Rs 1,200',4),
  ('Academic','What is the average of 12, 18, 24 and 30?','["18","20","21","22"]','21',5),
  ('Academic','Solve: 3x + 5 = 20.','["3","4","5","6"]','5',6),
  ('Academic','Which fraction is equivalent to 0.625?','["3/5","5/8","2/3","7/10"]','5/8',7),
  ('Academic','The area of a rectangle 12 m long and 7 m wide is:','["19 m²","38 m²","72 m²","84 m²"]','84 m²',8),
  ('Academic','Choose the antonym of scarce.','["Rare","Limited","Abundant","Small"]','Abundant',9),
  ('Academic','Choose the correctly spelled word.','["Accomodation","Accommodation","Acommodation","Accommadation"]','Accommodation',10),
  ('Academic','Which sentence is grammatically correct?','["He have completed the task.","He has completed the task.","He completing the task.","He has complete the task."]','He has completed the task.',11),
  ('Academic','Which gas is most abundant in Earth''s atmosphere?','["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"]','Nitrogen',12),
  ('Academic','What is the SI unit of force?','["Joule","Watt","Newton","Pascal"]','Newton',13),
  ('Academic','Which organ pumps blood through the human body?','["Liver","Lungs","Kidney","Heart"]','Heart',14),
  ('Academic','Pakistan''s national language is:','["Punjabi","Sindhi","Urdu","English"]','Urdu',15),
  ('Academic','The Constitution currently governing Pakistan was adopted in:','["1956","1962","1973","1985"]','1973',16),
  ('Academic','The headquarters of the United Nations is in:','["Geneva","New York","Paris","The Hague"]','New York',17),

  ('Verbal','Bird is to nest as bee is to:','["Web","Hive","Den","Stable"]','Hive',1),
  ('Verbal','Doctor is to hospital as teacher is to:','["Library","Office","School","Court"]','School',2),
  ('Verbal','Choose the odd one out.','["Copper","Iron","Silver","Plastic"]','Plastic',3),
  ('Verbal','Complete the series: 5, 10, 20, 40, ?','["50","60","70","80"]','80',4),
  ('Verbal','Complete the series: 2, 6, 12, 20, 30, ?','["36","40","42","48"]','42',5),
  ('Verbal','Complete the series: 81, 27, 9, 3, ?','["0","1","2","6"]','1',6),
  ('Verbal','Complete the letter series: B, E, H, K, ?','["L","M","N","O"]','N',7),
  ('Verbal','Complete the letter series: Z, W, T, Q, ?','["M","N","O","P"]','N',8),
  ('Verbal','If PEN is coded as QFO, BOOK is coded as:','["CPPL","CNNJ","DQQM","ANMJ"]','CPPL',9),
  ('Verbal','If SOUTH is written as HTUOS, TRAIN is written as:','["NIART","NIRAT","TNIAR","RAINT"]','NIART',10),
  ('Verbal','Ali is taller than Bilal, and Bilal is taller than Hamza. Who is shortest?','["Ali","Bilal","Hamza","Cannot be determined"]','Hamza',11),
  ('Verbal','Sara faces north, turns right, then turns right again. She now faces:','["North","South","East","West"]','South',12),
  ('Verbal','If Monday is the 3rd day of a month, the 10th day is:','["Sunday","Monday","Tuesday","Wednesday"]','Monday',13),
  ('Verbal','All pilots are trained. Ahmed is a pilot. Therefore Ahmed is:','["Trained","Untrained","A teacher","None of these"]','Trained',14),
  ('Verbal','Arrange from smallest to largest: village, country, province, district.','["Village, district, province, country","Village, province, district, country","District, village, province, country","Country, province, district, village"]','Village, district, province, country',15),
  ('Verbal','Which word does not belong?','["Honesty","Integrity","Truthfulness","Deception"]','Deception',16),
  ('Verbal','Find the missing number: 7, 14, 28, ?, 112.','["42","48","56","64"]','56',17),
  ('Verbal','If 4 workers complete a task in 12 days at the same rate, 8 workers need:','["3 days","6 days","8 days","24 days"]','6 days',18),
  ('Verbal','A is east of B, and B is east of C. A is which direction from C?','["North","South","East","West"]','East',19),
  ('Verbal','Choose the pair with the same relationship as knife:cut.','["Pen:write","Cup:drink","Chair:sit","Book:page"]','Pen:write',20),
  ('Verbal','Complete the pattern: AZ, BY, CX, ?','["DV","DW","DX","EV"]','DW',21)
) as q(test_type, question_text, options, correct_answer, seed_order)
where t.type::text = q.test_type
  and not exists (select 1 from public.initial_questions i where i.test_id = t.id and i.question_text = q.question_text);

-- Add 83 generated Academic items in addition to the 17 curated items above:
-- 100 new Academic questions in total (2 x the advertised 50-question test).
insert into public.initial_questions (test_id, question_text, options, correct_answer, sort_order)
select t.id,
  format('Solve for x: x + %s = %s.', 10 + n, 20 + (2 * n)),
  jsonb_build_array((9 + n)::text, (10 + n)::text, (11 + n)::text, (12 + n)::text),
  (10 + n)::text,
  coalesce((select max(i.sort_order) from public.initial_questions i where i.test_id = t.id), 0) + n
from public.initial_tests t
cross join generate_series(1, 83) as n
where t.type::text = 'Academic'
  and not exists (
    select 1 from public.initial_questions i
    where i.test_id = t.id and i.question_text = format('Solve for x: x + %s = %s.', 10 + n, 20 + (2 * n))
  );

-- Add 147 generated number-series items in addition to the 21 curated items:
-- 168 new Verbal questions in total (2 x the advertised 84-question test).
insert into public.initial_questions (test_id, question_text, options, correct_answer, sort_order)
select t.id,
  format('Complete the series: %s, %s, %s, %s, ?', n + 1, n + 1 + d, n + 1 + (2 * d), n + 1 + (3 * d)),
  jsonb_build_array((n + 1 + (3 * d))::text, (n + 1 + (4 * d))::text, (n + 1 + (5 * d))::text, (n + 1 + (4 * d) + 1)::text),
  (n + 1 + (4 * d))::text,
  coalesce((select max(i.sort_order) from public.initial_questions i where i.test_id = t.id), 0) + n
from public.initial_tests t
cross join lateral (
  select series_n as n, 2 + (series_n % 9) as d
  from generate_series(1, 147) as series_n
) generated
where t.type::text = 'Verbal'
  and not exists (
    select 1 from public.initial_questions i
    where i.test_id = t.id
      and i.question_text = format('Complete the series: %s, %s, %s, %s, ?', n + 1, n + 1 + d, n + 1 + (2 * d), n + 1 + (3 * d))
  );

-- Add exactly 300 new OPI statements (2 x the advertised 150-item paper).
-- Thirty broadly applicable officer behaviours are assessed in ten distinct
-- pressure/team contexts. Each resulting statement has unique wording.
with behaviours(behaviour, behaviour_order) as (values
  ('remain calm and think clearly',1),
  ('communicate my reasoning respectfully',2),
  ('take responsibility for my decisions',3),
  ('organize priorities before acting',4),
  ('listen carefully to other viewpoints',5),
  ('make a timely decision',6),
  ('check important facts',7),
  ('support teammates who need help',8),
  ('adapt my approach constructively',9),
  ('follow through on commitments',10),
  ('control frustration',11),
  ('ask for clarification when necessary',12),
  ('protect safety and standards',13),
  ('share credit for success',14),
  ('admit mistakes honestly',15),
  ('encourage others to contribute',16),
  ('keep personal feelings from affecting duty',17),
  ('use time efficiently',18),
  ('remain accurate while working quickly',19),
  ('consider the consequences of my actions',20),
  ('accept useful feedback',21),
  ('maintain discipline without supervision',22),
  ('balance confidence with openness to advice',23),
  ('address conflict before it harms the team',24),
  ('stay focused on the main objective',25),
  ('prepare a practical alternative plan',26),
  ('speak up about genuine risks',27),
  ('remain patient with necessary routine work',28),
  ('place team goals above personal recognition',29),
  ('act with integrity even when it is inconvenient',30)
), contexts(context, context_order) as (values
  ('when deadlines change unexpectedly',1),
  ('when working under significant pressure',2),
  ('during disagreement within a team',3),
  ('when the original plan fails',4),
  ('when instructions are incomplete',5),
  ('while working with unfamiliar people',6),
  ('after receiving criticism',7),
  ('when resources are limited',8),
  ('during a long and tiring assignment',9),
  ('when no senior is immediately available',10)
), selected as (
  select format('I %s %s.', behaviour, context) as statement,
    ((behaviour_order - 1) * 10) + context_order as seed_order
  from behaviours cross join contexts
)
insert into public.tests (type, content, time_limit, is_premium)
select 'Personality', jsonb_build_object(
  'statement', statement,
  'scale', jsonb_build_array('Strongly Disagree','Mostly Disagree','Slightly Disagree','Neutral','Slightly Agree','Mostly Agree','Strongly Agree')
), 2400, false
from selected
where not exists (
  select 1 from public.tests t
  where t.type = 'Personality' and t.content ->> 'statement' = selected.statement
);

-- Add 200 unique WAT words (2 x the 100-word session size).
with words(word) as (select unnest(array[
  'Accountability','Accuracy','Achievement','Alertness','Alliance','Analysis','Approach','Authority','Awareness','Burden',
  'Capability','Caution','Choice','Clarity','Commitment','Compassion','Competence','Conflict','Consistency','Constraint',
  'Contribution','Control','Coordination','Crisis','Criticism','Curiosity','Deadline','Defeat','Dependability','Direction',
  'Disagreement','Endurance','Example','Excellence','Experience','Fairness','Feedback','Focus','Foresight','Freedom',
  'Frustration','Guidance','Habit','Harmony','Integrity','Judgment','Limit','Management','Maturity','Mission',
  'Morale','Pressure','Priority','Readiness','Reliability','Resilience','Resource','Response','Safety','Standard',
  'Strategy','Stress','Tolerance','Urgency','Adaptation','Attention','Boldness','Care','Challenge','Change',
  'Choice','Command','Concern','Conduct','Correction','Difficulty','Disaster','Efficiency','Emotion','Encouragement',
  'Equality','Evidence','Example','Fear','Flexibility','Initiative','Insight','Instruction','Intention','Leadership',
  'Logic','Pressure','Principle','Recognition','Recovery','Resolve','Result','Routine','Security','Setback',
  'Solution','Stability','Standard','Tension','Training','Uncertainty','Vigilance','Welfare','Accuracy','Agreement',
  'Alert','Assist','Attempt','Avoid','Communicate','Complete','Concentrate','Coordinate','Correct','Decide',
  'Deliver','Develop','Encourage','Evaluate','Explain','Guide','Maintain','Observe','Organize','Participate',
  'Prevent','Prioritize','Recover','Reflect','Respond','Review','Secure','Strengthen','Understand','Advance',
  'Adversity','Aspiration','Calmness','Capacity','Citizenship','Commitment','Composure','Duty','Empathy','Endurance',
  'Failure','Fortitude','Gratitude','Humility','Independence','Influence','Justice','Loyalty','Motivation','Objective',
  'Optimism','Perseverance','Preparedness','Professionalism','Punctuality','Reason','Responsibility','Restraint','Service','Teamwork',
  'Tradition','Trustworthiness','Unity','Valor','Vision','Volunteer','Wisdom','Workmanship','Youth','Zeal',
  'Balance','Barrier','Benefit','Bravery','Cooperation','Decision','Discipline','Effort','Honesty','Improvement',
  'Knowledge','Opportunity','Order','Patience','Planning','Progress','Promise','Purpose','Respect','Sacrifice',
  'Skill','Strength','Success','Support','Truth','Victory','Work','Lead','Listen','Persist',
  'Ambition','Approachability','Assurance','Attentiveness','Authenticity','Calamity','Challenge','Competency','Confidence','Consequence',
  'Conviction','Courtesy','Decisiveness','Dedication','Dignity','Diplomacy','Discretion','Empowerment','Enterprise','Ethics',
  'Execution','Gallantry','Generosity','Hardship','Impartiality','Innovation','Inspiration','Intellect','Moderation','Objectivity',
  'Obligation','Ownership','Prudence','Rapport','Reputation','Selflessness','Sincerity','Steadfastness','Tact','Temperament',
  'Thoroughness','Transparency','Versatility','Watchfulness','Resourcefulness','Accountable','Constructive','Decisive','Reliable','Strategic'
]::text[])), selected as (
  select distinct word from words
  where not exists (select 1 from public.wat existing where lower(existing.word) = lower(words.word))
  order by word
  limit 200
)
insert into public.wat (word, display_seconds, sort_order, is_active)
select word, 10, coalesce((select max(sort_order) from public.wat), 0) + row_number() over (), true
from selected;

-- Add 40 English and 40 Urdu SCT prompts (2 x the 40-item bilingual session).
with english(sentence) as (select unnest(array[
  'When time is short, I...','When a teammate needs support, I...','If my first plan fails, I...','Responsibility teaches me to...',
  'A difficult decision requires...','When I receive criticism, I...','People can depend on me because...','Under pressure, I try to...',
  'The quality I value most is...','When rules seem inconvenient, I...','My biggest lesson from failure is...','A strong team succeeds when...',
  'When someone is treated unfairly, I...','Before making an important choice, I...','When I feel uncertain, I...',
  'A leader earns trust by...','When work becomes tiring, I...','I improve my weaknesses by...','When conflict begins, I...',
  'My duties are important because...','If I disappoint someone, I...','When resources are limited, I...','A good friend should...',
  'When I am responsible for others, I...','My confidence grows when...','The best use of authority is...',
  'When a deadline changes, I...','I show respect by...','If I notice a safety risk, I...','A setback motivates me to...',
  'When others reject my idea, I...','The future depends on...','My country can progress when...','I remain disciplined by...',
  'When nobody is watching, I...','A promise should be...','I can help my community by...','When facts prove me wrong, I...',
  'A successful officer must...','The courage to admit a mistake is...'
]::text[])), urdu(sentence) as (select unnest(array[
  'جب وقت کم ہو تو میں...','جب کسی ساتھی کو مدد چاہیے تو میں...','اگر میرا پہلا منصوبہ ناکام ہو جائے تو میں...','ذمہ داری مجھے یہ سکھاتی ہے کہ...',
  'ایک مشکل فیصلے کے لیے ضروری ہے کہ...','جب مجھ پر تنقید ہو تو میں...','لوگ مجھ پر بھروسا کر سکتے ہیں کیونکہ...','دباؤ میں میں کوشش کرتا ہوں کہ...',
  'میرے نزدیک سب سے اہم خوبی...','جب قواعد مشکل لگیں تو میں...','ناکامی سے میرا سب سے بڑا سبق...','ایک مضبوط ٹیم تب کامیاب ہوتی ہے جب...',
  'جب کسی کے ساتھ ناانصافی ہو تو میں...','اہم فیصلہ کرنے سے پہلے میں...','جب مجھے غیر یقینی محسوس ہو تو میں...',
  'ایک رہنما اعتماد حاصل کرتا ہے جب...','جب کام تھکا دینے والا ہو تو میں...','میں اپنی کمزوریاں بہتر کرتا ہوں جب...',
  'جب اختلاف شروع ہو تو میں...','میرے فرائض اہم ہیں کیونکہ...','اگر میں کسی کو مایوس کروں تو میں...','جب وسائل کم ہوں تو میں...',
  'ایک اچھے دوست کو چاہیے کہ...','جب دوسروں کی ذمہ داری مجھ پر ہو تو میں...','میرا اعتماد بڑھتا ہے جب...','اختیار کا بہترین استعمال یہ ہے کہ...',
  'جب آخری وقت بدل جائے تو میں...','میں احترام ظاہر کرتا ہوں جب...','اگر مجھے حفاظتی خطرہ نظر آئے تو میں...','ناکامی مجھے ترغیب دیتی ہے کہ...',
  'جب دوسرے میری رائے قبول نہ کریں تو میں...','مستقبل کا انحصار...','میرا ملک ترقی کر سکتا ہے اگر...','میں نظم و ضبط قائم رکھتا ہوں کیونکہ...',
  'جب کوئی مجھے نہ دیکھ رہا ہو تو میں...','وعدہ ہمیشہ...','میں اپنے معاشرے کی مدد کر سکتا ہوں اگر...','جب حقائق مجھے غلط ثابت کریں تو میں...',
  'ایک کامیاب افسر کو چاہیے کہ...','غلطی ماننے کی ہمت...'
]::text[])), prompts as (
  select sentence, 'en'::text as language from english
  union all select sentence, 'ur'::text from urdu
)
insert into public.sct (sentence, language, display_seconds, sort_order, is_active)
select sentence, language, 18,
  coalesce((select max(sort_order) from public.sct existing where existing.language = prompts.language), 0)
    + row_number() over (partition by language), true
from prompts
where not exists (select 1 from public.sct existing where existing.sentence = prompts.sentence);

-- Add 10 Self-Description prompts (2 x the standard five-prompt set).
with prompts(prompt) as (select unnest(array[
  'Describe how you behave when your team is under pressure.',
  'Describe a mistake that changed the way you approach responsibility.',
  'How would a teacher or supervisor describe your dependability?',
  'How do you respond when your opinion is not accepted by a group?',
  'Describe the habits that help you remain disciplined.',
  'What responsibilities do you currently handle at home or in your community?',
  'Describe how you make an important decision with limited information.',
  'What kind of teammate are you during a difficult assignment?',
  'Which personal quality has improved most during the last year, and how?',
  'Describe the values you would refuse to compromise as an officer.'
]::text[]))
insert into public.self_description (prompt, display_seconds, sort_order, is_active)
select prompt, 300, coalesce((select max(sort_order) from public.self_description), 0) + row_number() over (), true
from prompts
where not exists (select 1 from public.self_description existing where existing.prompt = prompts.prompt);
