import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, X } from 'lucide-react';
import './Clock.css';

interface ClockProps {
  onBack: () => void;
}

interface ProgressData {
  yesterday: number;
  today: number;
  streak: number;
  dailyGoal: number;
}

const Clock: React.FC<ClockProps> = ({ onBack }) => {
  const [duration, setDuration] = useState<number>(105);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [skipBreaks, setSkipBreaks] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(true);
  const [progress, setProgress] = useState<ProgressData>({
    yesterday: 0,
    today: 0,
    streak: 0,
    dailyGoal: 60
  });

  // Load progress from localStorage
  useEffect(() => {
    const loadProgress = () => {
      try {
        const savedData = localStorage.getItem('focus-progress');
        if (savedData) {
          const data = JSON.parse(savedData);
          const today = new Date().toDateString();
          
          if (data.lastDate === today) {
            setProgress(data.progress);
          } else {
            setProgress({
              yesterday: data.progress.today,
              today: 0,
              streak: data.progress.today >= data.progress.dailyGoal ? data.progress.streak + 1 : 0,
              dailyGoal: data.progress.dailyGoal
            });
          }
        }
      } catch (error) {
        console.log('No saved progress');
      }
    };
    loadProgress();
  }, []);

  // Save progress
  const saveProgress = (newProgress: ProgressData) => {
    const data = {
      progress: newProgress,
      lastDate: new Date().toDateString()
    };
    localStorage.setItem('focus-progress', JSON.stringify(data));
  };

  // Timer countdown
  useEffect(() => {
    let interval: number;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    const minutesCompleted = Math.floor(duration);
    const newProgress = {
      ...progress,
      today: progress.today + minutesCompleted
    };
    setProgress(newProgress);
    saveProgress(newProgress);
    
    // Vibrate on completion (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    alert(`Focus session completed! 🎉\nYou focused for ${duration} minutes.`);
    setShowSetup(true);
  };

  const startSession = () => {
    setTimeLeft(duration * 60);
    setShowSetup(false);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (window.confirm('End current session? Progress will be saved.')) {
      if (timeLeft < duration * 60) {
        const minutesCompleted = Math.floor((duration * 60 - timeLeft) / 60);
        const newProgress = {
          ...progress,
          today: progress.today + minutesCompleted
        };
        setProgress(newProgress);
        saveProgress(newProgress);
      }
      setShowSetup(true);
      setIsRunning(false);
      setTimeLeft(0);
    }
  };

  const adjustDuration = (change: number) => {
    const newDuration = Math.max(5, Math.min(240, duration + change));
    setDuration(newDuration);
  };

  const calculateBreaks = (mins: number): number => {
    return Math.floor(mins / 45);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!duration) return 0;
    return ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  };

  const getDailyProgress = (): number => {
    return Math.min(100, (progress.today / progress.dailyGoal) * 100);
  };

  return (
    <div className="clock-container">
      <div className="clock-header">
        <button onClick={onBack} className="back-button-clock">
          <X size={20} />
          <span>Home</span>
        </button>
      </div>

      <div className="clock-content">
        {showSetup ? (
          <div className="setup-view">
            {/* Setup Section */}
            <div className="setup-section">
              <h2 className="setup-title">Get ready to focus</h2>
              <p className="setup-subtitle">
                We'll turn off notifications during each session. For longer sessions, we'll add short breaks.
              </p>

              <div className="duration-selector">
                <div className="duration-display">
                  <div className="duration-number">{duration}</div>
                  <div className="duration-label">minutes</div>
                </div>
                <div className="duration-controls">
                  <button onClick={() => adjustDuration(5)} className="duration-btn" aria-label="Increase duration">
                    <ChevronUp size={20} />
                  </button>
                  <button onClick={() => adjustDuration(-5)} className="duration-btn" aria-label="Decrease duration">
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>

              <div className="breaks-info">
                <p>Breaks: {calculateBreaks(duration)}</p>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={skipBreaks}
                    onChange={(e) => setSkipBreaks(e.target.checked)}
                    aria-label="Skip breaks"
                  />
                  <span>Skip breaks</span>
                </label>
              </div>

              <button onClick={startSession} className="start-btn" aria-label="Start focus session">
                <Play size={18} />
                Start focus session
              </button>
            </div>

            {/* Daily Progress */}
            <div className="progress-section">
              <h3 className="progress-title">Daily Progress</h3>
              
              <div className="progress-stats">
                <div className="stat-item">
                  <div className="stat-label">Yesterday</div>
                  <div className="stat-value">{progress.yesterday}</div>
                  <div className="stat-unit">min</div>
                </div>

                <div className="stat-item-main">
                  <div className="progress-circle-container">
                    <svg className="progress-circle" viewBox="0 0 100 100">
                      <circle
                        className="progress-circle-bg"
                        cx="50"
                        cy="50"
                        r="45"
                      />
                      <circle
                        className="progress-circle-fill"
                        cx="50"
                        cy="50"
                        r="45"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getDailyProgress() / 100)}`}
                      />
                    </svg>
                    <div className="progress-center">
                      <div className="stat-label-large">Daily goal</div>
                      <div className="stat-value-large">{Math.floor(progress.dailyGoal / 60)}</div>
                      <div className="stat-unit-large">hour{progress.dailyGoal >= 120 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">Streak</div>
                  <div className="stat-value">{progress.streak}</div>
                  <div className="stat-unit">days</div>
                </div>
              </div>

              <div className="progress-completed">
                Completed today: {progress.today} minutes
              </div>
            </div>
          </div>
        ) : (
          <div className="session-view">
            <div className="session-header">
              <h3 className="session-title">Focus Session</h3>
              <div className="session-duration">
                {duration} min • {calculateBreaks(duration)} break{calculateBreaks(duration) !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Timer Display */}
            <div className="timer-display">
              <svg className="timer-ring" viewBox="0 0 100 100">
                <circle
                  className="timer-ring-bg"
                  cx="50"
                  cy="50"
                  r="45"
                />
                <circle
                  className="timer-ring-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                />
              </svg>
              <div className="timer-text">{formatTime(timeLeft)}</div>
              <div className="timer-status">
                {isRunning ? 'Focusing...' : 'Paused'}
              </div>
            </div>

            <div className="session-controls">
              <button 
                onClick={toggleTimer} 
                className={`control-btn ${isRunning ? 'control-btn-pause' : 'control-btn-play'}`}
                aria-label={isRunning ? 'Pause session' : 'Resume session'}
              >
                {isRunning ? (
                  <>
                    <Pause size={20} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Resume</span>
                  </>
                )}
              </button>
              <button 
                onClick={resetTimer} 
                className="control-btn control-btn-end"
                aria-label="End session"
              >
                <RotateCcw size={20} />
                <span>End Session</span>
              </button>
            </div>

            <div className="session-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <div className="progress-label">
                {Math.round(getProgress())}% complete
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;