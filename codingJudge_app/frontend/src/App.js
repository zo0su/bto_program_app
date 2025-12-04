import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast';
import ProblemSolving from './pages/ProblemSolving';
import './App.css';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/problem/:id" element={<ProblemSolving />} />
          <Route path="/" element={<Navigate to="/problem/demo" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

