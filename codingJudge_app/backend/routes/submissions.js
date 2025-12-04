const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// 제출 조회
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

    const { problem_id, assessment_id, student_id } = req.query;
    let query = supabase.from('submissions').select('*');

    // 역할에 따라 필터링
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'student') {
      // 학생은 자신의 제출만 조회
      query = query.eq('student_id', user.id);
    } else if (student_id) {
      // 교사는 특정 학생의 제출 조회 가능
      query = query.eq('student_id', student_id);
    }

    if (problem_id) query = query.eq('problem_id', problem_id);
    if (assessment_id) query = query.eq('assessment_id', assessment_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 제출 생성
router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 학생만 제출 가능
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit code' });
    }

    const {
      problem_id,
      assessment_id,
      code,
      language = 'python'
    } = req.body;

    // 제출 생성 (채점은 비동기로 처리)
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        student_id: user.id,
        problem_id,
        assessment_id: assessment_id || null,
        code,
        language,
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // 채점 큐에 추가 (저지 엔진에서 처리)
    // TODO: 저지 엔진 연동

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

// 타이핑 로그 저장
router.post('/typing-logs', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      problem_id,
      keystrokes_per_second,
      code_length,
      time_elapsed
    } = req.body;

    const { error } = await supabase
      .from('typing_logs')
      .insert({
        student_id: user.id,
        problem_id,
        keystrokes_per_second,
        code_length,
        time_elapsed
      });

    if (error) throw error;
    res.json({ message: 'Typing log saved' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

