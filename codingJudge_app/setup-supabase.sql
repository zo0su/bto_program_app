-- Supabase 설정을 위한 SQL 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 데이터베이스 스키마 생성 (schema.sql의 내용)
-- 이 파일은 참고용이며, 실제로는 database/schema.sql 파일을 사용하세요

-- 2. 초기 관리자 계정 생성 예시
-- 주의: 실제 운영 시에는 더 강력한 비밀번호를 사용하세요!

-- 방법 1: Supabase Dashboard > Authentication > Users에서 수동으로 추가
-- 방법 2: 아래 SQL 실행 (Supabase 함수 필요)

-- 관리자 계정 생성 함수 (Supabase에서 제공하는 함수 사용)
-- 실제로는 Supabase Dashboard의 Authentication 메뉴에서 사용자를 추가하는 것이 더 안전합니다.

-- 임시 사용자 생성 후 프로필 연결
-- 주의: 이 방법은 Supabase의 auth.users 테이블에 직접 접근해야 합니다.
-- Supabase Dashboard > Authentication > Users > Add user에서 추가하는 것을 권장합니다.

-- 프로필만 생성하는 경우 (사용자는 Dashboard에서 먼저 생성)
-- 아래 쿼리의 'USER_UUID_HERE'를 실제 사용자 UUID로 변경
/*
INSERT INTO profiles (id, email, name, role)
VALUES (
    'USER_UUID_HERE',  -- Supabase Dashboard > Authentication > Users에서 확인한 UUID
    'admin@example.com',
    '관리자',
    'admin'
);
*/

-- Row Level Security 정책 예시 (필요한 경우 추가)
-- 학생은 자신의 제출만 볼 수 있음
CREATE POLICY IF NOT EXISTS "Students can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = student_id);

-- 교사는 자신의 클래스 학생 제출을 볼 수 있음
CREATE POLICY IF NOT EXISTS "Teachers can view class submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p1
            WHERE p1.id = auth.uid()
            AND p1.role = 'teacher'
            AND EXISTS (
                SELECT 1 FROM profiles p2
                WHERE p2.id = submissions.student_id
                AND p2.class_name = p1.class_name
            )
        )
    );

-- 관리자는 모든 제출을 볼 수 있음
CREATE POLICY IF NOT EXISTS "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );



