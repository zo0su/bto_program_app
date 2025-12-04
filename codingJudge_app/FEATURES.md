# 기능 상세 설명

## ✅ 구현 완료된 기능

### 1. 수행평가 및 등급/점수 구성
- **파일**: `backend/utils/gradeCalculator.js`
- **기능**: 
  - 점수에 따른 등급 자동 계산 (100/90/80/70/40 → A/B/C/D/E)
  - 등급에 따른 표준 점수 변환
- **사용처**: `backend/routes/assessments.js` - 수행평가 결과 계산

### 2. 학생 입력창 붙여넣기 금지
- **파일**: `frontend/src/components/CodeEditor.jsx`
- **구현 방법**:
  - `onpaste` 이벤트 완전 차단
  - `drop` 이벤트 차단 (드래그 앤 드롭 방지)
  - `contextmenu` 이벤트 차단 (우클릭 메뉴 비활성화)
  - 키보드 단축키 차단 (Ctrl+V, Ctrl+Shift+V, Shift+Insert 등)
- **사용자 알림**: 붙여넣기 시도 시 경고 메시지 표시

### 3. 실시간 타이핑 속도 그래프 및 치팅 경고
- **파일**: 
  - `frontend/src/components/TypingSpeedGraph.jsx`
  - `frontend/src/components/TypingSpeedGraph.css`
- **기능**:
  - Chart.js를 사용한 실시간 XY 그래프 (시간 대비 초당 키 입력)
  - 치팅 감지 임계값:
    - 초당 30타 이상: 치팅 의심
    - 급격한 속도 증가: 경고
    - 최소 입력 간격 위반: 경고
  - 서버에 타이핑 로그 저장 (`backend/routes/submissions.js`)
- **데이터 저장**: `typing_logs` 테이블에 저장

### 4. 관리자 일괄 학생 등록
- **파일**: `backend/routes/students.js`
- **기능**:
  - CSV 파일 업로드 처리 (multer 사용)
  - CSV 파싱 및 검증
  - 학생 계정 일괄 생성 (Supabase Auth)
  - 프로필 자동 생성
  - 결과 리포트 (성공/실패 개수)
- **CSV 형식**:
  ```
  student_id,name,email,school,class_name
  2024001,홍길동,student1@example.com,고등학교,1학년 1반
  ```
- **CSV 템플릿 다운로드**: `GET /api/students/template`

### 5. 문제 생성 및 채점 기능
- **문제 관리** (`backend/routes/problems.js`):
  - 문제 CRUD (생성/조회/수정/삭제)
  - 테스트 케이스 관리
  - 문제-테스트케이스 연결
  
- **코드 저지 엔진** (`backend/routes/judge.js`):
  - Docker 컨테이너 기반 코드 실행
  - 언어 지원: Python, JavaScript
  - 테스트 케이스 자동 채점
  - 실행 시간 측정
  - 메모리 제한
  - 네트워크 비활성화 (보안)
  - 출력 정규화 및 비교

- **제출 관리** (`backend/routes/submissions.js`):
  - 코드 제출
  - 제출 상태 추적 (pending/running/accepted/wrong_answer/time_limit/runtime_error/compile_error)
  - 점수 기록

### 6. Google Classroom 연동
- **파일**: `backend/routes/google-classroom.js`
- **기능**:
  - Google OAuth 2.0 인증
  - 클래스 목록 조회
  - 수행평가 점수 전송
- **필요 권한**:
  - `classroom.courses.readonly`
  - `classroom.coursework.me`
  - `classroom.student-submissions.me.readonly`
  - `classroom.rosters.readonly`

## 📋 데이터베이스 스키마

- **profiles**: 사용자 프로필 (역할: student/teacher/admin)
- **problems**: 문제 정보
- **test_cases**: 테스트 케이스
- **assessments**: 수행평가
- **assessment_problems**: 수행평가-문제 연결
- **submissions**: 코드 제출
- **typing_logs**: 타이핑 로그 (치팅 감지용)
- **assessment_results**: 수행평가 결과 (등급 포함)

## 🔒 보안 기능

1. **코드 실행 격리**: Docker 컨테이너 사용
2. **네트워크 비활성화**: 코드 실행 시 네트워크 접근 차단
3. **리소스 제한**: 메모리 및 CPU 제한
4. **인증 및 권한**: Supabase Auth + Row Level Security
5. **치팅 방지**: 붙여넣기 차단 + 타이핑 속도 모니터링

## 📊 등급 시스템

점수에 따른 등급 자동 부여:

| 점수 범위 | 등급 | 표준 점수 |
|---------|------|----------|
| 90점 이상 | A | 100점 |
| 80점 이상 | B | 90점 |
| 70점 이상 | C | 80점 |
| 40점 이상 | D | 70점 |
| 40점 미만 | E | 40점 |

## 🎯 사용자 역할

- **student**: 학생 (문제 풀이, 코드 제출)
- **teacher**: 교사 (문제 생성, 학생 관리, 수행평가 관리)
- **admin**: 관리자 (모든 권한)

## 📝 추가 구현 가능한 기능

1. 코드 에디터 자동 완성
2. 코드 실행 히스토리
3. 실시간 협업 기능
4. 문제별 통계 및 분석
5. 학생별 학습 진도 추적
6. 모바일 반응형 UI 개선

