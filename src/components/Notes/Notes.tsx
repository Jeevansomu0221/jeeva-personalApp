// Notes.tsx
import React, { useState, useEffect, useRef } from 'react';
import './Notes.css';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'idea';
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  color: string;
}

interface NotesProps {
  onBack: () => void;
}

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'ideas'>('notes');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'My First Note',
      content: 'This is my first note. I can add multiple pages to this note.',
      type: 'note',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01'),
      isFavorite: true,
      color: '#FFE4E1'
    },
    {
      id: '2',
      title: 'App Idea',
      content: 'Create a simple habit tracker app with daily notifications and streak counter.',
      type: 'idea',
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-05'),
      isFavorite: true,
      color: '#E6E6FA'
    },
    {
      id: '3',
      title: 'Shopping List',
      content: 'Milk\nEggs\nBread\nCoffee\nFruits\nVegetables',
      type: 'note',
      createdAt: new Date('2024-12-08'),
      updatedAt: new Date('2024-12-09'),
      isFavorite: false,
      color: '#F0FFF0'
    },
    {
      id: '4',
      title: 'Project Idea',
      content: 'Build a weather app with beautiful animations and location-based alerts.',
      type: 'idea',
      createdAt: new Date('2024-12-03'),
      updatedAt: new Date('2024-12-04'),
      isFavorite: false,
      color: '#F0F8FF'
    },
    {
      id: '5',
      title: 'Meeting Notes',
      content: 'Team meeting:\n- Discussed new features\n- Assigned tasks\n- Set deadlines',
      type: 'note',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-10'),
      isFavorite: false,
      color: '#FFFACD'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [currentNote, setCurrentNote] = useState({
    title: '',
    content: '',
    type: 'note' as 'note' | 'idea',
    color: '#FFFFFF'
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const filteredNotes = notes.filter(note => 
    activeTab === 'notes' ? note.type === 'note' : note.type === 'idea'
  );

  const resetForm = () => {
    setCurrentNote({
      title: '',
      content: '',
      type: activeTab === 'notes' ? 'note' : 'idea',
      color: '#FFFFFF'
    });
    setEditingNoteId(null);
    setIsEditing(false);
  };

  const handleSaveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) {
      setIsCreating(false);
      resetForm();
      return;
    }

    if (isEditing && editingNoteId) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? {
              ...note,
              title: currentNote.title || 'Untitled',
              content: currentNote.content,
              updatedAt: new Date(),
              color: currentNote.color
            }
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentNote.title || 'Untitled',
        content: currentNote.content,
        type: currentNote.type,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        color: currentNote.color
      };
      setNotes([newNote, ...notes]);
    }

    setIsCreating(false);
    resetForm();
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote({
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color
    });
    setEditingNoteId(note.id);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const colorOptions = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Pink', value: '#FFE4E1' },
    { name: 'Lavender', value: '#E6E6FA' },
    { name: 'Mint', value: '#F0FFF0' },
    { name: 'Blue', value: '#F0F8FF' },
    { name: 'Lemon', value: '#FFFACD' },
    { name: 'Peach', value: '#FFDAB9' },
    { name: 'Gray', value: '#F5F5F5' }
  ];

  // Focus on title input when creating new note
  useEffect(() => {
    if (isCreating && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating]);

  // Update note type when tab changes
  useEffect(() => {
    if (!isCreating) {
      resetForm();
    }
  }, [activeTab]);

  return (
    <div className="notes-container">
      {/* Header */}
      <header className="notes-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>My Notes</h1>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes
        </button>
        <button 
          className={`tab ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          💡 Ideas
        </button>
      </div>

      {/* Content Area */}
      <div className="notes-content">
        {/* Empty State */}
        {filteredNotes.length === 0 && !isCreating && (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'notes' ? '📝' : '💡'}
            </div>
            <h3>No {activeTab === 'notes' ? 'notes' : 'ideas'} yet</h3>
            <p>
              {activeTab === 'notes' 
                ? 'Create your first note and add multiple pages!' 
                : 'Capture your creative ideas with descriptions!'}
            </p>
            <button 
              className="create-btn"
              onClick={() => setIsCreating(true)}
            >
              + Create {activeTab === 'notes' ? 'Note' : 'Idea'}
            </button>
          </div>
        )}

        {/* Notes List */}
        {!isCreating && filteredNotes.length > 0 && (
          <div className="notes-list">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                style={{ backgroundColor: note.color }}
              >
                <div className="note-header">
                  <div className="note-title-section">
                    <h3>{note.title}</h3>
                    <button 
                      className={`favorite-btn ${note.isFavorite ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(note.id)}
                    >
                      {note.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="note-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditNote(note)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="note-content">
                  {note.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                
                <div className="note-footer">
                  <span className="note-date">
                    {formatDate(note.updatedAt)}
                  </span>
                  <span className="note-type">
                    {note.type === 'note' ? '📝 Note' : '💡 Idea'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="create-form">
            <div className="form-header">
              <h3>
                {isEditing ? 'Edit' : 'Create'} {activeTab === 'notes' ? 'Note' : 'Idea'}
              </h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <input
                ref={titleRef}
                type="text"
                className="title-input"
                placeholder={`${activeTab === 'notes' ? 'Note' : 'Idea'} title...`}
                value={currentNote.title}
                onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <textarea
                ref={contentRef}
                className="content-input"
                placeholder={`Write your ${activeTab === 'notes' ? 'note content...' : 'idea description...'}`}
                value={currentNote.content}
                onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
                rows={8}
              />
              {activeTab === 'notes' && (
                <div className="pages-info">
                  <span className="pages-icon">📄</span>
                  <span>Pages will be added automatically as you write more</span>
                </div>
              )}
            </div>

            <div className="color-picker">
              <p className="color-label">Choose color:</p>
              <div className="color-options">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    className={`color-option ${currentNote.color === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setCurrentNote({...currentNote, color: color.value})}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleSaveNote}
                disabled={!currentNote.title.trim() && !currentNote.content.trim()}
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!isCreating && (
        <button 
          className="fab"
          onClick={() => setIsCreating(true)}
        >
          +
        </button>
      )}

      {/* Quick Stats */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">
            {notes.filter(n => n.type === 'note').length}
          </span>
          <span className="stat-label">Notes</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {notes.filter(n => n.type === 'idea').length}
          </span>
          <span className="stat-label">Ideas</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {notes.filter(n => n.isFavorite).length}
          </span>
          <span className="stat-label">Favorites</span>
        </div>
      </div>
    </div>
  );
};

export default Notes;