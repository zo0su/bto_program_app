# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속
2. **Start your project** 또는 **Sign in** 클릭
3. GitHub 계정으로 로그인 (또는 이메일로 가입)
4. **New Project** 클릭
5. 프로젝트 정보 입력:
   - **Name**: `coding-judge-site` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 ⚠️ **반드시 저장!**
   - **Region**: `Northeast Asia (Seoul)` (가장 가까운 지역)
   - **Pricing Plan**: `Free` 선택
6. **Create new project** 클릭
7. 프로젝트 생성 완료까지 **1-2분** 대기

## 2단계: 데이터베이스 스키마 생성

### 방법 1: SQL Editor 사용 (권장)

1. Supabase Dashboard에서 프로젝트 선택
2. 왼쪽 메뉴 **SQL Editor** 클릭
3. **New query** 버튼 클릭
4. `database/schema.sql` 파일을 열어서 내용 복사
5. SQL Editor에 붙여넣기
6. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
7. ✅ 성공 메시지 확인

### 방법 2: 파일 업로드

1. SQL Editor에서 **Upload file** 버튼 클릭
2. `database/schema.sql` 파일 선택
3. 실행

## 3단계: API 키 확인

1. Supabase Dashboard에서 프로젝트 선택
2. 왼쪽 메뉴 **Settings** (톱니바퀴 아이콘) 클릭
3. **API** 메뉴 클릭
4. 다음 정보 확인 및 복사:

### Project URL
```
https://xxxxx.supabase.co
```

### API Keys

#### 1. anon public (프론트엔드용)
- 이름: `anon` 또는 `public`
- 키: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (긴 문자열)
- 용도: 프론트엔드 `.env` 파일에 사용

#### 2. service_role (백엔드용)
- 이름: `service_role`
- 키: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (더 긴 문자열)
- ⚠️ **비밀에 유지!** 백엔드 `.env` 파일에만 사용
- 용도: 서버 사이드 작업 (관리자 권한)

## 4단계: 환경 변수 설정

### 백엔드 `.env` 파일 생성

```bash
cd backend
copy env.example.txt .env
```

`.env` 파일 내용 (실제 값으로 변경):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=5000
NODE_ENV=development
```

### 프론트엔드 `.env` 파일 생성

```bash
cd frontend
copy env.example.txt .env
```

`.env` 파일 내용 (실제 값으로 변경):
```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5단계: 초기 관리자 계정 생성

### 방법 1: Supabase Dashboard 사용 (권장)

1. Supabase Dashboard → **Authentication** 클릭
2. **Users** 탭 클릭
3. **Add user** → **Create new user** 클릭
4. 정보 입력:
   - **Email**: `admin@example.com`
   - **Password**: 강력한 비밀번호 입력
   - **Auto Confirm User**: 체크
5. **Create user** 클릭
6. 생성된 사용자의 **UUID** 복사

7. **SQL Editor**에서 다음 쿼리 실행 (UUID 변경):
```sql
INSERT INTO profiles (id, email, name, role)
VALUES (
    '복사한-UUID-여기에-붙여넣기',
    'admin@example.com',
    '관리자',
    'admin'
);
```

### 방법 2: SQL만 사용 (고급)

SQL Editor에서 실행:
```sql
-- 1. 사용자 생성 (Supabase 함수 사용)
-- 주의: 이 방법은 Supabase의 특정 함수가 필요할 수 있습니다.
-- Dashboard를 통한 방법을 권장합니다.
```

## 6단계: 연결 테스트

### 백엔드 테스트

```bash
cd backend
npm install
npm run dev
```

브라우저에서 `http://localhost:5000/api/health` 접속:
```json
{"status":"ok","message":"Coder AI Judge API is running"}
```

### 프론트엔드 테스트

```bash
cd frontend
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속

### Supabase 연결 테스트

SQL Editor에서 테스트 쿼리 실행:
```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 프로필 테이블 확인
SELECT * FROM profiles LIMIT 5;
```

## 7단계: Row Level Security (RLS) 정책 확인

1. Supabase Dashboard → **Authentication** → **Policies**
2. 각 테이블의 RLS 정책 확인
3. 필요시 추가 정책 생성

기본 정책 예시:
- 학생은 자신의 제출만 조회 가능
- 교사는 자신의 클래스 학생 제출 조회 가능
- 관리자는 모든 데이터 조회 가능

## 문제 해결

### 스키마 생성 오류
- SQL 문법 오류 확인
- 기존 테이블이 있는지 확인
- 오류 메시지를 자세히 읽고 수정

### 연결 오류
- API 키가 정확한지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 확인

### 인증 오류
- 사용자 이메일이 확인되었는지 확인
- 비밀번호가 올바른지 확인
- 프로필 테이블에 사용자 정보가 있는지 확인

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase SQL 가이드](https://supabase.com/docs/guides/database)
- [Supabase 인증 가이드](https://supabase.com/docs/guides/auth)



