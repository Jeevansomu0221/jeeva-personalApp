import React, { useState, useEffect } from 'react';
import './ScreenTime.css';

type AppUsage = {
  id: string;
  name: string;
  category: string;
  icon: string;
  timeSpent: number; // in minutes
  lastUsed: string;
  dailyLimit?: number; // optional daily limit in minutes
};

type Note = {
  id: string;
  title: string;
  content: string;
  type: 'idea' | 'story' | 'general';
  createdAt: string;
  lastEdited: string;
  tags: string[];
  color: string;
};

type TimeRange = 'today' | 'week' | 'month';

interface ScreenTimeProps {
  onBack: () => void;
}

const ScreenTime: React.FC<ScreenTimeProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'screentime' | 'notes'>('screentime');
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [appUsage, setAppUsage] = useState<AppUsage[]>([
    { id: '1', name: 'Chrome', category: 'Productivity', icon: '🌐', timeSpent: 120, lastUsed: '2024-12-10T10:30:00', dailyLimit: 180 },
    { id: '2', name: 'Slack', category: 'Communication', icon: '💬', timeSpent: 85, lastUsed: '2024-12-10T09:45:00', dailyLimit: 120 },
    { id: '3', name: 'VSCode', category: 'Development', icon: '💻', timeSpent: 180, lastUsed: '2024-12-10T11:15:00' },
    { id: '4', name: 'Spotify', category: 'Entertainment', icon: '🎵', timeSpent: 95, lastUsed: '2024-12-10T08:20:00', dailyLimit: 60 },
    { id: '5', name: 'Instagram', category: 'Social', icon: '📸', timeSpent: 145, lastUsed: '2024-12-10T12:10:00', dailyLimit: 90 },
    { id: '6', name: 'Figma', category: 'Design', icon: '🎨', timeSpent: 75, lastUsed: '2024-12-10T14:30:00' },
    { id: '7', name: 'Notion', category: 'Productivity', icon: '📝', timeSpent: 45, lastUsed: '2024-12-10T13:45:00' },
    { id: '8', name: 'Messages', category: 'Communication', icon: '📱', timeSpent: 60, lastUsed: '2024-12-10T15:20:00' },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'App Idea', content: 'Create a habit tracking app with gamification elements and social features.', type: 'idea', createdAt: '2024-12-08', lastEdited: '2024-12-10', tags: ['app', 'productivity', 'gamification'], color: '#FF6B6B' },
    { id: '2', title: 'Short Story Start', content: 'The city slept under a blanket of stars, unaware of the whispers in the digital winds...', type: 'story', createdAt: '2024-12-05', lastEdited: '2024-12-09', tags: ['fiction', 'sci-fi'], color: '#4ECDC4' },
    { id: '3', title: 'Project Thoughts', content: 'Consider implementing dark mode and better accessibility features.', type: 'general', createdAt: '2024-12-01', lastEdited: '2024-12-10', tags: ['design', 'accessibility'], color: '#45B7D1' },
  ]);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'general' as Note['type'],
    tags: [] as string[],
    color: '#45B7D1'
  });

  const [newTag, setNewTag] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dailyLimitModal, setDailyLimitModal] = useState<{ show: boolean; appId: string; limit: number }>({ 
    show: false, 
    appId: '', 
    limit: 0 
  });

  // Mock function to simulate app usage tracking
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate some apps getting more usage
      setAppUsage(prev => prev.map(app => {
        if (Math.random() > 0.7) {
          const increment = Math.floor(Math.random() * 5) + 1;
          return { ...app, timeSpent: app.timeSpent + increment };
        }
        return app;
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalTime = appUsage.reduce((sum, app) => sum + app.timeSpent, 0);
  const productiveTime = appUsage
    .filter(app => ['Productivity', 'Development', 'Design'].includes(app.category))
    .reduce((sum, app) => sum + app.timeSpent, 0);
  
  const categories = Array.from(new Set(appUsage.map(app => app.category)));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTimePercentage = (app: AppUsage) => {
    if (totalTime === 0) return 0;
    return (app.timeSpent / totalTime) * 100;
  };

  const getUsageColor = (app: AppUsage) => {
    if (app.dailyLimit && app.timeSpent > app.dailyLimit) {
      return '#FF6B6B';
    } else if (app.dailyLimit && app.timeSpent > app.dailyLimit * 0.8) {
      return '#FFD166';
    }
    return '#4ECDC4';
  };

  const getProductivityScore = () => {
    if (totalTime === 0) return 0;
    return Math.round((productiveTime / totalTime) * 100);
  };

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const now = new Date().toISOString().split('T')[0];
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      createdAt: now,
      lastEdited: now,
      tags: newNote.tags,
      color: newNote.color
    };

    setNotes([note, ...notes]);
    setNewNote({
      title: '',
      content: '',
      type: 'general',
      tags: [],
      color: '#45B7D1'
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      type: note.type,
      tags: note.tags,
      color: note.color
    });
  };

  const handleUpdateNote = () => {
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) return;

    const updatedNote: Note = {
      ...editingNote,
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      tags: newNote.tags,
      color: newNote.color,
      lastEdited: new Date().toISOString().split('T')[0]
    };

    setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
    setEditingNote(null);
    setNewNote({
      title: '',
      content: '',
      type: 'general',
      tags: [],
      color: '#45B7D1'
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newNote.tags.includes(newTag.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSetDailyLimit = (appId: string) => {
    const app = appUsage.find(a => a.id === appId);
    setDailyLimitModal({
      show: true,
      appId,
      limit: app?.dailyLimit || 60
    });
  };

  const saveDailyLimit = () => {
    setAppUsage(appUsage.map(app => 
      app.id === dailyLimitModal.appId 
        ? { ...app, dailyLimit: dailyLimitModal.limit }
        : app
    ));
    setDailyLimitModal({ show: false, appId: '', limit: 0 });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || note.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredApps = appUsage.filter(app => 
    selectedCategory === 'all' || app.category === selectedCategory
  );

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFD166', '#118AB2', '#EF476F', '#06D6A0'
  ];

  return (
    <div className="screen-time-container">
      <header className="screen-time-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h1>Screen Time & Notes</h1>
        <p>Track your app usage and capture your thoughts</p>
      </header>

      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === 'screentime' ? 'active' : ''}`}
          onClick={() => setActiveTab('screentime')}
        >
          📱 Screen Time
        </button>
        <button
          className={`main-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes & Ideas
        </button>
      </div>

      {activeTab === 'screentime' ? (
        <div className="screen-time-content">
          <div className="dashboard-header">
            <div className="time-range-selector">
              <button 
                className={`time-range-btn ${timeRange === 'today' ? 'active' : ''}`}
                onClick={() => setTimeRange('today')}
              >
                Today
              </button>
              <button 
                className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                This Week
              </button>
              <button 
                className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                This Month
              </button>
            </div>

            <div className="category-filter">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <span className="stat-value">{formatTime(totalTime)}</span>
                <span className="stat-label">Total Screen Time</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">{formatTime(productiveTime)}</span>
                <span className="stat-label">Productive Time</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-value">{getProductivityScore()}%</span>
                <span className="stat-label">Productivity Score</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📱</div>
              <div className="stat-info">
                <span className="stat-value">{appUsage.length}</span>
                <span className="stat-label">Apps Used</span>
              </div>
            </div>
          </div>

          <div className="app-usage-section">
            <h2>App Usage Breakdown</h2>
            <div className="apps-list">
              {filteredApps.map(app => (
                <div key={app.id} className="app-card">
                  <div className="app-header">
                    <div className="app-icon">{app.icon}</div>
                    <div className="app-info">
                      <h3>{app.name}</h3>
                      <span className="app-category">{app.category}</span>
                    </div>
                    <div className="app-actions">
                      <button 
                        className="limit-btn"
                        onClick={() => handleSetDailyLimit(app.id)}
                        title="Set daily limit"
                      >
                        ⚡
                      </button>
                    </div>
                  </div>
                  
                  <div className="app-stats">
                    <div className="time-info">
                      <span className="time-spent">{formatTime(app.timeSpent)}</span>
                      {app.dailyLimit && (
                        <span className="daily-limit">/ {formatTime(app.dailyLimit)} limit</span>
                      )}
                    </div>
                    <div className="last-used">
                      Last used: {new Date(app.lastUsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${getTimePercentage(app)}%`,
                          backgroundColor: getUsageColor(app)
                        }}
                      ></div>
                    </div>
                    <span className="progress-percentage">
                      {getTimePercentage(app).toFixed(1)}%
                    </span>
                  </div>

                  {app.dailyLimit && (
                    <div className="limit-status">
                      <div className="limit-progress">
                        <div 
                          className="limit-progress-fill"
                          style={{ 
                            width: `${Math.min(100, (app.timeSpent / app.dailyLimit) * 100)}%`,
                            backgroundColor: app.timeSpent > app.dailyLimit ? '#FF6B6B' : 
                                           app.timeSpent > app.dailyLimit * 0.8 ? '#FFD166' : '#4ECDC4'
                          }}
                        ></div>
                      </div>
                      <span className="limit-text">
                        {app.timeSpent > app.dailyLimit ? 'Over limit!' : 
                         app.timeSpent > app.dailyLimit * 0.8 ? 'Approaching limit' : 'Within limit'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="charts-section">
            <h2>Usage Distribution</h2>
            <div className="charts-grid">
              <div className="chart-container">
                <h3>By Category</h3>
                <div className="category-chart">
                  {categories.map(category => {
                    const categoryTime = appUsage
                      .filter(app => app.category === category)
                      .reduce((sum, app) => sum + app.timeSpent, 0);
                    const percentage = totalTime > 0 ? (categoryTime / totalTime) * 100 : 0;
                    
                    return (
                      <div key={category} className="category-item">
                        <div className="category-header">
                          <span className="category-name">{category}</span>
                          <span className="category-time">{formatTime(categoryTime)}</span>
                        </div>
                        <div className="category-bar">
                          <div 
                            className="category-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="category-percentage">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="chart-container">
                <h3>Top 5 Apps</h3>
                <div className="top-apps-chart">
                  {[...appUsage]
                    .sort((a, b) => b.timeSpent - a.timeSpent)
                    .slice(0, 5)
                    .map((app, index) => (
                      <div key={app.id} className="top-app-item">
                        <div className="app-rank">#{index + 1}</div>
                        <div className="app-details">
                          <span className="app-name">{app.icon} {app.name}</span>
                          <span className="app-time">{formatTime(app.timeSpent)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="notes-content">
          <div className="notes-header">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="notes-filter">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="idea">Ideas</option>
                <option value="story">Stories</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="notes-editor-section">
            <div className="editor-card">
              <h3>{editingNote ? 'Edit Note' : 'Create New Note'}</h3>
              
              <div className="editor-form">
                <input
                  type="text"
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="note-title-input"
                />

                <textarea
                  placeholder="Start writing your ideas, stories, or thoughts..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="note-content-input"
                  rows={6}
                />

                <div className="note-type-selection">
                  <label>Type:</label>
                  <div className="type-options">
                    <button
                      type="button"
                      className={`type-option ${newNote.type === 'idea' ? 'selected' : ''}`}
                      onClick={() => setNewNote({...newNote, type: 'idea'})}
                    >
                      💡 Idea
                    </button>
                    <button
                      type="button"
                      className={`type-option ${newNote.type === 'story' ? 'selected' : ''}`}
                      onClick={() => setNewNote({...newNote, type: 'story'})}
                    >
                      📖 Story
                    </button>
                    <button
                      type="button"
                      className={`type-option ${newNote.type === 'general' ? 'selected' : ''}`}
                      onClick={() => setNewNote({...newNote, type: 'general'})}
                    >
                      📝 General
                    </button>
                  </div>
                </div>

                <div className="color-selection">
                  <label>Color:</label>
                  <div className="color-options">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${newNote.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewNote({...newNote, color})}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="tags-section">
                  <label>Tags:</label>
                  <div className="tags-input-container">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button type="button" onClick={handleAddTag}>+ Add</button>
                  </div>
                  <div className="tags-list">
                    {newNote.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button 
                          type="button" 
                          className="remove-tag"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="editor-actions">
                  {editingNote && (
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setEditingNote(null);
                        setNewNote({
                          title: '',
                          content: '',
                          type: 'general',
                          tags: [],
                          color: '#45B7D1'
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    className="save-btn"
                    onClick={editingNote ? handleUpdateNote : handleAddNote}
                    disabled={!newNote.title.trim() || !newNote.content.trim()}
                  >
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                </div>
              </div>
            </div>

            <div className="notes-list-section">
              <h3>My Notes ({filteredNotes.length})</h3>
              {filteredNotes.length === 0 ? (
                <div className="empty-notes">
                  <p>No notes found. Create your first one!</p>
                </div>
              ) : (
                <div className="notes-grid">
                  {filteredNotes.map(note => (
                    <div 
                      key={note.id} 
                      className="note-card"
                      style={{ 
                        borderLeftColor: note.color,
                        backgroundColor: `${note.color}10`
                      }}
                    >
                      <div className="note-header">
                        <h4>{note.title}</h4>
                        <div className="note-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditNote(note)}
                            title="Edit note"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete note"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="note-content">
                        {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
                      </div>
                      
                      <div className="note-meta">
                        <div className="note-type">
                          <span className={`type-badge ${note.type}`}>
                            {note.type === 'idea' ? '💡 Idea' : 
                             note.type === 'story' ? '📖 Story' : '📝 General'}
                          </span>
                        </div>
                        <div className="note-dates">
                          <span className="date-info">Created: {note.createdAt}</span>
                          <span className="date-info">Edited: {note.lastEdited}</span>
                        </div>
                      </div>
                      
                      <div className="note-tags">
                        {note.tags.map(tag => (
                          <span key={tag} className="note-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {dailyLimitModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Set Daily Limit</h3>
            <div className="modal-body">
              <p>Set a daily time limit for this app (in minutes):</p>
              <input
                type="number"
                min="1"
                max="1440"
                value={dailyLimitModal.limit}
                onChange={(e) => setDailyLimitModal({
                  ...dailyLimitModal,
                  limit: parseInt(e.target.value) || 0
                })}
                className="limit-input"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setDailyLimitModal({ show: false, appId: '', limit: 0 })}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={saveDailyLimit}
              >
                Set Limit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenTime;