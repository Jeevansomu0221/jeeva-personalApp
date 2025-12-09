import React, { useState, useEffect } from 'react';
import { Bell, Clock, Plus, Trash2, Moon, Sun, Repeat, Volume2, Power, PowerOff } from 'lucide-react';
import './Alarm.css';

interface AlarmProps {
  onBack: () => void;
}

interface AlarmItem {
  id: string;
  time: string; // 24-hour format (HH:MM)
  label: string;
  enabled: boolean;
  days: string[];
  sound: string;
  mode: string;
}

const Alarm: React.FC<AlarmProps> = ({ onBack }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: '1',
      time: '05:44',
      label: 'Sleep',
      enabled: true,
      days: [],
      sound: 'default',
      mode: 'sleep'
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [newAlarm, setNewAlarm] = useState({
    hour: 5,
    minute: 44,
    ampm: 'PM',
    label: 'Sleep',
    days: [] as string[],
    sound: 'default',
    mode: 'sleep'
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const alarmSounds = ['Default', 'Gentle', 'Loud', 'Birds', 'Ocean'];
  
  const alarmModes = [
    { id: 'wakeup', label: 'Wake Up', color: '#FF9500', icon: Sun },
    { id: 'sleep', label: 'Sleep', color: '#5856D6', icon: Moon },
    { id: 'custom', label: 'Custom', color: '#34C759', icon: Clock }
  ];

  // Generate hour options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('jeeva-alarms');
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (error) {
        console.error('Error parsing saved alarms:', error);
      }
    }
  }, []);

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('jeeva-alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Check alarms every second
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
      const currentSeconds = now.getSeconds();

      if (currentSeconds === 0) {
        alarms.forEach(alarm => {
          if (alarm.enabled && alarm.time === currentTime24) {
            if (alarm.days.length === 0 || alarm.days.includes(currentDay)) {
              triggerAlarm(alarm);
            }
          }
        });
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarm = (alarm: AlarmItem) => {
    playAlarmSound(alarm.sound);
    
    const userConfirmed = confirm(`🔔 ALARM: ${alarm.label}\nTime: ${formatAlarmTime(alarm.time)}\n\nClick OK to stop the alarm.`);
    
    if (userConfirmed) {
      // Stop alarm sound
    }
    
    // Disable one-time alarms
    if (alarm.days.length === 0) {
      toggleAlarm(alarm.id);
    }
  };

  const playAlarmSound = (soundType: string) => {
    if (typeof window.AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies: { [key: string]: number } = {
          default: 440,
          gentle: 523.25,
          loud: 659.25,
          birds: 880,
          ocean: 293.66
        };
        
        oscillator.frequency.value = frequencies[soundType] || 440;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        for (let i = 0; i < 10; i++) {
          const startTime = audioContext.currentTime + i * 0.5;
          gainNode.gain.setValueAtTime(0.3, startTime);
          gainNode.gain.setValueAtTime(0, startTime + 0.2);
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 5);
        return;
      } catch (error) {
        console.error('Web Audio API error:', error);
      }
    }
  };

  const addAlarm = () => {
    let hour24 = newAlarm.hour;
    if (newAlarm.ampm === 'PM' && hour24 !== 12) {
      hour24 = hour24 + 12;
    } else if (newAlarm.ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const alarmTime = `${hour24.toString().padStart(2, '0')}:${newAlarm.minute.toString().padStart(2, '0')}`;
    
    const alarm: AlarmItem = {
      id: Date.now().toString(),
      time: alarmTime,
      label: newAlarm.label,
      enabled: true,
      days: newAlarm.days,
      sound: newAlarm.sound,
      mode: newAlarm.mode
    };

    setAlarms([...alarms, alarm]);
    setShowAddForm(false);
    setNewAlarm({ 
      hour: 5, 
      minute: 44, 
      ampm: 'PM', 
      label: 'Sleep', 
      days: [], 
      sound: 'default', 
      mode: 'sleep' 
    });
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const toggleDay = (day: string) => {
    if (newAlarm.days.includes(day)) {
      setNewAlarm({ ...newAlarm, days: newAlarm.days.filter(d => d !== day) });
    } else {
      setNewAlarm({ ...newAlarm, days: [...newAlarm.days, day] });
    }
  };

  const selectMode = (modeId: string) => {
    setNewAlarm({
      ...newAlarm,
      mode: modeId
    });
  };

  const formatAlarmTime = (time24: string): string => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const calculateTimeLeft = (alarmTime: string): string => {
    const now = new Date();
    const [hours, minutes] = alarmTime.split(':').map(Number);
    
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);
    
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    const diff = alarmDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    }
    return `${minutesLeft}m`;
  };

  const toggleAllAlarms = () => {
    const hasEnabledAlarms = alarms.some(alarm => alarm.enabled);
    setAlarms(alarms.map(alarm => ({
      ...alarm,
      enabled: !hasEnabledAlarms
    })));
  };

  return (
    <div className="alarm-container">
      <button onClick={onBack} className="back-button">
        ← Back to Home
      </button>

      <div className="alarm-content">
        {/* Current Time Display */}
        <div className="time-display">
          <div className="current-time">{currentTime}</div>
          <div className="current-date">{currentDate}</div>
        </div>

        {/* Alarm List Section */}
        <div className="alarm-list-section">
          <div className="section-header">
            <h2 className="section-title">Alarms</h2>
            <div className="header-actions">
              <button 
                onClick={toggleAllAlarms} 
                className="power-toggle-btn"
                title={alarms.some(a => a.enabled) ? "Turn all off" : "Turn all on"}
              >
                {alarms.some(a => a.enabled) ? (
                  <PowerOff size={20} />
                ) : (
                  <Power size={20} />
                )}
              </button>
              <button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="add-alarm-btn"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {alarms.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <p>No alarms set</p>
              <small>Click + to add an alarm</small>
            </div>
          ) : (
            <div className="alarm-list">
              {alarms.map(alarm => {
                const mode = alarmModes.find(m => m.id === alarm.mode);
                const Icon = mode?.icon || Clock;
                const isOneTime = alarm.days.length === 0;
                
                return (
                  <div key={alarm.id} className={`alarm-item ${alarm.enabled ? 'enabled' : 'disabled'}`}>
                    <div className="alarm-item-left">
                      <div className="alarm-time-display">
                        <div className="alarm-time">{formatAlarmTime(alarm.time)}</div>
                        {alarm.enabled && (
                          <div className="time-left">in {calculateTimeLeft(alarm.time)}</div>
                        )}
                      </div>
                      
                      <div className="alarm-info">
                        <div className="alarm-label">
                          <Icon size={14} style={{ color: mode?.color, marginRight: '6px' }} />
                          {alarm.label}
                        </div>
                        
                        {isOneTime ? (
                          <div className="alarm-repeat">
                            <span className="repeat-tag">One time</span>
                          </div>
                        ) : (
                          <div className="alarm-repeat">
                            <Repeat size={12} />
                            <span>{alarm.days.length} days</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="alarm-item-right">
                      <button 
                        onClick={() => toggleAlarm(alarm.id)} 
                        className={`alarm-toggle-switch ${alarm.enabled ? 'on' : 'off'}`}
                      >
                        <div className="toggle-slider"></div>
                      </button>
                      <button 
                        onClick={() => deleteAlarm(alarm.id)} 
                        className="delete-alarm-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Alarm Form */}
        {showAddForm && (
          <div className="add-alarm-form">
            <div className="form-header">
              <h3>Add Alarm</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="close-form-btn"
              >
                &times;
              </button>
            </div>

            {/* Mode Selection */}
            <div className="form-section">
              <label className="section-label">Mode</label>
              <div className="mode-selector">
                {alarmModes.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => selectMode(mode.id)}
                      className={`mode-btn ${newAlarm.mode === mode.id ? 'active' : ''}`}
                      style={{ '--mode-color': mode.color } as React.CSSProperties}
                    >
                      <Icon size={20} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="form-section">
              <label className="section-label">Time</label>
              <div className="time-selector">
                <div className="time-input-wrapper">
                  <select
                    value={newAlarm.hour}
                    onChange={(e) => setNewAlarm({ ...newAlarm, hour: parseInt(e.target.value) })}
                    className="time-input"
                  >
                    {hours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <div className="time-label">Hour</div>
                </div>
                
                <span className="time-separator">:</span>
                
                <div className="time-input-wrapper">
                  <select
                    value={newAlarm.minute}
                    onChange={(e) => setNewAlarm({ ...newAlarm, minute: parseInt(e.target.value) })}
                    className="time-input"
                  >
                    {minutes.map(m => (
                      <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  <div className="time-label">Minute</div>
                </div>
                
                <div className="time-input-wrapper">
                  <select
                    value={newAlarm.ampm}
                    onChange={(e) => setNewAlarm({ ...newAlarm, ampm: e.target.value })}
                    className="time-input ampm-input"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <div className="time-label">AM/PM</div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="form-section">
              <label className="section-label">Label</label>
              <div className="label-input-wrapper">
                <input
                  type="text"
                  value={newAlarm.label}
                  onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                  className="label-input"
                  placeholder="Wake Up"
                />
              </div>
            </div>

            {/* Repeat Days */}
            <div className="form-section">
              <label className="section-label">Repeat</label>
              <div className="days-selector">
                {weekDays.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`day-btn ${newAlarm.days.includes(day) ? 'active' : ''}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="repeat-note">
                {newAlarm.days.length === 0 ? 'One time alarm' : 'Repeats on selected days'}
              </div>
            </div>

            {/* Sound */}
            <div className="form-section">
              <label className="section-label">Sound</label>
              <div className="sound-selector">
                <Volume2 size={18} />
                <select
                  value={newAlarm.sound}
                  onChange={(e) => setNewAlarm({ ...newAlarm, sound: e.target.value })}
                  className="sound-input"
                >
                  {alarmSounds.map(sound => (
                    <option key={sound} value={sound.toLowerCase()}>{sound}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button onClick={addAlarm} className="save-btn">Save Alarm</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alarm;