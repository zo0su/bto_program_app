const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// 회원가입
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role, studentId, school, className } = req.body;

    // Supabase Auth로 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // 프로필 생성
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: role || 'student',
        student_id: studentId || null,
        school: school || null,
        class_name: className || null
      });

    if (profileError) {
      // 프로필 생성 실패 시 사용자 삭제
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email,
        name,
        role: role || 'student'
      }
    });
  } catch (error) {
    next(error);
  }
});

// 로그인 (클라이언트에서 직접 Supabase Auth 사용 권장)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    res.json({
      user: data.user,
      profile,
      session: data.session
    });
  } catch (error) {
    next(error);
  }
});

// 현재 사용자 정보 조회
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    res.json({ user, profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

