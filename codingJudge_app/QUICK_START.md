# 빠른 시작 가이드

## 5분 안에 시작하기

### 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 무료 계정 생성
2. 새 프로젝트 생성
3. SQL Editor 열기
4. `database/schema.sql` 파일의 내용 복사하여 실행

### 2단계: 환경 변수 설정

#### 백엔드
```bash
cd backend
cp env.example.txt .env
```

`.env` 파일을 열어 Supabase 정보 입력:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
PORT=5000
```

#### 프론트엔드
```bash
cd frontend
cp env.example.txt .env
```

`.env` 파일을 열어 Supabase 정보 입력:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3단계: 의존성 설치 및 실행

#### 백엔드 실행
```bash
cd backend
npm install
npm run dev
```

#### 프론트엔드 실행 (새 터미널)
```bash
cd frontend
npm install
npm start
```

### 4단계: 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 관리자 계정 생성 (Supabase Dashboard 또는 SQL)

```sql
-- 관리자 계정 생성
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@example.com', crypt('password123', gen_salt('bf')), NOW());

INSERT INTO profiles (id, email, name, role)
SELECT id, email, '관리자', 'admin'
FROM auth.users
WHERE email = 'admin@example.com';
```

## 다음 단계

1. [INSTALLATION.md](./INSTALLATION.md) - 상세 설치 가이드
2. [FEATURES.md](./FEATURES.md) - 기능 상세 설명
3. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 프로젝트 구조 이해

## 문제 해결

### 백엔드 실행 오류
- Node.js 18 이상이 설치되어 있는지 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 포트 5000이 사용 중이 아닌지 확인

### 프론트엔드 실행 오류
- Node.js 18 이상이 설치되어 있는지 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 포트 3000이 사용 중이 아닌지 확인

### Supabase 연결 오류
- Supabase 프로젝트가 활성 상태인지 확인
- API 키가 올바른지 확인
- 네트워크 방화벽 설정 확인

## Docker로 실행하기

```bash
# 환경 변수 설정 후
docker-compose up -d
```

백엔드: `http://localhost:5000`
프론트엔드: `http://localhost:3000`

