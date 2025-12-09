import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flag, Save } from 'lucide-react';
import './Stopwatch.css';

interface StopwatchProps {
  onBack: () => void;
}

interface Lap {
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

interface SavedSession {
  id: string;
  name: string;
  totalTime: number;
  laps: Lap[];
  date: Date;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onBack }) => {
  const [time, setTime] = useState<number>(0); // in milliseconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');

  // Load saved sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jeeva-stopwatch-sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedSessions(parsed.map((s: any) => ({ ...s, date: new Date(s.date) })));
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (savedSessions.length > 0) {
      localStorage.setItem('jeeva-stopwatch-sessions', JSON.stringify(savedSessions));
    }
  }, [savedSessions]);

  // Stopwatch timer
  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10); // Update every 10ms
      }, 10);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleStopwatch = () => {
    setIsRunning(!isRunning);
  };

  const resetStopwatch = () => {
    setTime(0);
    setIsRunning(false);
    setLaps([]);
  };

  const recordLap = () => {
    if (time === 0) return;

    const previousTotalTime = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
    const lapTime = time - previousTotalTime;

    const newLap: Lap = {
      lapNumber: laps.length + 1,
      lapTime: lapTime,
      totalTime: time
    };

    setLaps([...laps, newLap]);
  };

  const saveSession = () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    const session: SavedSession = {
      id: Date.now().toString(),
      name: sessionName,
      totalTime: time,
      laps: laps,
      date: new Date()
    };

    setSavedSessions([session, ...savedSessions]);
    setShowSaveDialog(false);
    setSessionName('');
    alert('Session saved successfully! 💾');
  };

  const loadSession = (session: SavedSession) => {
    setTime(session.totalTime);
    setLaps(session.laps);
    setIsRunning(false);
  };

  const deleteSession = (id: string) => {
    setSavedSessions(savedSessions.filter(s => s.id !== id));
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getFastestLap = (): Lap | null => {
    if (laps.length === 0) return null;
    return laps.reduce((fastest, lap) => 
      lap.lapTime < fastest.lapTime ? lap : fastest
    );
  };

  const getSlowestLap = (): Lap | null => {
    if (laps.length === 0) return null;
    return laps.reduce((slowest, lap) => 
      lap.lapTime > slowest.lapTime ? lap : slowest
    );
  };

  const getAverageLapTime = (): number => {
    if (laps.length === 0) return 0;
    const total = laps.reduce((sum, lap) => sum + lap.lapTime, 0);
    return total / laps.length;
  };

  const fastestLap = getFastestLap();
  const slowestLap = getSlowestLap();

  return (
    <div className="feature-container">
      <button onClick={onBack} className="back-button">
        ← Back to Home
      </button>

      <div className="feature-content">
        <h2 className="feature-title">Stopwatch</h2>

        {/* Main Stopwatch Display */}
        <div className="stopwatch-display">
          <div className="stopwatch-time">{formatTime(time)}</div>
          
          <div className="stopwatch-controls">
            <button 
              onClick={toggleStopwatch} 
              className={`control-btn ${isRunning ? 'pause' : 'play'}`}
            >
              {isRunning ? <Pause size={32} /> : <Play size={32} />}
            </button>

            {time > 0 && (
              <>
                <button onClick={resetStopwatch} className="control-btn reset">
                  <RotateCcw size={28} />
                </button>
                <button onClick={recordLap} className="control-btn lap">
                  <Flag size={28} />
                  Lap
                </button>
                <button 
                  onClick={() => setShowSaveDialog(true)} 
                  className="control-btn save"
                  disabled={isRunning}
                >
                  <Save size={28} />
                  Save
                </button>
              </>
            )}
          </div>

          {/* Statistics */}
          {laps.length > 0 && (
            <div className="stopwatch-stats">
              <div className="stat-item">
                <div className="stat-label">Laps</div>
                <div className="stat-value">{laps.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Average</div>
                <div className="stat-value">{formatTime(getAverageLapTime())}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Fastest</div>
                <div className="stat-value fastest">{formatTime(fastestLap?.lapTime || 0)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Slowest</div>
                <div className="stat-value slowest">{formatTime(slowestLap?.lapTime || 0)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Save Session Dialog */}
        {showSaveDialog && (
          <div className="save-dialog">
            <h3>Save Session</h3>
            <input
              type="text"
              placeholder="Enter session name (e.g., Morning Run)"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="session-name-input"
              autoFocus
            />
            <div className="dialog-actions">
              <button onClick={saveSession} className="dialog-save-btn">Save</button>
              <button onClick={() => setShowSaveDialog(false)} className="dialog-cancel-btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="laps-section">
            <h3>Laps ({laps.length})</h3>
            <div className="laps-list">
              {[...laps].reverse().map((lap) => (
                <div 
                  key={lap.lapNumber} 
                  className={`lap-item ${
                    fastestLap?.lapNumber === lap.lapNumber ? 'fastest' : 
                    slowestLap?.lapNumber === lap.lapNumber ? 'slowest' : ''
                  }`}
                >
                  <div className="lap-number">
                    <Flag size={16} />
                    Lap {lap.lapNumber}
                  </div>
                  <div className="lap-times">
                    <span className="lap-time">{formatTime(lap.lapTime)}</span>
                    <span className="lap-total">{formatTime(lap.totalTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Sessions */}
        {savedSessions.length > 0 && (
          <div className="saved-sessions-section">
            <h3>Saved Sessions ({savedSessions.length})</h3>
            <div className="sessions-list">
              {savedSessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-info">
                    <div className="session-name">{session.name}</div>
                    <div className="session-meta">
                      <span className="session-time">{formatTime(session.totalTime)}</span>
                      <span className="session-laps">{session.laps.length} laps</span>
                      <span className="session-date">
                        {session.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="session-actions">
                    <button 
                      onClick={() => loadSession(session)} 
                      className="load-btn"
                      title="Load session"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => deleteSession(session.id)} 
                      className="delete-session-btn"
                      title="Delete session"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {time === 0 && laps.length === 0 && savedSessions.length === 0 && (
          <div className="empty-state">
            <Play size={64} color="#4b5563" />
            <p>Press Play to start the stopwatch</p>
            <small>Use Lap button to record split times</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;