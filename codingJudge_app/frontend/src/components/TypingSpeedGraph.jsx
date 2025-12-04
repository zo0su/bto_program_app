import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './TypingSpeedGraph.css';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * 실시간 타이핑 속도 그래프 컴포넌트
 * - 키 입력 속도를 실시간으로 시각화
 * - 치팅 의심 패턴 감지 및 경고
 */
const TypingSpeedGraph = ({ typingEvents = [], onCheatingDetected }) => {
  const chartRef = useRef(null);
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: '타이핑 속도 (초당 키 입력)',
        data: [],
        borderColor: 'rgb(79, 209, 197)',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  });
  
  const [warningMessage, setWarningMessage] = useState(null);
  
  // 치팅 감지 임계값 설정
  const CHEATING_THRESHOLD = {
    MAX_KEYSTROKES_PER_SEC: 30, // 초당 30타 이상
    SUDDEN_SPIKE: 50, // 급격한 증가
    MIN_INTERVAL: 50 // 최소 입력 간격 (ms)
  };

  useEffect(() => {
    if (typingEvents.length === 0) return;

    const latestEvents = typingEvents.slice(-30); // 최근 30개 이벤트만 표시
    const labels = latestEvents.map((_, index) => {
      const time = new Date(typingEvents[typingEvents.length - 30 + index]?.timestamp || Date.now());
      return time.toLocaleTimeString('ko-KR');
    });
    
    const speeds = latestEvents.map(event => event.keystrokesPerSecond || 0);

    setData({
      labels,
      datasets: [
        {
          ...data.datasets[0],
          data: speeds
        }
      ]
    });

    // 치팅 감지 로직
    detectCheating(latestEvents);
  }, [typingEvents]);

  const detectCheating = (events) => {
    if (events.length < 2) return;

    const lastEvent = events[events.length - 1];
    const prevEvent = events[events.length - 2];

    // 1. 초당 키 입력 횟수 임계값 초과
    if (lastEvent.keystrokesPerSecond > CHEATING_THRESHOLD.MAX_KEYSTROKES_PER_SEC) {
      setWarningMessage({
        type: 'danger',
        message: '⚠️ 치팅 의심: 타이핑 속도가 비정상적으로 빠릅니다. 붙여넣기를 사용하셨나요?'
      });
      
      if (onCheatingDetected) {
        onCheatingDetected({
          type: 'high_speed',
          value: lastEvent.keystrokesPerSecond,
          threshold: CHEATING_THRESHOLD.MAX_KEYSTROKES_PER_SEC
        });
      }
      return;
    }

    // 2. 급격한 속도 증가 (갑자기 빠르게 입력)
    if (
      lastEvent.keystrokesPerSecond - prevEvent.keystrokesPerSecond > 
      CHEATING_THRESHOLD.SUDDEN_SPIKE
    ) {
      setWarningMessage({
        type: 'warning',
        message: '⚠️ 주의: 타이핑 속도가 급격히 증가했습니다.'
      });
      
      if (onCheatingDetected) {
        onCheatingDetected({
          type: 'sudden_spike',
          current: lastEvent.keystrokesPerSecond,
          previous: prevEvent.keystrokesPerSecond
        });
      }
      return;
    }

    // 3. 입력 간격이 너무 짧음 (붙여넣기 의심)
    if (lastEvent.timeElapsed < CHEATING_THRESHOLD.MIN_INTERVAL && lastEvent.timeElapsed > 0) {
      setWarningMessage({
        type: 'warning',
        message: '⚠️ 주의: 입력 간격이 비정상적으로 짧습니다.'
      });
      
      if (onCheatingDetected) {
        onCheatingDetected({
          type: 'short_interval',
          interval: lastEvent.timeElapsed
        });
      }
      return;
    }

    // 정상적인 경우 경고 해제
    if (warningMessage) {
      setWarningMessage(null);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#f5f7fb',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: '실시간 타이핑 속도 그래프',
        color: '#f5f7fb',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#f5f7fb',
        bodyColor: '#f5f7fb',
        borderColor: 'rgba(79, 209, 197, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#858585',
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#858585',
          stepSize: 5
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        title: {
          display: true,
          text: '초당 키 입력 수',
          color: '#858585'
        }
      }
    }
  };

  return (
    <div className="typing-speed-graph-container">
      <div className="graph-wrapper">
        {typingEvents.length > 0 ? (
          <Line ref={chartRef} data={data} options={chartOptions} />
        ) : (
          <div className="graph-empty">
            <p>타이핑을 시작하면 그래프가 표시됩니다.</p>
          </div>
        )}
      </div>
      
      {warningMessage && (
        <div className={`cheating-warning ${warningMessage.type}`}>
          <strong>{warningMessage.message}</strong>
        </div>
      )}
      
      <div className="graph-info">
        <small>
          💡 이 그래프는 타이핑 속도를 모니터링하여 치팅을 감지합니다.
          <br />
          일반적인 타이핑 속도: 초당 5-15타
        </small>
      </div>
    </div>
  );
};

export default TypingSpeedGraph;

