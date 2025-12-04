# 설치 및 설정 가이드

## 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Docker 및 Docker Compose (코드 저지 엔진 사용 시)
- Supabase 계정 (무료 계정 가능)

## 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. 프로젝트 설정에서 API 키 확인:
   - Project URL
   - anon/public key
   - service_role key (서버 사이드에서만 사용)
3. SQL Editor에서 `database/schema.sql` 파일의 내용을 실행하여 데이터베이스 스키마 생성

## 2. Google Classroom API 설정 (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. API 및 서비스 > 라이브러리에서 "Google Classroom API" 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/auth/google/callback` (개발)
   - `https://your-domain.com/auth/google/callback` (프로덕션)

## 3. 환경 변수 설정

### 백엔드

```bash
cd backend
cp .env.example .env
```

`.env` 파일을 열어 다음 변수들을 설정:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GOOGLE_CLASSROOM_CLIENT_ID=your_google_client_id
GOOGLE_CLASSROOM_CLIENT_SECRET=your_google_client_secret
PORT=5000
```

### 프론트엔드

```bash
cd frontend
cp .env.example .env
```

`.env` 파일을 열어 다음 변수들을 설정:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. 의존성 설치

### 백엔드

```bash
cd backend
npm install
```

### 프론트엔드

```bash
cd frontend
npm install
```

## 5. 실행

### 개발 모드

#### 백엔드
```bash
cd backend
npm run dev
```

서버가 `http://localhost:5000`에서 실행됩니다.

#### 프론트엔드
```bash
cd frontend
npm start
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

### Docker를 사용한 실행

```bash
docker-compose up -d
```

## 6. 초기 관리자 계정 생성

Supabase Dashboard에서 직접 SQL을 실행하거나, API를 통해 관리자 계정을 생성할 수 있습니다.

```sql
-- 관리자 계정 생성 예시
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@example.com', crypt('your_password', gen_salt('bf')), NOW());

INSERT INTO profiles (id, email, name, role)
SELECT id, email, '관리자', 'admin'
FROM auth.users
WHERE email = 'admin@example.com';
```

## 7. 문제 해결

### Docker 관련 오류

- Docker가 설치되어 있고 실행 중인지 확인
- Docker 소켓 권한 확인: `sudo usermod -aG docker $USER`

### Supabase 연결 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트의 RLS (Row Level Security) 정책 확인
- 네트워크 방화벽 설정 확인

### Google Classroom API 오류

- API가 활성화되어 있는지 확인
- OAuth 클라이언트 ID와 시크릿이 올바른지 확인
- 리디렉션 URI가 승인된 URI 목록에 포함되어 있는지 확인

## 추가 자료

- [Supabase 문서](https://supabase.com/docs)
- [Google Classroom API 문서](https://developers.google.com/classroom)
- [Docker 문서](https://docs.docker.com/)

