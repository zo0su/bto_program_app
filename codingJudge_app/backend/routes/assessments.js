const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { calculateAssessmentResult } = require('../utils/gradeCalculator');

// 수행평가 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      token ? token.replace('Bearer ', '') : ''
    );

    let query = supabase.from('assessments').select('*');

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'teacher') {
        // 교사는 자신이 만든 평가만 조회
        query = query.eq('teacher_id', user.id);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 수행평가 생성
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

    // 교사/관리자만 가능
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['teacher', 'admin'].includes(profile?.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      title,
      description,
      start_time,
      end_time,
      max_score = 100,
      problem_ids
    } = req.body;

    // 수행평가 생성
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        title,
        description,
        teacher_id: user.id,
        start_time,
        end_time,
        max_score
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // 문제 연결
    if (problem_ids && problem_ids.length > 0) {
      const assessmentProblems = problem_ids.map((problemId, index) => ({
        assessment_id: assessment.id,
        problem_id: problemId,
        order_index: index
      }));

      const { error: problemsError } = await supabase
        .from('assessment_problems')
        .insert(assessmentProblems);

      if (problemsError) throw problemsError;
    }

    res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
});

// 수행평가 결과 계산 및 등급 부여
router.post('/:id/calculate-results', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.params;

    // 수행평가 정보 조회
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, assessment_problems(*, problems(*))')
      .eq('id', id)
      .single();

    if (assessmentError) throw assessmentError;

    // 모든 학생의 제출 결과 조회
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*, student_id, problem_id, score')
      .eq('assessment_id', id)
      .in('status', ['accepted']);

    if (submissionsError) throw submissionsError;

    // 학생별 총점 계산
    const studentScores = {};
    submissions.forEach(sub => {
      if (!studentScores[sub.student_id]) {
        studentScores[sub.student_id] = 0;
      }
      studentScores[sub.student_id] += sub.score || 0;
    });

    // 수행평가 결과 저장
    const results = [];
    for (const [studentId, totalScore] of Object.entries(studentScores)) {
      const { finalScore, grade } = calculateAssessmentResult(totalScore);

      const { data: existingResult } = await supabase
        .from('assessment_results')
        .select('id')
        .eq('assessment_id', id)
        .eq('student_id', studentId)
        .single();

      if (existingResult) {
        // 기존 결과 업데이트
        const { error } = await supabase
          .from('assessment_results')
          .update({
            total_score: totalScore,
            grade,
            final_score: finalScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResult.id);

        if (error) throw error;
      } else {
        // 새 결과 생성
        const { data: newResult, error } = await supabase
          .from('assessment_results')
          .insert({
            assessment_id: id,
            student_id: studentId,
            total_score: totalScore,
            grade,
            final_score: finalScore,
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        results.push(newResult);
      }
    }

    res.json({
      message: 'Results calculated successfully',
      results_count: Object.keys(studentScores).length
    });
  } catch (error) {
    next(error);
  }
});

// 수행평가 결과 조회
router.get('/:id/results', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.params;

    let query = supabase
      .from('assessment_results')
      .select('*, profiles(name, student_id, class_name)')
      .eq('assessment_id', id);

    // 학생은 자신의 결과만 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'student') {
      query = query.eq('student_id', user.id);
    }

    const { data, error } = await query.order('final_score', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

