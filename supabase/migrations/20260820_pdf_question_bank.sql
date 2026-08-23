-- Initial Course question bank derived from the supplied verbal-tricks study material.
-- Safe to rerun: existing questions are identified by question_text.
insert into public.initial_questions (test_id, question_text, options, correct_answer, sort_order)
select t.id, q.question_text, q.options::jsonb, q.correct_answer,
       coalesce((select max(existing.sort_order) from public.initial_questions existing where existing.test_id = t.id), 0) + q.seed_order
from public.initial_tests t
cross join (values
  ('Academic', 'A pen is bought for Rs 10 and sold for Rs 20. What is the profit percentage on cost price?', '["25%","50%","100%","200%"]', '100%', 1),
  ('Academic', 'A pen is bought for Rs 20 and sold for Rs 10. What is the loss percentage on cost price?', '["25%","40%","50%","100%"]', '50%', 2),
  ('Academic', 'Reena is twice Sunita''s age. Three years ago Reena was three times Sunita''s age. How old is Reena now?', '["6 years","12 years","14 years","16 years"]', '12 years', 3),
  ('Academic', 'A farm has 35 heads and 110 legs among cows and birds. How many cows are there?', '["15","20","25","30"]', '20', 4),
  ('Academic', 'What is the average of 30, 60 and 10?', '["20","30","33.33","40"]', '33.33', 5),
  ('Academic', 'A person earns Rs 20,000 per month. What is the yearly income?', '["Rs 120,000","Rs 200,000","Rs 240,000","Rs 260,000"]', 'Rs 240,000', 6),
  ('Academic', 'A person earns Rs 1,600 per week. Using 52 weeks per year, what is the yearly income?', '["Rs 52,000","Rs 72,000","Rs 83,200","Rs 96,000"]', 'Rs 83,200', 7),
  ('Academic', 'How many poles are needed along 1,500 metres when the distance between poles is 50 metres?', '["30","31","50","51"]', '31', 8),
  ('Academic', 'If Rs 60 is paid as zakat at 1/40 of the amount, what is the amount?', '["Rs 1,500","Rs 2,400","Rs 3,600","Rs 6,400"]', 'Rs 2,400', 9),
  ('Academic', 'What is 90% of 90?', '["0.9","9","81","82"]', '81', 10),
  ('Academic', 'In a class of 500 students, 340 are boys. What percentage are girls?', '["30%","32%","66%","68%"]', '32%', 11),
  ('Academic', 'What is one third of 10% of 90?', '["3","9","12","15"]', '3', 12),
  ('Verbal', 'If yesterday was Sunday, what day will be the day after tomorrow?', '["Monday","Tuesday","Wednesday","Saturday"]', 'Wednesday', 13),
  ('Verbal', 'If the 28th day of a month is Sunday, what day is the 2nd day?', '["Sunday","Monday","Tuesday","Wednesday"]', 'Tuesday', 14),
  ('Verbal', 'If the 14th day of a month is Sunday, what day is the 4th day?', '["Tuesday","Wednesday","Thursday","Friday"]', 'Thursday', 15),
  ('Verbal', 'In the alphabet series A, D, G, J, what comes next?', '["K","L","M","N"]', 'M', 16),
  ('Verbal', 'What is the third letter when AUGMENTED is arranged alphabetically?', '["A","D","E","G"]', 'E', 17),
  ('Verbal', 'If 35261 stands for TEARS, what does 153 stand for?', '["SET","STE","TES","EST"]', 'SET', 18),
  ('Verbal', 'A train covers 15 km for every litre costing Rs 90. How far can it travel with Rs 450?', '["45 km","60 km","75 km","90 km"]', '75 km', 19),
  ('Verbal', 'Find the next number: 3, 7, 11, 15, ...', '["17","18","19","20"]', '19', 20),
  ('Verbal', 'Find the next number: 10, 20, 31, 43, ...', '["54","55","56","57"]', '56', 21),
  ('Verbal', 'Find the next number: 4, 6, 9, 13, 18, ...', '["22","23","24","25"]', '24', 22),
  ('Verbal', 'Find the next prime number: 2, 3, 5, 7, ...', '["9","10","11","12"]', '11', 23),
  ('Verbal', 'Find the next number: 2, 4, 12, 48, ...', '["120","180","240","300"]', '240', 24),
  ('Verbal', 'Find the next number: 64, 32, 16, 8, ...', '["2","4","6","12"]', '4', 25),
  ('Verbal', 'Find the next number: 1, 5, 2, 10, 3, 15, ...', '["4","6","20","25"]', '4', 26),
  ('Verbal', 'Find the next number: 1, 4, 9, 16, ...', '["20","24","25","36"]', '25', 27),
  ('Verbal', 'Find the next number: 7, 26, 63, ...', '["80","100","124","125"]', '124', 28),
  ('Verbal', 'Find the next number: 16, 12, 28, 8, 4, ...', '["8","10","12","16"]', '12', 29),
  ('Verbal', 'Clock is to time as thermometer is to:', '["Heat","Radiation","Energy","Temperature"]', 'Temperature', 30)
) as q(test_type, question_text, options, correct_answer, seed_order)
where t.type::text = q.test_type
  and not exists (select 1 from public.initial_questions existing where existing.question_text = q.question_text);
