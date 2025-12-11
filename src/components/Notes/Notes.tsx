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
  pages?: number;
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
      color: '#FFF5E6',
      pages: 1
    },
    {
      id: '2',
      title: 'App Idea',
      content: 'Create a simple habit tracker app with daily notifications and streak counter.',
      type: 'idea',
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-05'),
      isFavorite: true,
      color: '#E6F3FF',
      pages: 1
    },
    {
      id: '3',
      title: 'Shopping List',
      content: 'Milk\nEggs\nBread\nCoffee\nFruits\nVegetables',
      type: 'note',
      createdAt: new Date('2024-12-08'),
      updatedAt: new Date('2024-12-09'),
      isFavorite: false,
      color: '#F0F7F0',
      pages: 1
    },
    {
      id: '4',
      title: 'Project Idea',
      content: 'Build a weather app with beautiful animations and location-based alerts.',
      type: 'idea',
      createdAt: new Date('2024-12-03'),
      updatedAt: new Date('2024-12-04'),
      isFavorite: false,
      color: '#F8F0FF',
      pages: 1
    },
    {
      id: '5',
      title: 'Meeting Notes',
      content: 'Team meeting:\n- Discussed new features\n- Assigned tasks\n- Set deadlines\n\nNext week agenda:\n1. Review progress\n2. Plan next sprint\n3. Update documentation\n\nAction items:\n• John: Complete API integration\n• Sarah: Design UI components\n• Mike: Write unit tests\n• Lisa: Prepare presentation',
      type: 'note',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-10'),
      isFavorite: false,
      color: '#FFF0F5',
      pages: 2
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [currentNote, setCurrentNote] = useState({
    title: '',
    content: '',
    type: 'note' as 'note' | 'idea',
    color: '#FFF5E6',
    pages: 1
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const filteredNotes = notes.filter(note => 
    activeTab === 'notes' ? note.type === 'note' : note.type === 'idea'
  );

  const calculatePages = (content: string): number => {
    const words = content.trim().split(/\s+/).length;
    const pages = Math.max(1, Math.ceil(words / 200));
    return pages;
  };

  const resetForm = () => {
    setCurrentNote({
      title: '',
      content: '',
      type: activeTab === 'notes' ? 'note' : 'idea',
      color: '#FFF5E6',
      pages: 1
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

    const pages = calculatePages(currentNote.content);

    if (isEditing && editingNoteId) {
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? {
              ...note,
              title: currentNote.title || 'Untitled',
              content: currentNote.content,
              updatedAt: new Date(),
              color: currentNote.color,
              pages
            }
          : note
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentNote.title || 'Untitled',
        content: currentNote.content,
        type: currentNote.type,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        color: currentNote.color,
        pages
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
      color: note.color,
      pages: note.pages || 1
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
    { name: 'Cream', value: '#FFF5E6' },
    { name: 'Blue', value: '#E6F3FF' },
    { name: 'Green', value: '#F0F7F0' },
    { name: 'Lavender', value: '#F8F0FF' },
    { name: 'Pink', value: '#FFF0F5' },
    { name: 'Mint', value: '#F0FFF4' },
    { name: 'Peach', value: '#FFE8E0' },
    { name: 'Yellow', value: '#FFFDE6' }
  ];

  useEffect(() => {
    if (isCreating && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (!isCreating) {
      resetForm();
    }
  }, [activeTab]);

  const getNotePreview = (content: string, maxLines: number = 3) => {
    const lines = content.split('\n').slice(0, maxLines);
    return lines.join('\n');
  };

  return (
    <div className="notes-container">
      {/* Header */}
<header className="notes-header">
  <div className="header-content">
    <button className="back-button" onClick={onBack}>
      ← Back
    </button>
    <div className="header-center">
      <h1>My Notebook</h1>
    </div>
    <div className="header-right"></div> {/* Empty div for spacing */}
  </div>
</header>

      {/* Tabs Side by Side */}
      <div className="tabs-row">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <span className="tab-text">Notes</span>
          </button>
          <button 
            className={`tab ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            <span className="tab-text">Ideas</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="notes-main">
        {/* Notes Grid */}
        {!isCreating && filteredNotes.length > 0 && (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className="note-book"
                style={{ backgroundColor: note.color }}
              >
                <div className="book-cover">
                  <div className="book-spine"></div>
                  <div className="book-content">
                    <div className="book-header">
                      <div className="book-title-section">
                        <h3 className="book-title">{note.title}</h3>
                        <button 
                          className={`favorite-btn ${note.isFavorite ? 'favorited' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(note.id);
                          }}
                          title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {note.isFavorite ? '★' : '☆'}
                        </button>
                      </div>
                      <div className="book-meta">
                        <span className="book-date">{formatDate(note.updatedAt)}</span>
                        <span className="book-pages">{note.pages || 1} page{note.pages !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="book-preview">
                      <div className="preview-content">
                        {getNotePreview(note.content).split('\n').map((line, index) => (
                          <p key={index} className="preview-line">{line}</p>
                        ))}
                        {note.content.split('\n').length > 3 && (
                          <span className="preview-more">...</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="book-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                      >
                        <span className="action-text">Edit</span>
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <span className="action-text">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredNotes.length === 0 && !isCreating && (
          <div className="empty-state">
            <div className="empty-book">
              <div className="book-icon">📖</div>
              <h3>No {activeTab === 'notes' ? 'notes' : 'ideas'} yet</h3>
              <p>
                {activeTab === 'notes' 
                  ? 'Start your first notebook and add multiple pages!' 
                  : 'Capture your creative ideas in your digital notebook!'}
              </p>
              <button 
                className="create-first-btn"
                onClick={() => setIsCreating(true)}
              >
                + Create {activeTab === 'notes' ? 'Note' : 'Idea'}
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="form-overlay">
            <div 
              className="create-form book-form"
              ref={formRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-book-cover">
                <div className="form-spine"></div>
                <div className="form-content">
                  <div className="form-header">
                    <div className="form-title">
                      <h3>
                        {isEditing ? 'Edit' : 'Create New'} {activeTab === 'notes' ? 'Note' : 'Idea'}
                      </h3>
                    </div>
                    <button 
                      className="form-close-btn"
                      onClick={() => {
                        setIsCreating(false);
                        resetForm();
                      }}
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="form-body">
                    <div className="form-group">
                      <div className="input-label">Title</div>
                      <input
                        ref={titleRef}
                        type="text"
                        className="title-input"
                        placeholder={`Enter ${activeTab === 'notes' ? 'note' : 'idea'} title...`}
                        value={currentNote.title}
                        onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <div className="input-label">Content</div>
                      <textarea
                        ref={contentRef}
                        className="content-input"
                        placeholder={`Write your ${activeTab === 'notes' ? 'note content...' : 'idea description...'}`}
                        value={currentNote.content}
                        onChange={(e) => {
                          const newContent = e.target.value;
                          setCurrentNote({
                            ...currentNote, 
                            content: newContent,
                            pages: calculatePages(newContent)
                          });
                        }}
                        rows={10}
                      />
                      <div className="pages-counter">
                        <span className="pages-text">
                          Pages: {calculatePages(currentNote.content)} • 
                          Words: {currentNote.content.trim().split(/\s+/).filter(w => w.length > 0).length}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="input-label">Cover Color</div>
                      <div className="color-picker-grid">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            className={`color-option ${currentNote.color === color.value ? 'selected' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setCurrentNote({...currentNote, color: color.value})}
                            title={color.name}
                          >
                            {currentNote.color === color.value && (
                              <span className="color-check">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-footer">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Button */}
      {!isCreating && (
        <button 
          className="add-button"
          onClick={() => setIsCreating(true)}
          title={`Add ${activeTab === 'notes' ? 'Note' : 'Idea'}`}
        >
          +
        </button>
      )}

      {/* Simplified Stats Footer */}
      <footer className="stats-footer">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-info">
              <span className="stat-number">{notes.filter(n => n.type === 'note').length}</span>
              <span className="stat-label">NOTES</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-info">
              <span className="stat-number">{notes.filter(n => n.type === 'idea').length}</span>
              <span className="stat-label">IDEAS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Notes;