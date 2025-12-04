# GitHub 업로드 가이드 (Windows)

## 방법 1: 스크립트 사용 (간편)

1. `deploy-to-github.bat` 파일을 더블클릭하여 실행
2. 화면 안내에 따라 진행

## 방법 2: 수동 명령어 사용

### PowerShell 또는 명령 프롬프트에서 실행

```powershell
# 1. 프로젝트 디렉토리로 이동
cd C:\Users\zo0su\codingJudge_app

# 2. Git 초기화 (처음 한 번만)
git init

# 3. 모든 파일 추가
git add .

# 4. 커밋 생성
git commit -m "Initial commit: 코딩 저지 사이트 구현 완료"

# 5. GitHub에서 저장소 생성 후 원격 저장소 연결
#    (GitHub 웹사이트에서 먼저 저장소를 만들어야 합니다)
git remote add origin https://github.com/YOUR_USERNAME/codingJudge_app.git

# 6. 브랜치 이름을 main으로 변경
git branch -M main

# 7. GitHub에 푸시
git push -u origin main
```

## GitHub 저장소 생성 방법

1. [GitHub.com](https://github.com) 접속 및 로그인
2. 우측 상단 **+** 버튼 클릭 → **New repository**
3. 저장소 정보 입력:
   - **Repository name**: `codingJudge_app`
   - **Description**: "고교 정보 수행평가용 코딩 저지 시스템"
   - **Public** 또는 **Private** 선택
   - ⚠️ **README, .gitignore, license는 체크하지 않음** (이미 있음)
4. **Create repository** 클릭
5. 생성된 저장소의 URL 복사 (예: `https://github.com/username/codingJudge_app.git`)

## 주의사항

### ❌ 업로드되지 않는 파일들
다음 파일/폴더는 `.gitignore`에 의해 자동으로 제외됩니다:
- `.env` 파일들 (민감한 정보 포함)
- `node_modules/` 폴더
- `uploads/` 폴더
- 로그 파일들

### ✅ 업로드되는 파일들
- 모든 소스 코드
- `package.json` 파일들
- 문서 파일들 (README.md, INSTALLATION.md 등)
- `env.example.txt` 파일들 (템플릿)

## 인증 문제 해결

### GitHub 인증이 필요한 경우

**방법 1: Personal Access Token 사용 (권장)**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)** 클릭
3. 권한 선택: `repo` 체크
4. 토큰 생성 후 복사
5. 푸시 시 비밀번호 대신 토큰 입력

**방법 2: GitHub CLI 사용**

```powershell
# GitHub CLI 설치 후
gh auth login
git push -u origin main
```

## 업데이트 방법 (이후 변경사항 반영)

```powershell
# 1. 변경사항 확인
git status

# 2. 변경된 파일 추가
git add .

# 3. 커밋
git commit -m "변경사항 설명"

# 4. 푸시
git push
```

## 문제 해결

### "fatal: remote origin already exists" 오류
```powershell
# 기존 원격 저장소 제거 후 재추가
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/codingJudge_app.git
```

### "fatal: refusing to merge unrelated histories" 오류
```powershell
# 강제 병합 (주의: 기존 내용 덮어쓸 수 있음)
git pull origin main --allow-unrelated-histories
```

### 푸시 권한 오류
- GitHub 저장소의 Owner인지 확인
- Personal Access Token이 올바른지 확인
- 저장소 URL이 정확한지 확인



