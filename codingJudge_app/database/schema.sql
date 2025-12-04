-- Coder AI Judge Site 데이터베이스 스키마
-- Supabase PostgreSQL용

-- 사용자 역할 타입
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- 등급 타입
CREATE TYPE grade_type AS ENUM ('A', 'B', 'C', 'D', 'E');

-- 제출 상태 타입
CREATE TYPE submission_status AS ENUM ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error');

-- 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  student_id TEXT, -- 학번 (학생인 경우)
  school TEXT, -- 학교명
  class_name TEXT, -- 학급명
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 문제 테이블
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  example_input TEXT,
  example_output TEXT,
  time_limit INTEGER DEFAULT 1000, -- milliseconds
  memory_limit INTEGER DEFAULT 256, -- MB
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 테스트 케이스 테이블
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  input_data TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수행평가 테이블
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수행평가-문제 연결 테이블
CREATE TABLE assessment_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  score_weight INTEGER DEFAULT 1, -- 점수 가중치
  order_index INTEGER DEFAULT 0,
  UNIQUE(assessment_id, problem_id)
);

-- 코드 제출 테이블
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'python',
  status submission_status DEFAULT 'pending',
  execution_time INTEGER, -- milliseconds
  memory_used INTEGER, -- KB
  score INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타이핑 로그 테이블 (치팅 감지용)
CREATE TABLE typing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  keystrokes_per_second REAL NOT NULL,
  code_length INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL -- milliseconds
);

-- 수행평가 결과 테이블
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  grade grade_type,
  final_score INTEGER, -- 최종 점수 (100/90/80/70/40)
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, student_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- RLS 정책 예시 (필요에 따라 수정)
-- 학생은 자신의 제출만 볼 수 있음
CREATE POLICY "Students can view own submissions" ON submissions
  FOR SELECT USING (auth.uid() = student_id);

-- 교사는 자신이 만든 평가와 문제를 관리할 수 있음
CREATE POLICY "Teachers can manage own problems" ON problems
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 인덱스 생성
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_submissions_assessment ON submissions(assessment_id);
CREATE INDEX idx_typing_logs_student ON typing_logs(student_id);
CREATE INDEX idx_assessment_results_student ON assessment_results(student_id);
CREATE INDEX idx_assessment_results_assessment ON assessment_results(assessment_id);

