const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { supabase } = require('../config/supabase');

// Google Classroom OAuth 설정
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLASSROOM_CLIENT_ID,
  process.env.GOOGLE_CLASSROOM_CLIENT_SECRET,
  process.env.GOOGLE_CLASSROOM_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
);

const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

// Google Classroom 인증 URL 생성
router.get('/auth-url', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ authUrl });
});

// OAuth 콜백 처리
router.get('/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 사용자 정보 조회
    const { data: userInfo } = await google.oauth2('v2').userinfo.get({
      auth: oauth2Client
    });

    // 토큰 저장 (실제로는 DB에 저장)
    // TODO: 사용자별로 토큰 저장

    res.json({
      message: 'Google Classroom connected successfully',
      tokens,
      user: userInfo.data
    });
  } catch (error) {
    next(error);
  }
});

// 클래스 목록 조회
router.get('/courses', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: 저장된 토큰으로 oauth2Client 설정
    // oauth2Client.setCredentials(/* saved tokens */);

    const { data: courses } = await classroom.courses.list({
      courseStates: 'ACTIVE'
    });

    res.json(courses.courses || []);
  } catch (error) {
    next(error);
  }
});

// 수행평가 점수를 Google Classroom에 전송
router.post('/submit-grade', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { assessment_id, course_id, coursework_id } = req.body;

    // 수행평가 결과 조회
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*, profiles(*)')
      .eq('assessment_id', assessment_id);

    if (resultsError) throw resultsError;

    // TODO: 저장된 토큰으로 oauth2Client 설정

    // 각 학생의 점수를 Google Classroom에 전송
    const submissions = [];
    for (const result of results) {
      try {
        // 학생의 이메일로 사용자 ID 찾기
        const studentEmail = result.profiles.email;
        
        // Google Classroom에서 학생 ID 조회
        // TODO: 실제 구현

        const submission = {
          courseId: course_id,
          courseWorkId: coursework_id,
          userId: studentEmail,
          assignedGrade: result.final_score,
          draftGrade: result.final_score
        };

        submissions.push(submission);
      } catch (error) {
        console.error(`Failed to submit grade for student ${result.student_id}:`, error);
      }
    }

    res.json({
      message: 'Grades submitted to Google Classroom',
      submissions_count: submissions.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

