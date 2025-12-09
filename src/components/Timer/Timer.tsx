import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Trophy, Plus, Trash2 } from 'lucide-react';
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
}

interface Record {
  challengeId: string;
  time: number; // in milliseconds
  date: Date;
}

const Timer: React.FC<TimerProps> = ({ onBack }) => {
  const initialChallenges: Challenge[] = [
    // Breath Holding
    { id: 'breath-hold', name: 'Breath Hold', category: 'Breathing', icon: '🫁', color: '#0ea5e9' },
    
    // Running
    { id: 'run-100m', name: '100m Sprint', category: 'Running', icon: '🏃', color: '#ea580c' },
    { id: 'run-200m', name: '200m Sprint', category: 'Running', icon: '🏃‍♂️', color: '#ea580c' },
    { id: 'run-400m', name: '400m Run', category: 'Running', icon: '🏃‍♀️', color: '#ea580c' },
    { id: 'run-1km', name: '1KM Run', category: 'Running', icon: '🏃', color: '#dc2626' },
    { id: 'run-5km', name: '5KM Run', category: 'Running', icon: '🏃‍♂️', color: '#dc2626' },
    
    // Fitness Challenges
    { id: 'plank', name: 'Plank Hold', category: 'Fitness', icon: '💪', color: '#16a34a' },
    { id: 'wall-sit', name: 'Wall Sit', category: 'Fitness', icon: '🧘', color: '#16a34a' },
    { id: 'push-ups', name: 'Push-ups (1 min)', category: 'Fitness', icon: '🤸', color: '#8b5cf6' },
    { id: 'sit-ups', name: 'Sit-ups (1 min)', category: 'Fitness', icon: '🤸‍♀️', color: '#8b5cf6' },
    { id: 'jumping-jacks', name: 'Jumping Jacks (1 min)', category: 'Fitness', icon: '🤾', color: '#8b5cf6' },
    { id: 'burpees', name: 'Burpees (1 min)', category: 'Fitness', icon: '🤾‍♂️', color: '#8b5cf6' },
    
    // Swimming
    { id: 'swim-50m', name: '50m Swim', category: 'Swimming', icon: '🏊', color: '#06b6d4' },
    { id: 'swim-100m', name: '100m Swim', category: 'Swimming', icon: '🏊‍♂️', color: '#06b6d4' },
    
    // Other
    { id: 'meditation', name: 'Meditation', category: 'Mindfulness', icon: '🧘‍♂️', color: '#a855f7' },
    { id: 'reading', name: 'Reading Session', category: 'Learning', icon: '📚', color: '#6366f1' },
  ];

  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('⚡');
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const emojiList = ['⚡', '🚴', '🏋️', '🧘‍♀️', '🏊‍♀️', '🏃', '🚲', '🧗', '🤸', '🎯', '🌟', '💪', '🔥', '⭐', '🏆'];

  // Load challenges and records from localStorage
  useEffect(() => {
    const savedChallenges = localStorage.getItem('jeeva-timer-challenges');
    const savedRecords = localStorage.getItem('jeeva-timer-records');
    
    if (savedChallenges) {
      try {
        const parsed = JSON.parse(savedChallenges);
        // Merge with initial challenges, avoiding duplicates
        const allChallenges = [...initialChallenges];
        parsed.forEach((challenge: Challenge) => {
          if (!allChallenges.some(c => c.id === challenge.id)) {
            allChallenges.push(challenge);
          }
        });
        setChallenges(allChallenges);
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

  // Save challenges and records to localStorage
  useEffect(() => {
    const customChallenges = challenges.filter(c => c.id.startsWith('custom-'));
    if (customChallenges.length > 0) {
      localStorage.setItem('jeeva-timer-challenges', JSON.stringify(customChallenges));
    }
    
    if (records.length > 0) {
      localStorage.setItem('jeeva-timer-records', JSON.stringify(records));
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
    const isNewRecord = !bestTime || time < bestTime;

    if (isNewRecord) {
      alert(`🏆 NEW RECORD!\n${selectedChallenge.name}\nTime: ${formatTime(time)}`);
    } else {
      alert(`✅ Completed!\n${selectedChallenge.name}\nTime: ${formatTime(time)}\nBest: ${formatTime(bestTime)}`);
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
      color: '#6366f1'
    };

    setChallenges(prev => [...prev, customChallenge]);
    startTimer(customChallenge);
    setShowCustomInput(false);
    setCustomName('');
    setCustomEmoji('⚡');
  };

  const deleteChallenge = (challengeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      setChallenges(prev => prev.filter(c => c.id !== challengeId));
      setRecords(prev => prev.filter(r => r.challengeId !== challengeId));
    }
    setShowDelete(null);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    } else {
      return `${seconds}.${ms.toString().padStart(2, '0')}s`;
    }
  };

  const getBestTime = (challengeId: string): number | null => {
    const challengeRecords = records.filter(r => r.challengeId === challengeId);
    if (challengeRecords.length === 0) return null;
    return Math.min(...challengeRecords.map(r => r.time));
  };

  const getRecentRecords = (challengeId: string, limit: number = 3): Record[] => {
    return records
      .filter(r => r.challengeId === challengeId)
      .slice(0, limit);
  };

  const deleteRecord = (index: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="timer-container">
      <button onClick={onBack} className="back-button-timer">
        ← Back to Home
      </button>

      <div className="timer-content">
        {/* Active Timer View */}
        {selectedChallenge ? (
          <div className="active-timer-section">
            <div className="timer-challenge-info">
              <span className="challenge-icon" style={{ fontSize: '3rem' }}>
                {selectedChallenge.icon}
              </span>
              <h3 style={{ color: selectedChallenge.color }}>{selectedChallenge.name}</h3>
              <span className="challenge-category">{selectedChallenge.category}</span>
            </div>

            <div className="timer-display">
              <div className="timer-time">{formatTime(time)}</div>
            </div>

            <div className="timer-controls">
              <button 
                onClick={toggleTimer} 
                className={`timer-control-btn ${isRunning ? 'pause' : 'play'}`}
              >
                {isRunning ? <Pause size={32} /> : <Play size={32} />}
                <span>{isRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button 
                onClick={stopAndSave} 
                className="timer-control-btn stop"
                disabled={time === 0}
              >
                <Clock size={32} />
                <span>Stop & Save</span>
              </button>

              <button 
                onClick={resetTimer} 
                className="timer-control-btn reset"
              >
                <RotateCcw size={28} />
                <span>Cancel</span>
              </button>
            </div>

            {/* Best Time Display */}
            {getBestTime(selectedChallenge.id) && (
              <div className="best-time-display">
                <Trophy size={24} color="#fbbf24" />
                <span>Best Time: {formatTime(getBestTime(selectedChallenge.id)!)}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Custom Challenge Creation */}
            {!showCustomInput ? (
              <div className="custom-challenge-section">
                <button onClick={() => setShowCustomInput(true)} className="custom-challenge-btn">
                  <Plus size={20} />
                  Create Custom Challenge
                </button>
              </div>
            ) : (
              <div className="custom-challenge-input">
                <div className="custom-input-group">
                  <input
                    type="text"
                    placeholder="Enter challenge name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="custom-name-input"
                    autoFocus
                  />
                  <div className="emoji-selector">
                    <label>Emoji:</label>
                    <select
                      value={customEmoji}
                      onChange={(e) => setCustomEmoji(e.target.value)}
                      className="emoji-select"
                    >
                      {emojiList.map(emoji => (
                        <option key={emoji} value={emoji}>
                          {emoji}
                        </option>
                      ))}
                    </select>
                    <span className="selected-emoji">{customEmoji}</span>
                  </div>
                </div>
                <div className="custom-actions">
                  <button onClick={addCustomChallenge} className="custom-start-btn">
                    <Plus size={16} /> Add Challenge
                  </button>
                  <button onClick={() => setShowCustomInput(false)} className="custom-cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
                    style={{ borderColor: challenge.color }}
                    onMouseEnter={() => setShowDelete(challenge.id)}
                    onMouseLeave={() => setShowDelete(null)}
                  >
                    {showDelete === challenge.id && (
                      <button
                        className="delete-challenge-btn"
                        onClick={(e) => deleteChallenge(challenge.id, e)}
                        title="Delete challenge"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    <div className="challenge-icon-large">{challenge.icon}</div>
                    <div className="challenge-name">{challenge.name}</div>
                    <div className="challenge-category-badge">{challenge.category}</div>
                    
                    {bestTime ? (
                      <div className="challenge-best-time">
                        <Trophy size={16} color="#fbbf24" />
                        {formatTime(bestTime)}
                      </div>
                    ) : (
                      <div className="challenge-no-record">No record yet</div>
                    )}

                    {recentRecords.length > 0 && (
                      <div className="challenge-recent-times">
                        {recentRecords.map((record, idx) => (
                          <span key={idx} className="recent-time">
                            {formatTime(record.time)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Records History */}
        {!selectedChallenge && records.length > 0 && (
          <div className="records-history">
            <h3>Recent History</h3>
            <div className="records-list">
              {records.slice(0, 10).map((record, index) => {
                const challenge = challenges.find(c => c.id === record.challengeId);
                return (
                  <div key={index} className="record-item">
                    <div className="record-info">
                      <span className="record-icon">{challenge?.icon || '⚡'}</span>
                      <div>
                        <div className="record-name">{challenge?.name || 'Custom Challenge'}</div>
                        <div className="record-date">{record.date.toLocaleDateString()} {record.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>
                    <div className="record-time-section">
                      <span className="record-time">{formatTime(record.time)}</span>
                      <button 
                        onClick={() => deleteRecord(index)} 
                        className="delete-record-btn"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;