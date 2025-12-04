# Coder AI Judge Site

고등학교 정보 교과 수행평가를 위한 온라인 코딩 저지 시스템

## 프로젝트 구조

```
codingJudge_app/
├── frontend/          # React 프론트엔드
├── backend/           # Node.js + Express 백엔드
├── judge-engine/      # Docker 기반 코드 실행 환경
├── docker-compose.yml # 개발 환경 Docker 구성
└── README.md
```

## 기술 스택

- **프론트엔드**: React, Chart.js
- **백엔드**: Node.js, Express
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **코드 실행**: Docker 컨테이너
- **API 연동**: Google Classroom API

## 주요 기능

1. ✅ 수행평가 및 등급/점수 구성 (100/90/80/70/40 -> A/B/C/D/E)
2. ✅ 학생 입력창 붙여넣기 금지
3. ✅ 실시간 타이핑 속도 그래프 및 치팅 경고
4. ✅ 관리자 일괄 학생 등록 (CSV/Google Sheets)
5. ✅ 문제 생성 및 채점 기능
6. ✅ Google Classroom 연동

## 설치 및 실행

### 프론트엔드
```bash
cd frontend
npm install
npm start
```

### 백엔드
```bash
cd backend
npm install
npm run dev
```

## 환경 변수 설정

### 백엔드
`backend/env.example.txt`를 참고하여 `.env` 파일을 생성하세요.

### 프론트엔드
`frontend/env.example.txt`를 참고하여 `.env` 파일을 생성하세요.

자세한 설치 가이드는 [INSTALLATION.md](./INSTALLATION.md)를 참고하세요.

## 프로젝트 문서

- [INSTALLATION.md](./INSTALLATION.md) - 설치 및 설정 가이드
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 프로젝트 구조 상세 설명
- [FEATURES.md](./FEATURES.md) - 기능 상세 설명
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드 (GitHub + Supabase)
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub 업로드 가이드
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 설정 가이드

## 주요 기능 상세

### 1. 수행평가 및 등급/점수 구성
- 점수에 따른 등급 자동 계산 (100/90/80/70/40 → A/B/C/D/E)
- `backend/utils/gradeCalculator.js`에서 구현

### 2. 학생 입력창 붙여넣기 금지
- 모든 붙여넣기 방식 차단 (Ctrl+V, 우클릭, 드래그앤드롭)
- `frontend/src/components/CodeEditor.jsx`에서 구현

### 3. 실시간 타이핑 속도 그래프
- Chart.js를 사용한 실시간 시각화
- 치팅 패턴 자동 감지 및 경고
- `frontend/src/components/TypingSpeedGraph.jsx`에서 구현

### 4. 관리자 일괄 학생 등록
- CSV 파일 업로드로 최대 2,000명까지 일괄 등록
- `backend/routes/students.js`에서 구현

### 5. 문제 생성 및 채점
- Docker 기반 안전한 코드 실행 환경
- 자동 채점 시스템
- `backend/routes/judge.js`에서 구현

### 6. Google Classroom 연동
- OAuth 2.0 인증
- 수행평가 점수 자동 전송
- `backend/routes/google-classroom.js`에서 구현

## API 엔드포인트

주요 API 엔드포인트는 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)에서 확인할 수 있습니다.

## 라이선스

MIT

## 기여

이슈나 개선 사항이 있다면 이슈를 등록해주세요.

