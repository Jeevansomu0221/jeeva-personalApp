import React, { useState, useEffect, useMemo } from 'react';
import './timetable.css';

interface TimeSlot {
  id: number;
  startTime: string; // Store in 24h format internally
  endTime: string;   // Store in 24h format internally
  task: string;
  completed: boolean;
  displayStart: string; // Display in AM/PM format
  displayEnd: string;   // Display in AM/PM format
}

const Timetable: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, startTime: '08:00', endTime: '09:00', task: 'Morning Exercise', completed: false, displayStart: '8:00 AM', displayEnd: '9:00 AM' },
    { id: 2, startTime: '09:00', endTime: '10:30', task: 'Work Session 1', completed: false, displayStart: '9:00 AM', displayEnd: '10:30 AM' },
    { id: 3, startTime: '10:30', endTime: '11:00', task: 'Break', completed: false, displayStart: '10:30 AM', displayEnd: '11:00 AM' },
    { id: 4, startTime: '11:00', endTime: '12:30', task: 'Work Session 2', completed: false, displayStart: '11:00 AM', displayEnd: '12:30 PM' },
    { id: 5, startTime: '12:30', endTime: '13:30', task: 'Lunch', completed: false, displayStart: '12:30 PM', displayEnd: '1:30 PM' },
    { id: 6, startTime: '13:30', endTime: '15:00', task: 'Project Work', completed: false, displayStart: '1:30 PM', displayEnd: '3:00 PM' },
    { id: 7, startTime: '15:00', endTime: '15:30', task: 'Short Break', completed: false, displayStart: '3:00 PM', displayEnd: '3:30 PM' },
    { id: 8, startTime: '15:30', endTime: '17:00', task: 'Learning Session', completed: false, displayStart: '3:30 PM', displayEnd: '5:00 PM' },
    { id: 9, startTime: '17:00', endTime: '18:00', task: 'Evening Walk', completed: false, displayStart: '5:00 PM', displayEnd: '6:00 PM' },
  ]);

  const [newTimeSlot, setNewTimeSlot] = useState({
    startHour: '08',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '09',
    endMinute: '00',
    endPeriod: 'AM',
    task: '',
  });

  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Helper function to convert to 24h format
  const convertTo24h = (hour: string, minute: string, period: string): string => {
    let hourNum = parseInt(hour);
    
    if (period === 'PM' && hourNum !== 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }
    
    return `${hourNum.toString().padStart(2, '0')}:${minute}`;
  };

  // Helper function to convert 24h to AM/PM
  const convertToAmPm = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      // Find active time slot
      const active = timeSlots.findIndex(slot => {
        const current = parseInt(hours) * 60 + parseInt(minutes);
        const start = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
        const end = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);
        return current >= start && current < end;
      });
      setActiveSlot(active >= 0 ? timeSlots[active].id : null);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, [timeSlots]);

  // Sort time slots by start time (earliest first, starting from 4 AM)
  const sortedTimeSlots = useMemo(() => {
    return [...timeSlots].sort((a, b) => {
      const getMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const aMinutes = getMinutes(a.startTime);
      const bMinutes = getMinutes(b.startTime);
      
      const adjustTime = (minutes: number) => {
        return minutes < 4 * 60 ? minutes + 24 * 60 : minutes;
      };
      
      return adjustTime(aMinutes) - adjustTime(bMinutes);
    });
  }, [timeSlots]);

  const handleAddTimeSlot = () => {
    if (newTimeSlot.task) {
      const start24 = convertTo24h(newTimeSlot.startHour, newTimeSlot.startMinute, newTimeSlot.startPeriod);
      const end24 = convertTo24h(newTimeSlot.endHour, newTimeSlot.endMinute, newTimeSlot.endPeriod);
      
      const newSlot: TimeSlot = {
        id: timeSlots.length + 1,
        startTime: start24,
        endTime: end24,
        task: newTimeSlot.task,
        completed: false,
        displayStart: `${newTimeSlot.startHour}:${newTimeSlot.startMinute} ${newTimeSlot.startPeriod}`,
        displayEnd: `${newTimeSlot.endHour}:${newTimeSlot.endMinute} ${newTimeSlot.endPeriod}`,
      };
      
      // Add new slot and sort
      const updatedSlots = [...timeSlots, newSlot];
      setTimeSlots(updatedSlots);
      
      // Reset form and close
      setNewTimeSlot({
        startHour: '08',
        startMinute: '00',
        startPeriod: 'AM',
        endHour: '09',
        endMinute: '00',
        endPeriod: 'AM',
        task: '',
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const toggleTaskCompletion = (id: number) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === id ? { ...slot, completed: !slot.completed } : slot
    ));
  };

  const clearCompletedTasks = () => {
    setTimeSlots(timeSlots.map(slot => ({ ...slot, completed: false })));
  };

  // Generate hour options (1-12)
  const generateHourOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    return hours.map(hour => (
      <option key={hour} value={hour.toString().padStart(2, '0')}>
        {hour}
      </option>
    ));
  };

  // Generate minute options (00-55 with 5-minute intervals)
  const generateMinuteOptions = () => {
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    return minutes.map(minute => (
      <option key={minute} value={minute.toString().padStart(2, '0')}>
        {minute.toString().padStart(2, '0')}
      </option>
    ));
  };

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h1>📅 Daily Timetable</h1>
        <div className="current-time">
          <span className="time-label">Current Time:</span>
          <span className="time-value">{convertToAmPm(currentTime)}</span>
        </div>
      </div>

      {/* Add New Time Slot Button */}
      <div className="add-slot-toggle">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="toggle-add-btn"
        >
          <span className="plus-icon">+</span>
          <span className="toggle-text">
            {showAddForm ? 'Cancel' : 'Add New Time Slot'}
          </span>
        </button>
      </div>

      {/* Add New Time Slot Form (Collapsible) */}
      {showAddForm && (
        <div className="add-slot-form">
          <h3>Add New Time Slot</h3>
          <div className="form-grid">
            {/* Start Time */}
            <div className="time-input-group">
              <label className="time-label">Start Time:</label>
              <div className="time-inputs">
                <div className="time-select-wrapper">
                  <select
                    value={newTimeSlot.startHour}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, startHour: e.target.value})}
                    className="hour-select"
                  >
                    {generateHourOptions()}
                  </select>
                  <span className="time-separator">:</span>
                  <select
                    value={newTimeSlot.startMinute}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, startMinute: e.target.value})}
                    className="minute-select"
                  >
                    {generateMinuteOptions()}
                  </select>
                  <select
                    value={newTimeSlot.startPeriod}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, startPeriod: e.target.value})}
                    className="period-select"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <div className="selected-time-display">
                  Start: {newTimeSlot.startHour}:{newTimeSlot.startMinute} {newTimeSlot.startPeriod}
                </div>
              </div>
            </div>

            {/* End Time */}
            <div className="time-input-group">
              <label className="time-label">End Time:</label>
              <div className="time-inputs">
                <div className="time-select-wrapper">
                  <select
                    value={newTimeSlot.endHour}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, endHour: e.target.value})}
                    className="hour-select"
                  >
                    {generateHourOptions()}
                  </select>
                  <span className="time-separator">:</span>
                  <select
                    value={newTimeSlot.endMinute}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, endMinute: e.target.value})}
                    className="minute-select"
                  >
                    {generateMinuteOptions()}
                  </select>
                  <select
                    value={newTimeSlot.endPeriod}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, endPeriod: e.target.value})}
                    className="period-select"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <div className="selected-time-display">
                  End: {newTimeSlot.endHour}:{newTimeSlot.endMinute} {newTimeSlot.endPeriod}
                </div>
              </div>
            </div>

            {/* Task Input */}
            <div className="task-input-group">
              <label className="time-label">Task:</label>
              <input
                type="text"
                value={newTimeSlot.task}
                onChange={(e) => setNewTimeSlot({...newTimeSlot, task: e.target.value})}
                placeholder="Enter task description"
                className="task-input"
                autoFocus
              />
            </div>

            {/* Add Button */}
            <button 
              onClick={handleAddTimeSlot} 
              className="add-btn"
              disabled={!newTimeSlot.task}
            >
              Add Time Slot
            </button>
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="timetable-table-container">
        <table className="timetable-table">
          <thead>
            <tr>
              <th className="time-header">Time</th>
              <th className="task-header">Task</th>
              <th className="status-header">Status</th>
              <th className="action-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedTimeSlots.map((slot) => (
              <tr 
                key={slot.id} 
                className={`
                  time-slot-row 
                  ${slot.id === activeSlot ? 'active-slot' : ''}
                  ${slot.completed ? 'completed-slot' : ''}
                `}
              >
                <td className="time-cell">
                  <div className="time-range">
                    <span className="start-time">{slot.displayStart}</span>
                    <span className="time-separator">→</span>
                    <span className="end-time">{slot.displayEnd}</span>
                  </div>
                </td>
                <td className="task-cell">
                  <span className="task-text">{slot.task}</span>
                </td>
                <td className="status-cell">
                  <button
                    onClick={() => toggleTaskCompletion(slot.id)}
                    className={`status-btn ${slot.completed ? 'completed' : 'pending'}`}
                  >
                    {slot.completed ? '✓ Done' : '○ Pending'}
                  </button>
                </td>
                <td className="action-cell">
                  <button
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                    className="delete-btn"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controls */}
      <div className="timetable-controls">
        <button onClick={clearCompletedTasks} className="clear-btn">
          Reset All Tasks
        </button>
        <div className="stats">
          <span className="stat-item">
            Total: {timeSlots.length}
          </span>
          <span className="stat-item">
            Completed: {timeSlots.filter(slot => slot.completed).length}
          </span>
          <span className="stat-item">
            Pending: {timeSlots.filter(slot => !slot.completed).length}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color active-indicator"></div>
          <span>Current Time Slot</span>
        </div>
        <div className="legend-item">
          <div className="legend-color completed-indicator"></div>
          <span>Completed Task</span>
        </div>
        <div className="legend-item">
          <div className="legend-color early-morning"></div>
          <span>Early Morning (4 AM - 8 AM)</span>
        </div>
      </div>
      
      {/* Time Help */}
      <div className="time-help">
        <p>⏰ Time slots are automatically sorted starting from 4 AM</p>
      </div>
    </div>
  );
};

export default Timetable;