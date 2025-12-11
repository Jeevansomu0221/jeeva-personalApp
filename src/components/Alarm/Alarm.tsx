import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, MoreVertical, Bell, Moon, Clock } from 'lucide-react';
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
  type: 'bedtime' | 'alarm' | 'custom';
}

const Alarm: React.FC<AlarmProps> = ({ onBack }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: '1',
      time: '06:00',
      label: 'Bedtime',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      type: 'bedtime'
    },
    {
      id: '2',
      time: '01:45',
      label: 'Alarm',
      enabled: true,
      days: [],
      type: 'alarm'
    },
    {
      id: '3',
      time: '02:00',
      label: 'Alarm',
      enabled: true,
      days: [],
      type: 'alarm'
    },
    {
      id: '4',
      time: '04:00',
      label: 'Alarm',
      enabled: true,
      days: [],
      type: 'alarm'
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [nextAlarm, setNextAlarm] = useState<{time: string, hours: number, minutes: number} | null>(null);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate next alarm time
  useEffect(() => {
    const calculateNextAlarm = () => {
      const now = new Date();
      const enabledAlarms = alarms.filter(alarm => alarm.enabled);
      
      if (enabledAlarms.length === 0) {
        setNextAlarm(null);
        return;
      }
      
      let nextTime = Infinity;
      let nextAlarmTime = '';
      
      enabledAlarms.forEach(alarm => {
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmDate = new Date();
        alarmDate.setHours(hours, minutes, 0, 0);
        
        // If alarm time has passed today, check for tomorrow
        if (alarmDate <= now) {
          alarmDate.setDate(alarmDate.getDate() + 1);
        }
        
        // Check if alarm repeats on this day
        const alarmDay = alarmDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (alarm.days.length === 0 || alarm.days.includes(alarmDay)) {
          const timeDiff = alarmDate.getTime() - now.getTime();
          if (timeDiff < nextTime) {
            nextTime = timeDiff;
            nextAlarmTime = alarm.time;
          }
        }
      });
      
      if (nextTime < Infinity) {
        const hoursLeft = Math.floor(nextTime / (1000 * 60 * 60));
        const minutesLeft = Math.floor((nextTime % (1000 * 60 * 60)) / (1000 * 60));
        setNextAlarm({
          time: nextAlarmTime,
          hours: hoursLeft,
          minutes: minutesLeft
        });
      } else {
        setNextAlarm(null);
      }
    };
    
    calculateNextAlarm();
    const interval = setInterval(calculateNextAlarm, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [alarms]);

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('alarms');
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
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  const addAlarm = (hour: number, minute: number, label: string, type: 'bedtime' | 'alarm' | 'custom', days: string[] = []) => {
    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time: time24,
      label,
      enabled: true,
      days,
      type
    };

    setAlarms([...alarms, newAlarm]);
    setShowAddForm(false);
  };

  const deleteAlarm = (id: string) => {
    if (window.confirm('Delete this alarm?')) {
      setAlarms(alarms.filter(alarm => alarm.id !== id));
    }
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const formatTime = (time24: string): string => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    return `${hour}:${minute.toString().padStart(2, '0')}${ampm.toLowerCase()}`;
  };

  const getAlarmIcon = (type: 'bedtime' | 'alarm' | 'custom') => {
    switch (type) {
      case 'bedtime': return Moon;
      case 'alarm': return Bell;
      default: return Clock;
    }
  };

  const getAlarmColor = (type: 'bedtime' | 'alarm' | 'custom') => {
    switch (type) {
      case 'bedtime': return '#5856D6';
      case 'alarm': return '#FF9500';
      default: return '#34C759';
    }
  };

  return (
    <div className="alarm-container">
      {/* Header */}
      <div className="alarm-header">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={24} />
          <span>Back to Home</span>
        </button>
        <button className="menu-button">
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Next Alarm Info */}
      {nextAlarm && (
        <div className="next-alarm-info">
          <div className="next-alarm-label">Alarm in {nextAlarm.hours}h {nextAlarm.minutes}m</div>
          <div className="next-alarm-time">{formatTime(nextAlarm.time)}</div>
        </div>
      )}

      <div className="alarm-content">
        {/* Alarm List */}
        <div className="alarm-list-section">
          {alarms.map((alarm, index) => {
            const Icon = getAlarmIcon(alarm.type);
            const isOneTime = alarm.days.length === 0;
            
            return (
              <React.Fragment key={alarm.id}>
                <div className="alarm-item">
                  <div className="alarm-item-left">
                    <div className="alarm-icon" style={{ backgroundColor: getAlarmColor(alarm.type) }}>
                      <Icon size={20} />
                    </div>
                    <div className="alarm-details">
                      <div className="alarm-label">{alarm.label}</div>
                      <div className="alarm-time">{formatTime(alarm.time)}</div>
                      <div className="alarm-schedule">
                        {isOneTime ? 'Once' : `${alarm.days.length} days`}
                      </div>
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
                      &times;
                    </button>
                  </div>
                </div>
                {index < alarms.length - 1 && <div className="alarm-divider" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Add Alarm Button */}
        <div className="add-alarm-section">
          <button 
            onClick={() => setShowAddForm(true)} 
            className="add-alarm-btn"
          >
            <Plus size={24} />
            <span>Add Alarm</span>
          </button>
        </div>
      </div>

      {/* Add Alarm Modal */}
      {showAddForm && (
        <div className="add-alarm-modal">
          <div className="modal-overlay" onClick={() => setShowAddForm(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Alarm</h3>
              <button onClick={() => setShowAddForm(false)}>&times;</button>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => addAlarm(6, 0, 'Bedtime', 'bedtime', weekDays)}
                className="quick-add-btn"
              >
                <Moon size={20} />
                <span>Add Bedtime (6:00am Daily)</span>
              </button>
              
              <button 
                onClick={() => addAlarm(7, 0, 'Alarm', 'alarm', [])}
                className="quick-add-btn"
              >
                <Bell size={20} />
                <span>Add Alarm (7:00am Once)</span>
              </button>
              
              <button 
                onClick={() => addAlarm(8, 0, 'Custom', 'custom', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                className="quick-add-btn"
              >
                <Clock size={20} />
                <span>Add Custom (8:00am Weekdays)</span>
              </button>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alarm;