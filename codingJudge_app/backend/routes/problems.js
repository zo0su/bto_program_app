const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// 모든 문제 조회
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 특정 문제 조회
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (problemError) throw problemError;

    // 테스트 케이스 조회
    const { data: testCases, error: testCasesError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('problem_id', id)
      .order('order_index', { ascending: true });

    if (testCasesError) throw testCasesError;

    res.json({
      ...problem,
      test_cases: testCases
    });
  } catch (error) {
    next(error);
  }
});

// 문제 생성 (교사/관리자만)
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

    // 사용자 역할 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['teacher', 'admin'].includes(profile?.role)) {
      return res.status(403).json({ error: 'Forbidden: Only teachers and admins can create problems' });
    }

    const {
      title,
      description,
      input_format,
      output_format,
      example_input,
      example_output,
      time_limit,
      memory_limit,
      test_cases
    } = req.body;

    // 문제 생성
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .insert({
        title,
        description,
        input_format,
        output_format,
        example_input,
        example_output,
        time_limit: time_limit || 1000,
        memory_limit: memory_limit || 256,
        created_by: user.id
      })
      .select()
      .single();

    if (problemError) throw problemError;

    // 테스트 케이스 추가
    if (test_cases && test_cases.length > 0) {
      const testCasesData = test_cases.map((tc, index) => ({
        problem_id: problem.id,
        input_data: tc.input_data,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false,
        order_index: index
      }));

      const { error: testCasesError } = await supabase
        .from('test_cases')
        .insert(testCasesData);

      if (testCasesError) throw testCasesError;
    }

    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
});

// 문제 수정
router.put('/:id', async (req, res, next) => {
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
    const updateData = req.body;
    delete updateData.id; // id는 수정 불가
    delete updateData.created_at; // created_at은 수정 불가

    const { data, error } = await supabase
      .from('problems')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 문제 삭제
router.delete('/:id', async (req, res, next) => {
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

    // is_active를 false로 변경 (실제 삭제 대신)
    const { error } = await supabase
      .from('problems')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

