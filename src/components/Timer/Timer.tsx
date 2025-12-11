import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trophy, X, Trash2, Clock } from 'lucide-react';
import './Timer.css';

interface TimerProps {
  onBack: () => void;
}

interface Challenge {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  goal: 'higher' | 'lower'; // higher = longer is better, lower = faster is better
}

interface Record {
  challengeId: string;
  time: number; // in milliseconds
  date: Date;
}

const Timer: React.FC<TimerProps> = ({ onBack }) => {
  const initialChallenges: Challenge[] = [
    // Breath Holding - Higher is better
    { id: 'breath-hold', name: 'Breathing', category: 'Breath Hold', icon: '🫁', color: '#0ea5e9', goal: 'lower' },
    
    // Running - Lower is better
    { id: 'run-100m', name: '100m Sprint', category: 'Running', icon: '🏃', color: '#ea580c', goal: 'lower' },
    
    // More examples
    { id: 'plank', name: 'Plank Hold', category: 'Fitness', icon: '💪', color: '#16a34a', goal: 'higher' },
    { id: 'meditation', name: 'Meditation', category: 'Mindfulness', icon: '🧘‍♂️', color: '#a855f7', goal: 'higher' },
  ];

  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('⚡');
  const [customGoal, setCustomGoal] = useState<'higher' | 'lower'>('higher');

  const emojiList = ['⚡', '🚴', '🏋️', '🧘‍♀️', '🏊‍♀️', '🏃', '🚲', '🧗', '🤸', '🎯', '🌟', '💪', '🔥', '⭐', '🏆', '🫁', '🧠', '❤️', '🦵', '👁️'];

  // Load challenges and records from localStorage
  useEffect(() => {
    const savedChallenges = localStorage.getItem('timer-challenges');
    const savedRecords = localStorage.getItem('timer-records');
    
    if (savedChallenges) {
      try {
        const parsed = JSON.parse(savedChallenges);
        // Only use saved custom challenges, not the entire parsed array
        const savedCustomChallenges = parsed.filter((challenge: Challenge) => 
          challenge.id.startsWith('custom-')
        );
        setChallenges([...initialChallenges, ...savedCustomChallenges]);
      } catch (error) {
        console.error('Error parsing saved challenges:', error);
      }
    }

    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords);
        setRecords(parsed.map((r: any) => ({ ...r, date: new Date(r.date) })));
      } catch (error) {
        console.error('Error parsing saved records:', error);
      }
    }
  }, []);

  // Save custom challenges and records to localStorage
  useEffect(() => {
    const customChallenges = challenges.filter(c => c.id.startsWith('custom-'));
    if (customChallenges.length > 0) {
      localStorage.setItem('timer-challenges', JSON.stringify(customChallenges));
    }
    
    if (records.length > 0) {
      localStorage.setItem('timer-records', JSON.stringify(records));
    }
  }, [challenges, records]);

  // Timer logic
  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setTime(0);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const stopAndSave = () => {
    if (!selectedChallenge || time === 0) return;

    const newRecord: Record = {
      challengeId: selectedChallenge.id,
      time: time,
      date: new Date()
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    
    const bestTime = getBestTime(selectedChallenge.id);
    const isNewRecord = isBetterTime(time, bestTime, selectedChallenge.goal);

    if (isNewRecord) {
      alert(`🏆 NEW RECORD!\n${selectedChallenge.name}\nTime: ${formatTime(time)}`);
    } else {
      alert(`✅ Completed!\n${selectedChallenge.name}\nTime: ${formatTime(time)}\nBest: ${formatTime(bestTime || 0)}`);
    }

    resetTimer();
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
    setSelectedChallenge(null);
  };

  const addCustomChallenge = () => {
    if (!customName.trim()) {
      alert('Please enter a challenge name');
      return;
    }

    const customChallenge: Challenge = {
      id: `custom-${Date.now()}`,
      name: customName,
      category: 'Custom',
      icon: customEmoji,
      color: '#6366f1',
      goal: customGoal
    };

    setChallenges(prev => [...prev, customChallenge]);
    setShowCustomForm(false);
    setCustomName('');
    setCustomEmoji('⚡');
    setCustomGoal('higher');
    
    // Auto-start the custom challenge
    setTimeout(() => startTimer(customChallenge), 100);
  };

  const deleteChallenge = (challengeId: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      setChallenges(challenges.filter(c => c.id !== challengeId));
      setRecords(records.filter(r => r.challengeId !== challengeId));
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    
    if (totalSeconds >= 3600) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${totalSeconds.toFixed(2)}s`;
    }
  };

  const getBestTime = (challengeId: string): number | null => {
    const challengeRecords = records.filter(r => r.challengeId === challengeId);
    if (challengeRecords.length === 0) return null;
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    if (challenge.goal === 'higher') {
      // For breathing/plank: Higher time is better (longer duration)
      return Math.max(...challengeRecords.map(r => r.time));
    } else {
      // For running: Lower time is better (faster time)
      return Math.min(...challengeRecords.map(r => r.time));
    }
  };

  const isBetterTime = (current: number, best: number | null, goal: 'higher' | 'lower'): boolean => {
    if (best === null) return true;
    if (goal === 'higher') return current > best; // Current is better if it's higher (longer)
    return current < best; // Current is better if it's lower (faster)
  };

  const getRecentRecords = (challengeId: string, limit: number = 3): Record[] => {
    return records
      .filter(r => r.challengeId === challengeId)
      .slice(0, limit);
  };

  // Sample records for initial display
  useEffect(() => {
    if (records.length === 0) {
      // Add some sample records
      const sampleRecords: Record[] = [
        // Breathing records - higher is better (times in milliseconds)
        { challengeId: 'breath-hold', time: 25820, date: new Date(Date.now() - 86400000) }, // 25.82s
        { challengeId: 'breath-hold', time: 31690, date: new Date(Date.now() - 172800000) }, // 31.69s (BEST - higher)
        { challengeId: 'breath-hold', time: 25830, date: new Date(Date.now() - 259200000) }, // 25.83s
        
        // Running records - lower is better
        { challengeId: 'run-100m', time: 2000, date: new Date(Date.now() - 86400000) }, // 2.00s (BEST - lower)
        { challengeId: 'run-100m', time: 2080, date: new Date(Date.now() - 172800000) }, // 2.08s
      ];
      setRecords(sampleRecords);
    }
  }, []);

  return (
    <div className="timer-container">
      {/* Header */}
      <div className="timer-header">
        <button onClick={onBack} className="back-button-timer">
          <ChevronLeft size={24} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Active Timer View */}
      {selectedChallenge ? (
        <div className="active-timer-view">
          <div className="timer-challenge-header">
            <div className="challenge-icon-large">{selectedChallenge.icon}</div>
            <div>
              <h2 className="challenge-title">{selectedChallenge.name}</h2>
              <div className="challenge-category">{selectedChallenge.category}</div>
            </div>
          </div>

          <div className="timer-display">
            <div className="timer-time">{formatTime(time)}</div>
            <div className="timer-status">
              {isRunning ? 'Running...' : 'Paused'}
            </div>
          </div>

          <div className="timer-controls">
            <button 
              onClick={toggleTimer} 
              className={`control-btn ${isRunning ? 'pause-btn' : 'resume-btn'}`}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            
            <button 
              onClick={stopAndSave} 
              className="control-btn save-btn"
              disabled={time === 0}
            >
              Stop & Save
            </button>
          </div>

          {/* Best Time Display */}
          {getBestTime(selectedChallenge.id) && (
            <div className="best-time-section">
              <Trophy size={20} />
              <span>Best: {formatTime(getBestTime(selectedChallenge.id)!)}</span>
              <span className="goal-badge">
                {selectedChallenge.goal === 'higher' ? '↑ Higher is better' : '↓ Lower is better'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="challenges-view">
          {/* Challenges Grid */}
          <div className="challenges-grid">
            {challenges.map(challenge => {
              const bestTime = getBestTime(challenge.id);
              const recentRecords = getRecentRecords(challenge.id, 3);
              
              return (
                <div
                  key={challenge.id}
                  onClick={() => startTimer(challenge)}
                  className="challenge-card"
                  style={{ borderLeft: `4px solid ${challenge.color}` }}
                >
                  <div className="challenge-header">
                    <div className="challenge-icon">{challenge.icon}</div>
                    <div className="challenge-info">
                      <h3>{challenge.name}</h3>
                      <div className="challenge-category-badge">{challenge.category}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChallenge(challenge.id);
                      }}
                      className="delete-challenge-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {bestTime ? (
                    <div className="challenge-best">
                      <div className="best-time">
                        <Trophy size={14} />
                        <span>{formatTime(bestTime)}</span>
                      </div>
                      <div className={`goal-indicator ${challenge.goal}`}>
                        {challenge.goal === 'higher' ? '↑' : '↓'}
                      </div>
                    </div>
                  ) : (
                    <div className="challenge-no-record">No record yet</div>
                  )}

                  {recentRecords.length > 0 && (
                    <div className="recent-times">
                      {recentRecords.map((record, idx) => (
                        <div key={idx} className="recent-time">
                          <Clock size={12} />
                          <span>{formatTime(record.time)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Challenge Modal */}
      {showCustomForm && (
        <div className="custom-modal">
          <div className="modal-overlay" onClick={() => setShowCustomForm(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Custom Challenge</h3>
              <button onClick={() => setShowCustomForm(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label>Challenge Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Wall Sit, 5K Run"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Emoji</label>
              <div className="emoji-selector">
                {emojiList.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setCustomEmoji(emoji)}
                    className={`emoji-option ${customEmoji === emoji ? 'selected' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="selected-emoji-preview">
                Selected: {customEmoji}
              </div>
            </div>

            <div className="form-group">
              <label>Goal</label>
              <div className="goal-selector">
                <button
                  onClick={() => setCustomGoal('higher')}
                  className={`goal-option ${customGoal === 'higher' ? 'selected' : ''}`}
                >
                  <span className="goal-icon">↑</span>
                  <span className="goal-text">Higher is better</span>
                  <span className="goal-example">(e.g., Breath hold, Plank)</span>
                </button>
                <button
                  onClick={() => setCustomGoal('lower')}
                  className={`goal-option ${customGoal === 'lower' ? 'selected' : ''}`}
                >
                  <span className="goal-icon">↓</span>
                  <span className="goal-text">Lower is better</span>
                  <span className="goal-example">(e.g., Sprint, Race time)</span>
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={addCustomChallenge} className="create-btn">
                Create Challenge
              </button>
              <button onClick={() => setShowCustomForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      {!selectedChallenge && (
        <button 
          onClick={() => setShowCustomForm(true)} 
          className="floating-add-btn"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};

export default Timer;