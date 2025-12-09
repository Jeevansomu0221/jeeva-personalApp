import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import './Clock.css';

interface ClockProps {
  onBack: () => void;
}

interface TimeSession {
  id: string;
  name: string;
  duration: number; // in seconds
  color: string;
}

const Clock: React.FC<ClockProps> = ({ onBack }) => {
  const sessions: TimeSession[] = [
    { id: 'study', name: 'Study Time', duration: 3600, color: '#2563eb' }, // 1 hour
    { id: 'break', name: 'Break Time', duration: 300, color: '#16a34a' }, // 5 min
    { id: 'deep-work', name: 'Deep Work', duration: 5400, color: '#9333ea' }, // 1.5 hours
    { id: 'short-break', name: 'Short Break', duration: 180, color: '#0d9488' }, // 3 min
    { id: 'pomodoro', name: 'Pomodoro', duration: 1500, color: '#dc2626' }, // 25 min
    { id: 'exercise', name: 'Exercise', duration: 1800, color: '#ea580c' }, // 30 min
  ];

  const [selectedSession, setSelectedSession] = useState<TimeSession | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Display current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: number;

if (isRunning && timeLeft > 0) {
  interval = window.setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        alert(`${selectedSession?.name} completed! ✅`);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}

return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedSession]);

  const selectSession = (session: TimeSession) => {
    setSelectedSession(session);
    setTimeLeft(session.duration);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    if (selectedSession) {
      setTimeLeft(selectedSession.duration);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!selectedSession) return 0;
    return ((selectedSession.duration - timeLeft) / selectedSession.duration) * 100;
  };

  return (
    <div className="feature-container">
      <button onClick={onBack} className="back-button">
        ← Back to Home
      </button>

      <div className="feature-content">
        <h2 className="feature-title">Clock</h2>

        {/* Current Time Display */}
        <div className="current-time-display">
          <div className="time-text">{currentTime}</div>
          <div className="date-text">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>

        {/* Session Selection */}
        {!selectedSession && (
          <div className="sessions-grid">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => selectSession(session)}
                className="session-card"
                style={{ backgroundColor: session.color }}
              >
                <div className="session-name">{session.name}</div>
                <div className="session-duration">{formatTime(session.duration)}</div>
              </button>
            ))}
          </div>
        )}

        {/* Active Timer */}
        {selectedSession && (
          <div className="timer-container">
            <div className="timer-header">
              <h3 style={{ color: selectedSession.color }}>{selectedSession.name}</h3>
            </div>

            <div className="timer-display">
              <svg className="progress-ring" width="280" height="280">
                <circle
                  className="progress-ring-bg"
                  cx="140"
                  cy="140"
                  r="120"
                />
                <circle
                  className="progress-ring-circle"
                  cx="140"
                  cy="140"
                  r="120"
                  stroke={selectedSession.color}
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
                />
              </svg>
              <div className="timer-text">{formatTime(timeLeft)}</div>
            </div>

            <div className="timer-controls">
              <button onClick={toggleTimer} className="control-btn" style={{ backgroundColor: selectedSession.color }}>
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={resetTimer} className="control-btn secondary">
                <RotateCcw size={24} />
              </button>
              <button onClick={() => setSelectedSession(null)} className="control-btn secondary">
                Change Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;