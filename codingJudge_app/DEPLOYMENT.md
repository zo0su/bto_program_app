# 배포 가이드

## 1. GitHub 업로드 절차

### 1단계: Git 초기화 및 커밋

```bash
# 프로젝트 루트 디렉토리에서
cd C:\Users\zo0su\codingJudge_app

# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 코딩 저지 사이트 구현 완료"
```

### 2단계: GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단 **+** 버튼 클릭 → **New repository**
3. 저장소 정보 입력:
   - Repository name: `codingJudge_app` (또는 원하는 이름)
   - Description: "고교 정보 수행평가용 코딩 저지 시스템"
   - Visibility: Public 또는 Private 선택
   - **⚠️ README, .gitignore, license는 추가하지 않음** (이미 있음)
4. **Create repository** 클릭

### 3단계: 원격 저장소 연결 및 푸시

```bash
# 원격 저장소 추가 (YOUR_USERNAME을 본인 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/codingJudge_app.git

# 또는 SSH 사용 시
# git remote add origin git@github.com:YOUR_USERNAME/codingJudge_app.git

# 브랜치 이름을 main으로 변경 (필요한 경우)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 4단계: .gitignore 확인

다음 파일/폴더는 자동으로 제외됩니다 (이미 `.gitignore`에 포함됨):
- `node_modules/`
- `.env` 파일들
- `uploads/` 폴더
- `*.log` 파일들

**⚠️ 중요**: `.env` 파일은 절대 GitHub에 업로드하지 마세요!

### 5단계: 환경 변수 파일 처리

`.env` 파일은 민감한 정보가 포함되어 있으므로 GitHub에 업로드되지 않습니다.
대신 팀원들과 공유하려면:

```bash
# env.example.txt 파일은 이미 업로드됨
# 팀원들은 이 파일을 복사하여 .env 파일을 만들면 됨
```

## 2. Supabase 설정 절차

### 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `coding-judge-site` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (반드시 저장!)
   - **Region**: 가장 가까운 지역 선택 (예: Northeast Asia (Seoul))
   - **Pricing Plan**: Free tier 선택
4. **Create new project** 클릭
5. 프로젝트 생성 완료까지 1-2분 대기

### 2단계: 데이터베이스 스키마 생성

1. Supabase Dashboard에서 프로젝트 선택
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. **New query** 클릭
4. `database/schema.sql` 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
6. 성공 메시지 확인

### 3단계: API 키 확인

1. Supabase Dashboard에서 프로젝트 선택
2. 왼쪽 메뉴에서 **Settings** → **API** 클릭
3. 다음 정보 확인:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (긴 문자열)
   - **service_role key**: `eyJhbGc...` (더 긴 문자열) ⚠️ 비밀에 유지

### 4단계: 환경 변수 설정

#### 백엔드 `.env` 파일

```bash
cd backend
# env.example.txt를 참고하여 .env 파일 생성
```

`.env` 파일 내용:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (anon/public key)
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)
PORT=5000
NODE_ENV=development

# Google Classroom (선택사항)
GOOGLE_CLASSROOM_CLIENT_ID=your_client_id
GOOGLE_CLASSROOM_CLIENT_SECRET=your_client_secret
GOOGLE_CLASSROOM_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

#### 프론트엔드 `.env` 파일

```bash
cd frontend
# env.example.txt를 참고하여 .env 파일 생성
```

`.env` 파일 내용:
```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc... (anon/public key)
```

### 5단계: Row Level Security (RLS) 정책 설정 (선택사항)

기본 스키마에는 RLS가 활성화되어 있지만, 실제 사용을 위해서는 추가 정책이 필요할 수 있습니다.

Supabase Dashboard → **Authentication** → **Policies**에서 추가 정책을 설정할 수 있습니다.

## 3. Google Classroom API 설정 (선택사항)

### 1단계: Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **API 및 서비스** → **라이브러리** 이동
4. "Google Classroom API" 검색 후 **활성화**

### 2단계: OAuth 2.0 클라이언트 ID 생성

1. **API 및 서비스** → **사용자 인증 정보** 이동
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션**
4. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/auth/google/callback` (개발)
   - `https://your-domain.com/auth/google/callback` (프로덕션)
5. **만들기** 클릭
6. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

### 3단계: 환경 변수에 추가

백엔드 `.env` 파일에 추가:
```env
GOOGLE_CLASSROOM_CLIENT_ID=your_client_id_here
GOOGLE_CLASSROOM_CLIENT_SECRET=your_client_secret_here
GOOGLE_CLASSROOM_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 4. 로컬에서 테스트

### 백엔드 테스트
```bash
cd backend
npm install
npm run dev
```

브라우저에서 `http://localhost:5000/api/health` 접속하여 확인:
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

## 5. 초기 관리자 계정 생성

Supabase Dashboard → **SQL Editor**에서 실행:

```sql
-- 1. 관리자 사용자 생성 (비밀번호: admin123)
-- 실제 운영 시에는 더 강력한 비밀번호를 사용하세요!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  ''
) RETURNING id;

-- 2. 프로필 생성 (위에서 생성된 사용자 ID를 사용)
-- 위 쿼리의 결과에서 ID를 복사하여 아래 쿼리의 'USER_ID_HERE'를 대체
INSERT INTO profiles (id, email, name, role)
SELECT id, email, '관리자', 'admin'
FROM auth.users
WHERE email = 'admin@example.com';
```

또는 더 간단한 방법으로 Supabase Dashboard → **Authentication** → **Users** → **Add user**에서 수동으로 추가할 수 있습니다.

## 6. 배포 체크리스트

- [ ] GitHub 저장소 생성 및 코드 푸시 완료
- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 생성 완료
- [ ] 환경 변수 파일 설정 완료
- [ ] 백엔드 로컬 테스트 완료
- [ ] 프론트엔드 로컬 테스트 완료
- [ ] 관리자 계정 생성 완료
- [ ] Google Classroom API 설정 (선택사항)

## 문제 해결

### Git 푸시 오류
```bash
# 원격 저장소 연결 확인
git remote -v

# 강제 푸시 (주의: 기존 내용 덮어씀)
git push -u origin main --force
```

### Supabase 연결 오류
- API 키가 올바른지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 방화벽 설정 확인

### 환경 변수 로드 오류
- `.env` 파일이 올바른 위치에 있는지 확인
- 파일 이름이 정확히 `.env`인지 확인 (`.env.txt` 아님)
- 환경 변수 이름이 정확한지 확인

## 추가 리소스

- [GitHub 문서](https://docs.github.com/)
- [Supabase 문서](https://supabase.com/docs)
- [Google Classroom API 문서](https://developers.google.com/classroom)

