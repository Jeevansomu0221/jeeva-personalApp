import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Filter } from 'lucide-react';
import './Tasks.css';

interface TasksProps {
  onBack: () => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  createdAt: Date;
  completedAt?: Date;
}

const Tasks: React.FC<TasksProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'Personal',
    dueDate: ''
  });

  const categories = ['Personal', 'Work', 'Health', 'Study', 'Shopping', 'Other'];
  const priorities = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
  ];

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jeeva-tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTasks(parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined
      })));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length >= 0) {
      localStorage.setItem('jeeva-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate,
      createdAt: new Date()
    };

    setTasks([task, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Personal',
      dueDate: ''
    });
    setShowAddForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date() : undefined
        };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const clearCompleted = () => {
    if (window.confirm('Delete all completed tasks?')) {
      setTasks(tasks.filter(task => !task.completed));
    }
  };

  const getFilteredTasks = (): Task[] => {
    let filtered = tasks;

    // Filter by completion status
    if (filter === 'active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Sort
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, completionRate };
  };

  const getPriorityColor = (priority: string): string => {
    const p = priorities.find(pr => pr.value === priority);
    return p?.color || '#6b7280';
  };

  const isOverdue = (dueDate: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="feature-container">
      <button onClick={onBack} className="back-button">
        ← Back to Home
      </button>

      <div className="feature-content">
        <div className="tasks-header">
          <h2 className="feature-title">Tasks</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="add-task-btn">
            <Plus size={24} />
          </button>
        </div>

        {/* Stats */}
        <div className="tasks-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Progress</div>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="add-task-form">
            <h3>Create New Task</h3>
            
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Buy groceries, Study for exam"
                className="text-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add details about the task..."
                className="textarea-input"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="select-input"
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="select-input"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Due Date (Optional)</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="date-input"
              />
            </div>

            <div className="form-actions">
              <button onClick={addTask} className="save-btn">Add Task</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <Filter size={18} />
            <button
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            >
              Completed
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>

        {/* Tasks List */}
        <div className="tasks-list">
          {filteredTasks.length === 0 && (
            <div className="empty-state">
              <CheckCircle size={64} color="#4b5563" />
              <p>
                {filter === 'completed' ? 'No completed tasks yet' : 
                 filter === 'active' ? 'No active tasks' : 
                 'No tasks yet'}
              </p>
              <small>Click + to create your first task</small>
            </div>
          )}

          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? 'completed' : ''} priority-${task.priority}`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="task-checkbox"
              >
                {task.completed ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <Circle size={24} color="#6b7280" />
                )}
              </button>

              <div className="task-content">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
                <div className="task-meta">
                  <span className="task-category">{task.category}</span>
                  <span
                    className="task-priority"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className={`task-due-date ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}`}>
                      <Calendar size={14} />
                      {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && !task.completed && ' ⚠️'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="delete-task-btn"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Clear Completed Button */}
        {stats.completed > 0 && (
          <div className="clear-completed-section">
            <button onClick={clearCompleted} className="clear-completed-btn">
              Clear {stats.completed} Completed Task{stats.completed > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;