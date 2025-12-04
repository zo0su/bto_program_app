@echo off
echo ====================================
echo GitHub 업로드 스크립트
echo ====================================
echo.

REM Git 초기화 확인
if not exist .git (
    echo [1/5] Git 저장소 초기화 중...
    git init
    echo Git 저장소가 초기화되었습니다.
) else (
    echo Git 저장소가 이미 초기화되어 있습니다.
)
echo.

REM 파일 추가
echo [2/5] 변경사항 추가 중...
git add .
echo 파일이 추가되었습니다.
echo.

REM 커밋
echo [3/5] 커밋 생성 중...
set /p COMMIT_MSG="커밋 메시지를 입력하세요 (기본: Initial commit): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Initial commit: 코딩 저지 사이트 구현 완료
git commit -m "%COMMIT_MSG%"
echo 커밋이 생성되었습니다.
echo.

REM 원격 저장소 확인
echo [4/5] 원격 저장소 확인 중...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo 원격 저장소가 설정되지 않았습니다.
    set /p GITHUB_URL="GitHub 저장소 URL을 입력하세요 (예: https://github.com/username/repo.git): "
    git remote add origin %GITHUB_URL%
    echo 원격 저장소가 추가되었습니다.
) else (
    echo 원격 저장소가 이미 설정되어 있습니다.
)
echo.

REM 푸시
echo [5/5] GitHub에 푸시 중...
git branch -M main
git push -u origin main
echo.

echo ====================================
echo 업로드 완료!
echo ====================================
pause



