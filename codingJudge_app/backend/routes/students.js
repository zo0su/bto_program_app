const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { supabase } = require('../config/supabase');
const path = require('path');

// CSV 파일 업로드 설정
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 학생 일괄 등록 (CSV 업로드)
router.post('/batch-register', upload.single('csv'), async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 관리자/교사만 가능
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['teacher', 'admin'].includes(profile?.role)) {
      return res.status(403).json({ error: 'Forbidden: Only teachers and admins can register students' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const students = [];
    const errors = [];

    // CSV 파일 읽기
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        // CSV 형식: student_id, name, email, school, class_name
        students.push({
          student_id: row.student_id || row.학번,
          name: row.name || row.이름,
          email: row.email || row.이메일,
          school: row.school || row.학교,
          class_name: row.class_name || row.학급
        });
      })
      .on('end', async () => {
        try {
          // 임시 파일 삭제
          fs.unlinkSync(req.file.path);

          // 학생들 일괄 등록
          const results = {
            success: [],
            failed: []
          };

          for (const student of students) {
            try {
              if (!student.email || !student.name) {
                results.failed.push({
                  ...student,
                  error: 'Email or name is missing'
                });
                continue;
              }

              // 기본 비밀번호 생성 (학번 또는 임시 비밀번호)
              const defaultPassword = student.student_id || 'temp123!@#';

              // 사용자 생성
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: student.email,
                password: defaultPassword,
                email_confirm: false // 이메일 확인 필요
              });

              if (authError) {
                results.failed.push({
                  ...student,
                  error: authError.message
                });
                continue;
              }

              // 프로필 생성
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: authData.user.id,
                  email: student.email,
                  name: student.name,
                  role: 'student',
                  student_id: student.student_id,
                  school: student.school,
                  class_name: student.class_name
                });

              if (profileError) {
                // 프로필 생성 실패 시 사용자 삭제
                await supabase.auth.admin.deleteUser(authData.user.id);
                results.failed.push({
                  ...student,
                  error: profileError.message
                });
                continue;
              }

              results.success.push({
                ...student,
                user_id: authData.user.id
              });
            } catch (error) {
              results.failed.push({
                ...student,
                error: error.message
              });
            }
          }

          res.json({
            message: `Batch registration completed: ${results.success.length} success, ${results.failed.length} failed`,
            results
          });
        } catch (error) {
          next(error);
        }
      })
      .on('error', (error) => {
        fs.unlinkSync(req.file.path);
        next(error);
      });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// 학생 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 교사/관리자만 가능
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, class_name')
      .eq('id', user.id)
      .single();

    if (!['teacher', 'admin'].includes(profile?.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    // 학급 필터 (교사가 특정 학급만 조회)
    if (profile.role === 'teacher' && profile.class_name) {
      query = query.eq('class_name', profile.class_name);
    }

    const { data, error } = await query.order('student_id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// CSV 템플릿 다운로드
router.get('/template', (req, res) => {
  const template = `student_id,name,email,school,class_name
2024001,홍길동,student1@example.com,고등학교,1학년 1반
2024002,김철수,student2@example.com,고등학교,1학년 1반
`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=students_template.csv');
  res.send('\ufeff' + template); // UTF-8 BOM 추가
});

module.exports = router;

