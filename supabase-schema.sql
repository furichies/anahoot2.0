-- profiles (extends Supabase Auth users)
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  email text not null,
  role text not null default 'alumno' check (role in ('profesor', 'alumno')),
  avatar text not null default '🦁',
  created_at timestamptz default now()
);

-- questions (managed by profesor via JSON upload)
create table questions (
  id serial primary key,
  text text not null,
  image text,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('A','B','C','D')),
  explanation text not null,
  category text not null,
  created_at timestamptz default now()
);

-- rooms (game sessions)
create table rooms (
  id text primary key,                    -- 4-digit PIN e.g. "4829"
  host_id uuid references profiles(id) not null,
  status text not null default 'waiting'  -- waiting | playing | showing_stats | leaderboard | finished
    check (status in ('waiting','playing','showing_stats','leaderboard','finished')),
  current_question_index int default 0,
  total_questions int default 20,
  created_at timestamptz default now()
);

-- room_players (who is in which room)
create table room_players (
  id serial primary key,
  room_id text references rooms(id) on delete cascade,
  player_id uuid references profiles(id),
  score int default 0,
  joined_at timestamptz default now(),
  unique(room_id, player_id)
);

-- answers (per-question responses)
create table answers (
  id serial primary key,
  room_id text references rooms(id) on delete cascade,
  question_id int references questions(id),
  player_id uuid references profiles(id),
  selected_option text check (selected_option in ('A','B','C','D')),
  is_correct boolean not null default false,
  time_spent float not null default 0,      -- seconds
  points_earned int not null default 0,
  created_at timestamptz default now(),
  unique(room_id, question_id, player_id)   -- one answer per question per player
);

-- Enable RLS
alter table profiles enable row level security;
alter table questions enable row level security;
alter table rooms enable row level security;
alter table room_players enable row level security;
alter table answers enable row level security;

-- RLS Policies

-- Profiles: everyone can read, users can update their own
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Questions: anyone can read, only profesor can manage (for now relying on UI protection, but we can make it public for simplicity in prototyping, or check role)
create policy "Questions are viewable by everyone." on questions for select using (true);
create policy "Anyone can insert questions" on questions for insert with check (true);
create policy "Anyone can update questions" on questions for update using (true);
create policy "Anyone can delete questions" on questions for delete using (true);

-- Rooms: anyone can read, authenticated can insert/update
create policy "Rooms are viewable by everyone." on rooms for select using (true);
create policy "Authenticated users can insert rooms." on rooms for insert with check (auth.uid() = host_id);
create policy "Host can update their rooms." on rooms for update using (auth.uid() = host_id);

-- Room Players: everyone can read, players can join
create policy "Room players viewable by everyone." on room_players for select using (true);
create policy "Players can join rooms." on room_players for insert with check (auth.uid() = player_id);
create policy "Players can update their own score." on room_players for update using (auth.uid() = player_id);

-- Answers: everyone can read (needed for stats), players can insert
create policy "Answers viewable by everyone." on answers for select using (true);
create policy "Players can insert their own answers." on answers for insert with check (auth.uid() = player_id);
