import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import TypingSpeedGraph from '../components/TypingSpeedGraph';
import axios from 'axios';
import './ProblemSolving.css';

/**
 * 문제 풀이 페이지 (학생용)
 * - 코드 에디터
 * - 타이핑 속도 그래프
 * - 실행/제출 기능
 */
const ProblemSolving = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [typingEvents, setTypingEvents] = useState([]);
  const [cheatingWarnings, setCheatingWarnings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    try {
      const response = await axios.get(`/api/problems/${id}`);
      setProblem(response.data);
    } catch (error) {
      console.error('Failed to load problem:', error);
      alert('문제를 불러오는데 실패했습니다.');
    }
  };

  const handleTypingEvent = async (event) => {
    // 타이핑 이벤트 저장
    setTypingEvents(prev => [...prev, event]);

    // 서버에 타이핑 로그 전송
    try {
      await axios.post('/api/submissions/typing-logs', {
        problem_id: id,
        keystrokes_per_second: event.keystrokesPerSecond,
        code_length: event.codeLength,
        time_elapsed: event.timeElapsed
      });
    } catch (error) {
      console.error('Failed to save typing log:', error);
    }
  };

  const handleCheatingDetected = (warning) => {
    setCheatingWarnings(prev => [...prev, {
      ...warning,
      timestamp: Date.now()
    }]);
    
    // 심각한 치팅 의심 시 알림
    if (warning.type === 'high_speed') {
      alert('⚠️ 치팅 의심: 타이핑 속도가 비정상적으로 빠릅니다. 붙여넣기를 사용하지 않았는지 확인해주세요.');
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      alert('코드를 입력해주세요.');
      return;
    }

    try {
      setOutput('실행 중...');
      
      const response = await axios.post('/api/judge/run', {
        code,
        language: 'python',
        input_data: problem?.example_input || ''
      });

      if (response.data.status === 'accepted') {
        setOutput(response.data.output || '(출력 없음)');
      } else {
        setOutput(`오류: ${response.data.error || response.data.message}`);
      }
    } catch (error) {
      console.error('Failed to run code:', error);
      setOutput(`실행 실패: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('코드를 입력해주세요.');
      return;
    }

    if (!confirm('제출하시겠습니까? 제출 후에는 수정할 수 없습니다.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 제출 생성
      const submitResponse = await axios.post('/api/submissions', {
        problem_id: id,
        code,
        language: 'python'
      });

      // 채점 실행
      const judgeResponse = await axios.post(`/api/judge/judge/${submitResponse.data.id}`);
      
      setSubmissionResult({
        passed: judgeResponse.data.passed,
        total: judgeResponse.data.total,
        score: judgeResponse.data.score,
        status: judgeResponse.data.submission.status
      });

      alert(
        `제출 완료!\n` +
        `통과: ${judgeResponse.data.passed}/${judgeResponse.data.total}\n` +
        `점수: ${judgeResponse.data.score}점`
      );
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('제출 실패: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return <div className="loading">문제를 불러오는 중...</div>;
  }

  return (
    <div className="problem-solving-container">
      <div className="problem-solving-header">
        <h1>{problem.title}</h1>
        <div className="problem-meta">
          <span>시간 제한: {problem.time_limit}ms</span>
          <span>메모리 제한: {problem.memory_limit}MB</span>
        </div>
      </div>

      <div className="problem-solving-layout">
        <div className="problem-section">
          <div className="problem-description">
            <h2>문제 설명</h2>
            <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br/>') }} />
          </div>

          {problem.example_input && (
            <div className="problem-examples">
              <h3>예제 입력</h3>
              <pre>{problem.example_input}</pre>
              
              {problem.example_output && (
                <>
                  <h3>예제 출력</h3>
                  <pre>{problem.example_output}</pre>
                </>
              )}
            </div>
          )}

          <div className="code-editor-section">
            <h2>코드 작성</h2>
            <CodeEditor
              value={code}
              onChange={setCode}
              onTypingEvent={handleTypingEvent}
              language="python"
              placeholder="코드를 입력하세요..."
            />
            
            <div className="editor-actions">
              <button onClick={handleRunCode} className="btn-run">
                실행
              </button>
              <button 
                onClick={handleSubmit} 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? '제출 중...' : '제출'}
              </button>
            </div>

            {output && (
              <div className="output-section">
                <h3>실행 결과</h3>
                <pre className="output-content">{output}</pre>
              </div>
            )}

            {submissionResult && (
              <div className={`submission-result ${submissionResult.status}`}>
                <h3>제출 결과</h3>
                <p>통과: {submissionResult.passed}/{submissionResult.total}</p>
                <p>점수: {submissionResult.score}점</p>
                <p>상태: {
                  submissionResult.status === 'accepted' ? '✅ 정답' :
                  submissionResult.status === 'wrong_answer' ? '❌ 오답' :
                  submissionResult.status === 'time_limit' ? '⏱ 시간 초과' :
                  submissionResult.status === 'runtime_error' ? '💥 실행 오류' :
                  submissionResult.status === 'compile_error' ? '🔧 컴파일 오류' :
                  '❓ 기타'
                }</p>
              </div>
            )}
          </div>
        </div>

        <div className="monitoring-section">
          <h2>타이핑 속도 모니터링</h2>
          <TypingSpeedGraph
            typingEvents={typingEvents}
            onCheatingDetected={handleCheatingDetected}
          />

          {cheatingWarnings.length > 0 && (
            <div className="cheating-warnings">
              <h3>경고 기록</h3>
              <ul>
                {cheatingWarnings.slice(-5).map((warning, index) => (
                  <li key={index}>
                    {new Date(warning.timestamp).toLocaleTimeString()}: {warning.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSolving;

