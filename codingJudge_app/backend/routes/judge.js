const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const { supabase } = require('../config/supabase');

// Docker 클라이언트 초기화
const docker = new Docker();

/**
 * 코드 실행 및 채점 (Docker 기반)
 */
router.post('/run', async (req, res, next) => {
  try {
    const { code, language = 'python', input_data, time_limit = 1000 } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Docker 컨테이너에서 코드 실행
    const result = await runCodeInDocker(code, language, input_data, time_limit);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 제출된 코드 채점
 */
router.post('/judge/:submission_id', async (req, res, next) => {
  try {
    const { submission_id } = req.params;

    // 제출 정보 조회
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('*, problems(*)')
      .eq('id', submission_id)
      .single();

    if (subError) throw subError;

    // 테스트 케이스 조회
    const { data: testCases, error: testCasesError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('problem_id', submission.problem_id)
      .order('order_index', { ascending: true });

    if (testCasesError) throw testCasesError;

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases found for this problem' });
    }

    // 제출 상태 업데이트 (running)
    await supabase
      .from('submissions')
      .update({ status: 'running' })
      .eq('id', submission_id);

    // 각 테스트 케이스 실행
    let passedCount = 0;
    let totalScore = 0;
    let errorMessage = null;
    let executionTime = 0;

    for (const testCase of testCases) {
      try {
        const result = await runCodeInDocker(
          submission.code,
          submission.language,
          testCase.input_data,
          submission.problems.time_limit || 1000
        );

        executionTime = Math.max(executionTime, result.execution_time || 0);

        if (result.status === 'accepted') {
          // 출력 비교 (공백, 줄바꿈 무시하고 비교)
          const normalizedOutput = normalizeOutput(result.output);
          const normalizedExpected = normalizeOutput(testCase.expected_output);

          if (normalizedOutput === normalizedExpected) {
            passedCount++;
            totalScore += Math.floor(100 / testCases.length); // 점수 분배
          } else {
            errorMessage = `Wrong Answer on test case ${testCase.order_index + 1}`;
            break;
          }
        } else {
          errorMessage = result.error || result.message || 'Runtime Error';
          break;
        }
      } catch (error) {
        errorMessage = error.message;
        break;
      }
    }

    // 최종 결과 업데이트
    const finalStatus = passedCount === testCases.length ? 'accepted' : 
                       errorMessage?.includes('Time') ? 'time_limit' :
                       errorMessage?.includes('compile') ? 'compile_error' : 'wrong_answer';

    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update({
        status: finalStatus,
        score: totalScore,
        execution_time: executionTime,
        error_message: errorMessage
      })
      .eq('id', submission_id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      submission: updatedSubmission,
      passed: passedCount,
      total: testCases.length,
      score: totalScore
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Docker 컨테이너에서 코드 실행
 */
async function runCodeInDocker(code, language, input_data, timeLimit) {
  return new Promise((resolve, reject) => {
    const containerName = `judge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 언어별 Docker 이미지 및 명령어 설정
    const languageConfig = {
      python: {
        image: 'python:3.11-slim',
        command: ['python', '-c', code],
        workdir: '/app'
      },
      javascript: {
        image: 'node:18-slim',
        command: ['node', '-e', code],
        workdir: '/app'
      }
    };

    const config = languageConfig[language] || languageConfig.python;

    // Docker 컨테이너 생성 및 실행
    docker.createContainer({
      Image: config.image,
      Cmd: config.command,
      WorkingDir: config.workdir,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      OpenStdin: true,
      StdinOnce: true,
      Memory: 256 * 1024 * 1024, // 256MB
      MemorySwap: 256 * 1024 * 1024,
      CpuPeriod: 100000,
      CpuQuota: 100000, // 1 CPU
      NetworkDisabled: true, // 네트워크 비활성화 (보안)
      HostConfig: {
        AutoRemove: true,
        NetworkMode: 'none'
      }
    }, (err, container) => {
      if (err) {
        return reject(new Error(`Container creation failed: ${err.message}`));
      }

      const startTime = Date.now();

      // 컨테이너 시작
      container.start((err) => {
        if (err) {
          return reject(new Error(`Container start failed: ${err.message}`));
        }

        // 입력 데이터 전송
        if (input_data) {
          container.attach({ stream: true, stdin: true, stdout: true, stderr: true }, (err, stream) => {
            if (err) {
              return reject(new Error(`Container attach failed: ${err.message}`));
            }

            stream.write(input_data);
            stream.end();
          });
        }

        // 실행 결과 수집
        container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
          if (err) {
            return reject(new Error(`Container attach failed: ${err.message}`));
          }

          let stdout = '';
          let stderr = '';

          stream.on('data', (chunk) => {
            stdout += chunk.toString();
          });

          stream.on('error', (chunk) => {
            stderr += chunk.toString();
          });

          // 타임아웃 설정
          const timeout = setTimeout(() => {
            container.stop((err) => {
              if (err) console.error('Container stop error:', err);
            });
            resolve({
              status: 'time_limit',
              output: stdout,
              error: 'Time Limit Exceeded',
              execution_time: timeLimit
            });
          }, timeLimit);

          // 컨테이너 종료 대기
          container.wait((err, data) => {
            clearTimeout(timeout);
            const executionTime = Date.now() - startTime;

            if (err) {
              return reject(new Error(`Container wait failed: ${err.message}`));
            }

            if (data.StatusCode !== 0) {
              return resolve({
                status: 'runtime_error',
                output: stdout,
                error: stderr || `Exit code: ${data.StatusCode}`,
                execution_time: executionTime
              });
            }

            resolve({
              status: 'accepted',
              output: stdout,
              error: stderr || null,
              execution_time: executionTime
            });
          });
        });
      });
    });
  });
}

/**
 * 출력 정규화 (공백, 줄바꿈 제거)
 */
function normalizeOutput(output) {
  return (output || '')
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}

module.exports = router;

