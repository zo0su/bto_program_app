# 프로젝트 구조

```
codingJudge_app/
├── frontend/                    # React 프론트엔드
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # 재사용 가능한 컴포넌트
│   │   │   ├── CodeEditor.jsx   # 코드 에디터 (붙여넣기 금지)
│   │   │   ├── CodeEditor.css
│   │   │   ├── TypingSpeedGraph.jsx  # 타이핑 속도 그래프
│   │   │   └── TypingSpeedGraph.css
│   │   ├── pages/               # 페이지 컴포넌트
│   │   │   ├── ProblemSolving.jsx    # 문제 풀이 페이지
│   │   │   └── ProblemSolving.css
│   │   ├── App.js               # 메인 앱 컴포넌트
│   │   ├── App.css
│   │   └── index.js             # 진입점
│   ├── package.json
│   └── .env.example
│
├── backend/                     # Node.js 백엔드
│   ├── routes/                  # API 라우트
│   │   ├── auth.js              # 인증 관련
│   │   ├── problems.js          # 문제 CRUD
│   │   ├── submissions.js       # 제출 관련
│   │   ├── assessments.js       # 수행평가 관련
│   │   ├── students.js          # 학생 관리 (일괄 등록)
│   │   ├── judge.js             # 코드 저지 엔진
│   │   └── google-classroom.js  # Google Classroom 연동
│   ├── config/
│   │   └── supabase.js          # Supabase 클라이언트 설정
│   ├── utils/
│   │   └── gradeCalculator.js   # 등급 계산 유틸리티
│   ├── server.js                # Express 서버
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── database/
│   └── schema.sql               # 데이터베이스 스키마
│
├── docker-compose.yml           # Docker Compose 설정
├── README.md                    # 프로젝트 개요
├── INSTALLATION.md              # 설치 가이드
├── PROJECT_STRUCTURE.md         # 이 파일
└── .gitignore
```

## 주요 기능별 파일 위치

### 1. 붙여넣기 금지 기능
- `frontend/src/components/CodeEditor.jsx`
  - `onpaste`, `drop`, `contextmenu` 이벤트 차단
  - 키보드 단축키 (Ctrl+V 등) 차단

### 2. 타이핑 속도 그래프
- `frontend/src/components/TypingSpeedGraph.jsx`
  - Chart.js를 사용한 실시간 그래프
  - 치팅 감지 로직

### 3. 등급/점수 시스템
- `backend/utils/gradeCalculator.js`
  - 점수 → 등급 변환
  - 등급 → 표준 점수 변환

### 4. 학생 일괄 등록
- `backend/routes/students.js`
  - CSV 파일 업로드 처리
  - 일괄 사용자 생성

### 5. 코드 저지 엔진
- `backend/routes/judge.js`
  - Docker 컨테이너에서 코드 실행
  - 테스트 케이스 채점

### 6. Google Classroom 연동
- `backend/routes/google-classroom.js`
  - OAuth 인증
  - 점수 전송

## 데이터베이스 테이블 구조

- `profiles`: 사용자 프로필 (역할: student/teacher/admin)
- `problems`: 문제 정보
- `test_cases`: 테스트 케이스
- `assessments`: 수행평가
- `assessment_problems`: 수행평가-문제 연결
- `submissions`: 코드 제출
- `typing_logs`: 타이핑 로그 (치팅 감지용)
- `assessment_results`: 수행평가 결과 (등급 포함)

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 문제
- `GET /api/problems` - 문제 목록
- `GET /api/problems/:id` - 문제 상세
- `POST /api/problems` - 문제 생성 (교사/관리자)
- `PUT /api/problems/:id` - 문제 수정
- `DELETE /api/problems/:id` - 문제 삭제

### 제출
- `GET /api/submissions` - 제출 목록
- `POST /api/submissions` - 코드 제출
- `POST /api/submissions/typing-logs` - 타이핑 로그 저장

### 수행평가
- `GET /api/assessments` - 수행평가 목록
- `POST /api/assessments` - 수행평가 생성
- `POST /api/assessments/:id/calculate-results` - 결과 계산 및 등급 부여
- `GET /api/assessments/:id/results` - 수행평가 결과 조회

### 학생 관리
- `GET /api/students` - 학생 목록
- `POST /api/students/batch-register` - 일괄 등록 (CSV)
- `GET /api/students/template` - CSV 템플릿 다운로드

### 저지 엔진
- `POST /api/judge/run` - 코드 실행
- `POST /api/judge/judge/:submission_id` - 코드 채점

### Google Classroom
- `GET /api/google-classroom/auth-url` - 인증 URL
- `GET /api/google-classroom/callback` - OAuth 콜백
- `GET /api/google-classroom/courses` - 클래스 목록
- `POST /api/google-classroom/submit-grade` - 점수 전송

