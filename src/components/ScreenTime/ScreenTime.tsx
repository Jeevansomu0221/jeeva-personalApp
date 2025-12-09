// ScreenTime.tsx
import React, { useState, useEffect, useRef } from 'react';
import './ScreenTime.css';

interface AppUsage {
  id: string;
  name: string;
  icon: string;
  color: string;
  timeSpent: number; // in minutes
  category: string;
  packageName?: string; // For real tracking
}

interface ScreenTimeProps {
  onBack: () => void;
}

const ScreenTime: React.FC<ScreenTimeProps> = ({ onBack }) => {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppUsage | null>(null);
  const [timerDuration, setTimerDuration] = useState(60); // in minutes
  const [totalTimeToday, setTotalTimeToday] = useState(0);
  const [apps, setApps] = useState<AppUsage[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const activeAppRef = useRef<string | null>(null);
  const updateIntervalRef = useRef<number | null>(null);

  // Simulate real installed apps
  const simulatedApps: AppUsage[] = [
    { id: '1', name: 'Instagram', icon: '📸', color: '#E1306C', timeSpent: 0, category: 'Social' },
    { id: '2', name: 'DuckDuckGo', icon: '🦆', color: '#DE5833', timeSpent: 0, category: 'Browser' },
    { id: '3', name: 'Chess', icon: '♟️', color: '#000000', timeSpent: 0, category: 'Games' },
    { id: '4', name: 'WhatsApp', icon: '💬', color: '#25D366', timeSpent: 0, category: 'Social' },
    { id: '5', name: 'YouTube', icon: '🎥', color: '#FF0000', timeSpent: 0, category: 'Entertainment' },
    { id: '6', name: 'Twitter/X', icon: '🐦', color: '#000000', timeSpent: 0, category: 'Social' },
    { id: '7', name: 'Chrome', icon: '🌐', color: '#4285F4', timeSpent: 0, category: 'Browser' },
    { id: '8', name: 'Spotify', icon: '🎵', color: '#1DB954', timeSpent: 0, category: 'Music' },
    { id: '9', name: 'Messages', icon: '💬', color: '#34C759', timeSpent: 0, category: 'Communication' },
    { id: '10', name: 'Phone', icon: '📞', color: '#5856D6', timeSpent: 0, category: 'Communication' },
    { id: '11', name: 'Photos', icon: '🖼️', color: '#FF2D55', timeSpent: 0, category: 'Media' },
    { id: '12', name: 'Camera', icon: '📷', color: '#5AC8FA', timeSpent: 0, category: 'Media' },
    { id: '13', name: 'Settings', icon: '⚙️', color: '#8E8E93', timeSpent: 0, category: 'System' },
    { id: '14', name: 'App Store', icon: '📱', color: '#007AFF', timeSpent: 0, category: 'Store' },
    { id: '15', name: 'Maps', icon: '🗺️', color: '#FF9500', timeSpent: 0, category: 'Navigation' },
  ];

  // Initialize with saved data or simulated data
  useEffect(() => {
    const savedData = localStorage.getItem('screenTimeData');
    const savedDate = localStorage.getItem('screenTimeDate');
    const today = new Date().toDateString();
    
    if (savedData && savedDate === today) {
      // Load saved data from today
      const data = JSON.parse(savedData);
      setApps(data.apps);
      setTotalTimeToday(data.totalTime);
    } else {
      // Start fresh with simulated data or random data
      const appsWithRandomTime = simulatedApps.map(app => ({
        ...app,
        timeSpent: Math.floor(Math.random() * 60) // Random time up to 60 mins
      }));
      
      const total = appsWithRandomTime.reduce((sum, app) => sum + app.timeSpent, 0);
      setApps(appsWithRandomTime);
      setTotalTimeToday(total);
      
      // Save initial data
      saveData(appsWithRandomTime, total);
    }

    // Start simulation of active app usage
    startTrackingSimulation();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const startTrackingSimulation = () => {
    // Simulate changing active apps (like real usage)
    const intervalId = window.setInterval(() => {
      // Randomly switch active app
      const randomAppIndex = Math.floor(Math.random() * apps.length);
      const randomApp = apps[randomAppIndex];
      
      if (activeAppRef.current !== randomApp.id) {
        activeAppRef.current = randomApp.id;
        setActiveApp(randomApp.id);
        
        // Update time for the active app
        setApps(prevApps => {
          const updatedApps = prevApps.map(app => {
            if (app.id === randomApp.id) {
              return { ...app, timeSpent: parseFloat((app.timeSpent + 0.25).toFixed(2)) }; // Add 15 seconds
            }
            return app;
          });
          
          // Update total
          const newTotal = updatedApps.reduce((sum, app) => sum + app.timeSpent, 0);
          setTotalTimeToday(newTotal);
          setLastUpdate(new Date());
          
          // Save updated data
          saveData(updatedApps, newTotal);
          
          return updatedApps;
        });
      }
    }, 15000); // Update every 15 seconds

    updateIntervalRef.current = intervalId;
  };

  const saveData = (appList: AppUsage[], totalTime: number) => {
    const today = new Date().toDateString();
    localStorage.setItem('screenTimeDate', today);
    localStorage.setItem('screenTimeData', JSON.stringify({
      apps: appList,
      totalTime: totalTime
    }));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}, ${mins} min${mins !== 1 ? 's' : ''}` : `${mins} minutes`;
  };

  const formatShortTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleSetTimer = (app: AppUsage) => {
    setSelectedApp(app);
    setTimerDuration(60); // Default to 1 hour
    setShowTimerModal(true);
  };

  const handleSaveTimer = () => {
    if (selectedApp) {
      // Here you would save the timer limit for the app
      const appLimits = JSON.parse(localStorage.getItem('appLimits') || '{}');
      appLimits[selectedApp.id] = timerDuration;
      localStorage.setItem('appLimits', JSON.stringify(appLimits));
      
      // Check if app is over limit
      if (selectedApp.timeSpent > timerDuration) {
        alert(`⚠️ ${selectedApp.name} is already over your limit of ${timerDuration} minutes!`);
      }
    }
    setShowTimerModal(false);
    setSelectedApp(null);
  };

  const handleManualTimeUpdate = (appId: string, minutes: number) => {
    setApps(prevApps => {
      const updatedApps = prevApps.map(app => {
        if (app.id === appId) {
          return { ...app, timeSpent: minutes };
        }
        return app;
      });
      
      const newTotal = updatedApps.reduce((sum, app) => sum + app.timeSpent, 0);
      setTotalTimeToday(newTotal);
      saveData(updatedApps, newTotal);
      
      return updatedApps;
    });
  };

  const getTimePercentage = (minutes: number) => {
    return totalTimeToday > 0 ? (minutes / totalTimeToday) * 100 : 0;
  };

  const getDayOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return days[today.getDay()];
  };

  const getAppLimit = (appId: string) => {
    const appLimits = JSON.parse(localStorage.getItem('appLimits') || '{}');
    return appLimits[appId] || null;
  };

  const resetDayData = () => {
    if (window.confirm('Reset all screen time data for today?')) {
      const resetApps = apps.map(app => ({ ...app, timeSpent: 0 }));
      setApps(resetApps);
      setTotalTimeToday(0);
      saveData(resetApps, 0);
    }
  };

  // Sort apps by time spent (most used first)
  const sortedApps = [...apps].sort((a, b) => b.timeSpent - a.timeSpent);

  return (
    <div className="screentime-container">
      {/* Timer Modal */}
      {showTimerModal && selectedApp && (
        <div className="timer-modal-overlay">
          <div className="timer-modal">
            <div className="modal-header">
              <h3>App Timer</h3>
              <p className="modal-subtitle">
                This timer for {selectedApp.name} will reset at midnight
              </p>
            </div>
            
            <div className="timer-options">
              <div 
                className={`timer-option ${timerDuration === 30 ? 'selected' : ''}`}
                onClick={() => setTimerDuration(30)}
              >
                <span className="time-value">30</span>
                <span className="time-label">mins</span>
              </div>
              <div 
                className={`timer-option ${timerDuration === 60 ? 'selected' : ''}`}
                onClick={() => setTimerDuration(60)}
              >
                <span className="time-value">1 hr</span>
                <span className="time-label">00 mins</span>
              </div>
              <div 
                className={`timer-option ${timerDuration === 95 ? 'selected' : ''}`}
                onClick={() => setTimerDuration(95)}
              >
                <span className="time-value">1 hr</span>
                <span className="time-label">35 mins</span>
              </div>
            </div>

            <div className="custom-timer">
              <label>Custom time (minutes):</label>
              <div className="custom-input">
                <input
                  type="number"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(parseInt(e.target.value) || 0)}
                  min="1"
                  max="240"
                />
                <span>minutes</span>
              </div>
            </div>

            <div className="current-usage">
              <p>Current usage today: {formatTime(selectedApp.timeSpent)}</p>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowTimerModal(false)}
              >
                Cancel
              </button>
              <button 
                className="ok-btn"
                onClick={handleSaveTimer}
              >
                Set Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Screen Time</h1>
        <div className="header-controls">
          <button 
            className="reset-btn"
            onClick={resetDayData}
            title="Reset today's data"
          >
            ⟳ Reset
          </button>
          <div className="date-display">
            Today • {getDayOfWeek()}, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Total Time */}
      <div className="total-time-card">
        <div className="total-time-header">
          <h2>Total Screen Time</h2>
          <span className="today-badge">Today</span>
        </div>
        <div className="total-time-value">
          {formatTime(totalTimeToday)}
        </div>
        <div className="last-updated">
          Last updated: {lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        
        {/* Weekday Bar */}
        <div className="weekday-bar">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div 
              key={index} 
              className={`weekday ${index === new Date().getDay() ? 'active' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* App List */}
      <div className="app-list-section">
        <div className="section-header">
          <h3>App Activity Details</h3>
          <div className="header-actions">
            <span className="app-count">{sortedApps.length} apps</span>
            <span className="active-app">
              {activeApp ? `Active: ${apps.find(a => a.id === activeApp)?.name}` : 'Tracking...'}
            </span>
          </div>
        </div>
        
        <div className="app-list">
          {sortedApps.map((app) => {
            const limit = getAppLimit(app.id);
            const isOverLimit = limit && app.timeSpent > limit;
            
            return (
              <div 
                key={app.id} 
                className={`app-item ${app.id === activeApp ? 'active' : ''} ${isOverLimit ? 'over-limit' : ''}`}
              >
                <div className="app-info">
                  <div 
                    className="app-icon"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.icon}
                  </div>
                  <div className="app-details">
                    <div className="app-name-category">
                      <span className="app-name">{app.name}</span>
                      <span className="app-category">{app.category}</span>
                    </div>
                    <div className="app-time">
                      {formatTime(app.timeSpent)}
                      {limit && (
                        <span className="app-limit"> / {formatTime(limit)} limit</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="app-actions">
                  <div className="time-bar-container">
                    <div className="time-bar">
                      <div 
                        className="time-fill"
                        style={{ width: `${Math.min(100, getTimePercentage(app.timeSpent))}%` }}
                      ></div>
                    </div>
                    {limit && (
                      <div 
                        className="limit-marker"
                        style={{ left: `${(limit / totalTimeToday) * 100}%` }}
                      ></div>
                    )}
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className="set-timer-btn"
                      onClick={() => handleSetTimer(app)}
                    >
                      {limit ? 'Edit Limit' : 'Set Timer'}
                    </button>
                    <div className="time-adjust">
                      <button 
                        className="time-minus"
                        onClick={() => handleManualTimeUpdate(app.id, Math.max(0, app.timeSpent - 5))}
                      >
                        -5m
                      </button>
                      <button 
                        className="time-plus"
                        onClick={() => handleManualTimeUpdate(app.id, app.timeSpent + 5)}
                      >
                        +5m
                      </button>
                    </div>
                  </div>
                </div>
                
                {isOverLimit && (
                  <div className="limit-warning">
                    ⚠️ Over limit by {formatTime(app.timeSpent - limit)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat">
          <span className="stat-value">{sortedApps.length}</span>
          <span className="stat-label">Apps Used</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatShortTime(totalTimeToday)}</span>
          <span className="stat-label">Total Time</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {sortedApps.length > 0 ? Math.round(totalTimeToday / sortedApps.length) : 0}m
          </span>
          <span className="stat-label">Avg per App</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <p className="info-title">ℹ️ About Screen Time Tracking</p>
        <p className="info-text">
          This is a simulation of screen time tracking. For real app usage monitoring, 
          you would need to build a native mobile app using platform-specific APIs.
          This version tracks time automatically and saves your data locally.
        </p>
      </div>
    </div>
  );
};

export default ScreenTime;