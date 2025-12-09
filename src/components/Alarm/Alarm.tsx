import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff, Moon, BookOpen, Coffee, Dumbbell, Calendar } from 'lucide-react';
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
  mode?: string;
}

interface TimetableEntry {
  id: string;
  startTime: string; // 24-hour format (HH:MM)
  endTime: string; // 24-hour format (HH:MM)
  task: string;
  date: string; // YYYY-MM-DD format
  dayName: string; // Day of week (Mon, Tue, etc.)
}

const Alarm: React.FC<AlarmProps> = ({ onBack }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'alarms' | 'timetable'>('alarms');
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [newAlarm, setNewAlarm] = useState({
    hour: 7,
    minute: 0,
    ampm: 'AM',
    label: 'Wake Up',
    days: [] as string[],
    sound: 'default',
    mode: 'custom'
  });
  const [newTimetable, setNewTimetable] = useState({
    startHour: 9,
    startMinute: 0,
    startAmpm: 'AM',
    endHour: 10,
    endMinute: 0,
    endAmpm: 'AM',
    task: '',
    date: new Date().toISOString().split('T')[0],
    dayName: ''
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const alarmSounds = ['Default', 'Gentle', 'Loud', 'Birds', 'Ocean'];
  
  const modes = [
    { id: 'custom', label: 'Custom', icon: Clock, hour: 7, minute: 0, ampm: 'AM' },
    { id: 'sleep', label: 'Sleep Mode', icon: Moon, hour: 10, minute: 0, ampm: 'PM' },
    { id: 'study', label: 'Study Time', icon: BookOpen, hour: 9, minute: 0, ampm: 'AM' },
    { id: 'workout', label: 'Workout', icon: Dumbbell, hour: 6, minute: 0, ampm: 'AM' },
    { id: 'break', label: 'Break Time', icon: Coffee, hour: 12, minute: 0, ampm: 'PM' }
  ];

  // Generate hour options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour: number, minute: number, ampm: string): string => {
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Convert 24-hour to 12-hour format
  const convertTo12Hour = (time24: string): { hour: number; minute: number; ampm: string } => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    return { hour, minute, ampm };
  };

  // Get day name from date
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return weekDays[date.getDay()] || weekDays[0];
  };

  // Load alarms and timetable from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('jeeva-alarms');
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (error) {
        console.error('Error parsing saved alarms:', error);
      }
    }
    
    const savedTimetable = localStorage.getItem('jeeva-timetable');
    if (savedTimetable) {
      try {
        setTimetable(JSON.parse(savedTimetable));
      } catch (error) {
        console.error('Error parsing saved timetable:', error);
      }
    }
  }, []);

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('jeeva-alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Save timetable to localStorage
  useEffect(() => {
    localStorage.setItem('jeeva-timetable', JSON.stringify(timetable));
  }, [timetable]);

  // Update day name when date changes
  useEffect(() => {
    if (newTimetable.date) {
      const dayName = getDayName(newTimetable.date);
      setNewTimetable(prev => ({ ...prev, dayName }));
    }
  }, [newTimetable.date]);

  // Check alarms every second for more accuracy
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
      const currentSeconds = now.getSeconds();

      // Only trigger at the start of the minute
      if (currentSeconds === 0) {
        alarms.forEach(alarm => {
          if (alarm.enabled && alarm.time === currentTime) {
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
    // Create and play alarm sound
    playAlarmSound(alarm.sound);
    
    // Show notification
    const userConfirmed = confirm(`🔔 ALARM: ${alarm.label}\nTime: ${formatAlarmTime(alarm.time)}\n\nClick OK to stop the alarm.`);
    
    // Stop alarm sound if confirmed
    if (userConfirmed) {
      // In a real app, you would stop the audio here
      // For now, we just confirm the alarm was stopped
    }
    
    // Disable one-time alarms
    if (alarm.days.length === 0) {
      toggleAlarm(alarm.id);
    }
  };

  const playAlarmSound = (soundType: string) => {
    // Try to use Web Audio API if available
    if (typeof window.AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different sounds
        const frequencies: { [key: string]: number } = {
          default: 440,
          gentle: 523.25,
          loud: 659.25,
          birds: 880,
          ocean: 293.66
        };
        
        oscillator.frequency.value = frequencies[soundType] || 440;
        oscillator.type = 'sine';
        
        // Create beeping pattern
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
    
    // Fallback to alert sound
    try {
      const alertSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      alertSound.play().catch(console.error);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const calculateTimeLeft = (alarmTime: string): string => {
    const now = new Date();
    const [hours, minutes] = alarmTime.split(':').map(Number);
    
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);
    
    // If alarm time has passed today, set it for tomorrow
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

  const addAlarm = () => {
    const selectedMode = modes.find(m => m.id === newAlarm.mode);
    
    // Use mode time or custom time
    const hour = newAlarm.mode === 'custom' ? newAlarm.hour : selectedMode?.hour || newAlarm.hour;
    const minute = newAlarm.mode === 'custom' ? newAlarm.minute : selectedMode?.minute || newAlarm.minute;
    const ampm = newAlarm.mode === 'custom' ? newAlarm.ampm : selectedMode?.ampm || newAlarm.ampm;
    
    const alarmTime = convertTo24Hour(hour, minute, ampm);
    
    const alarm: AlarmItem = {
      id: Date.now().toString(),
      time: alarmTime,
      label: newAlarm.mode === 'custom' ? newAlarm.label : selectedMode?.label || newAlarm.label,
      enabled: true,
      days: newAlarm.days,
      sound: newAlarm.sound,
      mode: newAlarm.mode
    };

    setAlarms([...alarms, alarm]);
    setShowAddForm(false);
    setNewAlarm({ 
      hour: 7, 
      minute: 0, 
      ampm: 'AM', 
      label: 'Wake Up', 
      days: [], 
      sound: 'default', 
      mode: 'custom' 
    });
  };

  const addTimetableEntry = () => {
    const startTime = convertTo24Hour(newTimetable.startHour, newTimetable.startMinute, newTimetable.startAmpm);
    const endTime = convertTo24Hour(newTimetable.endHour, newTimetable.endMinute, newTimetable.endAmpm);
    const dayName = getDayName(newTimetable.date);

    const entry: TimetableEntry = {
      id: Date.now().toString(),
      startTime,
      endTime,
      task: newTimetable.task,
      date: newTimetable.date,
      dayName
    };

    setTimetable([...timetable, entry]);
    setShowTimetableForm(false);
    setNewTimetable({ 
      startHour: 9, 
      startMinute: 0, 
      startAmpm: 'AM',
      endHour: 10, 
      endMinute: 0, 
      endAmpm: 'AM',
      task: '', 
      date: new Date().toISOString().split('T')[0],
      dayName: ''
    });
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetable(timetable.filter(entry => entry.id !== id));
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
    const mode = modes.find(m => m.id === modeId);
    if (mode) {
      setNewAlarm({
        ...newAlarm,
        mode: modeId,
        hour: mode.hour,
        minute: mode.minute,
        ampm: mode.ampm,
        label: mode.label
      });
    }
  };

  const formatAlarmTime = (time24: string): string => {
    const { hour, minute, ampm } = convertTo12Hour(time24);
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Filter timetable by date range
  const getTimetableByDateRange = () => {
    const sortedTimetable = [...timetable].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortedTimetable;
  };

  // Get upcoming timetable entries
  const getUpcomingTimetable = () => {
    const today = new Date().toISOString().split('T')[0];
    return timetable
      .filter(entry => entry.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="feature-container">
      <button onClick={onBack} className="back-button">
        ← Back to Home
      </button>

      <div className="feature-content">
        <div className="alarm-header">
          <h2 className="feature-title">Alarms & Schedule</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'alarms' ? 'active' : ''}`}
              onClick={() => setActiveTab('alarms')}
            >
              <Bell size={18} /> Alarms
            </button>
            <button 
              className={`tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <Calendar size={18} /> Timetable
            </button>
          </div>
        </div>

        {/* ALARMS TAB */}
        {activeTab === 'alarms' && (
          <>
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="add-alarm-btn"
            >
              <Plus size={20} /> Add Alarm
            </button>

            {/* Add Alarm Form */}
            {showAddForm && (
              <div className="add-alarm-form">
                <h3>Set New Alarm</h3>
                
                {/* Mode Selection */}
                <div className="form-group">
                  <label>Quick Modes</label>
                  <div className="modes-grid">
                    {modes.map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => selectMode(mode.id)}
                          className={`mode-btn ${newAlarm.mode === mode.id ? 'active' : ''}`}
                        >
                          <Icon size={20} />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <div className="time-input-group">
                    <select
                      value={newAlarm.hour}
                      onChange={(e) => setNewAlarm({ ...newAlarm, hour: parseInt(e.target.value), mode: 'custom' })}
                      className="time-select"
                    >
                      {hours.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="time-separator">:</span>
                    <select
                      value={newAlarm.minute}
                      onChange={(e) => setNewAlarm({ ...newAlarm, minute: parseInt(e.target.value), mode: 'custom' })}
                      className="time-select"
                    >
                      {minutes.map(m => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      value={newAlarm.ampm}
                      onChange={(e) => setNewAlarm({ ...newAlarm, ampm: e.target.value, mode: 'custom' })}
                      className="ampm-select"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Label</label>
                  <input
                    type="text"
                    value={newAlarm.label}
                    onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                    className="text-input"
                    placeholder="e.g., Wake Up, Meeting"
                  />
                </div>

                <div className="form-group">
                  <label>Repeat</label>
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
                  <small className="helper-text">Leave empty for one-time alarm</small>
                </div>

                <div className="form-group">
                  <label>Sound</label>
                  <select
                    value={newAlarm.sound}
                    onChange={(e) => setNewAlarm({ ...newAlarm, sound: e.target.value })}
                    className="select-input"
                  >
                    {alarmSounds.map(sound => (
                      <option key={sound} value={sound.toLowerCase()}>{sound}</option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button onClick={addAlarm} className="save-btn">Save Alarm</button>
                  <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            )}

            {/* Alarms List */}
            <div className="alarms-list">
              {alarms.length === 0 && !showAddForm && (
                <div className="empty-state">
                  <Clock size={64} color="#4b5563" />
                  <p>No alarms set</p>
                  <small>Click "Add Alarm" to create one</small>
                </div>
              )}

              {alarms.map(alarm => {
                const Icon = modes.find(m => m.id === alarm.mode)?.icon || Clock;
                return (
                  <div key={alarm.id} className={`alarm-card ${alarm.enabled ? 'enabled' : 'disabled'}`}>
                    <div className="alarm-main">
                      <button 
                        onClick={() => toggleAlarm(alarm.id)} 
                        className="alarm-toggle"
                      >
                        {alarm.enabled ? <Bell size={24} color="#10b981" /> : <BellOff size={24} color="#6b7280" />}
                      </button>
                      
                      <div className="alarm-info">
                        <div className="alarm-time-row">
                          <div className="alarm-time">{formatAlarmTime(alarm.time)}</div>
                          {alarm.enabled && (
                            <div className="time-left">in {calculateTimeLeft(alarm.time)}</div>
                          )}
                        </div>
                        <div className="alarm-label">
                          <Icon size={16} style={{ marginRight: '4px' }} />
                          {alarm.label}
                        </div>
                        {alarm.days.length > 0 && (
                          <div className="alarm-days">{alarm.days.join(', ')}</div>
                        )}
                        {alarm.days.length === 0 && (
                          <div className="alarm-days">One time</div>
                        )}
                      </div>

                      <button 
                        onClick={() => deleteAlarm(alarm.id)} 
                        className="delete-btn"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TIMETABLE TAB */}
        {activeTab === 'timetable' && (
          <>
            <button 
              onClick={() => setShowTimetableForm(!showTimetableForm)} 
              className="add-alarm-btn"
            >
              <Plus size={20} /> Add Schedule
            </button>

            {/* Add Timetable Form */}
            {showTimetableForm && (
              <div className="add-alarm-form">
                <h3>Add to Timetable</h3>
                
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newTimetable.date}
                    onChange={(e) => setNewTimetable({ ...newTimetable, date: e.target.value })}
                    className="date-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <small className="helper-text">Selected: {formatDate(newTimetable.date)} ({newTimetable.dayName})</small>
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <div className="time-input-group">
                    <select
                      value={newTimetable.startHour}
                      onChange={(e) => setNewTimetable({ ...newTimetable, startHour: parseInt(e.target.value) })}
                      className="time-select"
                    >
                      {hours.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="time-separator">:</span>
                    <select
                      value={newTimetable.startMinute}
                      onChange={(e) => setNewTimetable({ ...newTimetable, startMinute: parseInt(e.target.value) })}
                      className="time-select"
                    >
                      {minutes.map(m => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      value={newTimetable.startAmpm}
                      onChange={(e) => setNewTimetable({ ...newTimetable, startAmpm: e.target.value })}
                      className="ampm-select"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <div className="time-input-group">
                    <select
                      value={newTimetable.endHour}
                      onChange={(e) => setNewTimetable({ ...newTimetable, endHour: parseInt(e.target.value) })}
                      className="time-select"
                    >
                      {hours.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="time-separator">:</span>
                    <select
                      value={newTimetable.endMinute}
                      onChange={(e) => setNewTimetable({ ...newTimetable, endMinute: parseInt(e.target.value) })}
                      className="time-select"
                    >
                      {minutes.map(m => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      value={newTimetable.endAmpm}
                      onChange={(e) => setNewTimetable({ ...newTimetable, endAmpm: e.target.value })}
                      className="ampm-select"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Task / Activity</label>
                  <input
                    type="text"
                    value={newTimetable.task}
                    onChange={(e) => setNewTimetable({ ...newTimetable, task: e.target.value })}
                    className="text-input"
                    placeholder="e.g., Math Class, Gym, Study"
                  />
                </div>

                <div className="form-actions">
                  <button onClick={addTimetableEntry} className="save-btn">Add Entry</button>
                  <button onClick={() => setShowTimetableForm(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            )}

            {/* Upcoming Timetable Entries */}
            {getUpcomingTimetable().length > 0 && (
              <div className="upcoming-timetable">
                <h3>Upcoming Schedule</h3>
                <div className="timetable-list">
                  {getUpcomingTimetable().map(entry => (
                    <div key={entry.id} className="timetable-entry">
                      <div className="entry-date">{formatDate(entry.date)}</div>
                      <div className="entry-time">
                        {formatAlarmTime(entry.startTime)} - {formatAlarmTime(entry.endTime)}
                      </div>
                      <div className="entry-task">{entry.task}</div>
                      <button 
                        onClick={() => deleteTimetableEntry(entry.id)}
                        className="delete-btn-small"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Timetable Entries by Date */}
            <div className="timetable-container">
              {getTimetableByDateRange().length === 0 && !showTimetableForm && (
                <div className="empty-state">
                  <Calendar size={64} color="#4b5563" />
                  <p>No schedule entries</p>
                  <small>Click "Add Schedule" to create your timetable</small>
                </div>
              )}

              {/* Group timetable by date */}
              {(() => {
                const groupedTimetable: { [key: string]: TimetableEntry[] } = {};
                
                getTimetableByDateRange().forEach(entry => {
                  if (!groupedTimetable[entry.date]) {
                    groupedTimetable[entry.date] = [];
                  }
                  groupedTimetable[entry.date].push(entry);
                });

                return Object.entries(groupedTimetable).map(([date, entries]) => (
                  <div key={date} className="timetable-day">
                    <h3 className="day-header">
                      {formatDate(date)}
                      <span className="day-count">({entries.length} entries)</span>
                    </h3>
                    <div className="day-entries">
                      {entries
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(entry => (
                          <div key={entry.id} className="timetable-entry">
                            <div className="entry-time">
                              {formatAlarmTime(entry.startTime)} - {formatAlarmTime(entry.endTime)}
                            </div>
                            <div className="entry-task">{entry.task}</div>
                            <button 
                              onClick={() => deleteTimetableEntry(entry.id)}
                              className="delete-btn-small"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Alarm;