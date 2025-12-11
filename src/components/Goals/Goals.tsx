import React, { useState } from 'react';
import './Goals.css';

type GoalType = 'weekly' | 'monthly' | 'yearly';
type PlanStep = { id: string; text: string; completed: boolean };

interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  targetDate: string;
  completed: boolean;
  createdAt: string;
  plan: PlanStep[];
}

interface GoalsProps {
  onBack: () => void;
}

const Goals: React.FC<GoalsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<GoalType>('weekly');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete React Project',
      description: 'Finish the main components and styling',
      type: 'weekly',
      targetDate: '2024-12-15',
      completed: false,
      createdAt: '2024-12-10',
      plan: [
        { id: 'p1', text: 'Set up project structure', completed: true },
        { id: 'p2', text: 'Create main components', completed: false },
        { id: 'p3', text: 'Implement styling', completed: false },
      ]
    },
    {
      id: '2',
      title: 'Learn TypeScript',
      description: 'Master advanced TypeScript concepts',
      type: 'monthly',
      targetDate: '2025-01-10',
      completed: false,
      createdAt: '2024-12-01',
      plan: [
        { id: 'p4', text: 'Study generics', completed: true },
        { id: 'p5', text: 'Practice type guards', completed: false },
      ]
    },
    {
      id: '3',
      title: 'Launch Personal Website',
      description: 'Deploy portfolio website with projects',
      type: 'yearly',
      targetDate: '2025-06-30',
      completed: false,
      createdAt: '2024-11-20',
      plan: [
        { id: 'p6', text: 'Design wireframes', completed: true },
        { id: 'p7', text: 'Develop components', completed: false },
      ]
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'weekly' as GoalType,
    targetDate: '',
  });

  const [newPlanStep, setNewPlanStep] = useState<{ [key: string]: string }>({});

  const filteredGoals = goals.filter(goal => goal.type === activeTab);

  const handleAddGoal = () => {
    if (!newGoal.title.trim() || !newGoal.targetDate) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      type: newGoal.type,
      targetDate: newGoal.targetDate,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
      plan: []
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      type: 'weekly',
      targetDate: '',
    });
    setShowForm(false);
  };

  const handleAddPlanStep = (goalId: string) => {
    const stepText = newPlanStep[goalId];
    if (!stepText?.trim()) return;

    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          plan: [...goal.plan, {
            id: Date.now().toString(),
            text: stepText,
            completed: false
          }]
        };
      }
      return goal;
    }));

    setNewPlanStep({
      ...newPlanStep,
      [goalId]: ''
    });
  };

  const togglePlanStep = (goalId: string, stepId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          plan: goal.plan.map(step => 
            step.id === stepId ? { ...step, completed: !step.completed } : step
          )
        };
      }
      return goal;
    }));
  };

  const toggleGoalComplete = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const getTypeIcon = (type: GoalType) => {
    switch(type) {
      case 'weekly': return '📅';
      case 'monthly': return '📆';
      case 'yearly': return '🎯';
    }
  };

  const calculateProgress = (plan: PlanStep[]) => {
    if (plan.length === 0) return 0;
    const completed = plan.filter(step => step.completed).length;
    return Math.round((completed / plan.length) * 100);
  };

  return (
    <div className="goals-container">
      <header className="goals-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <div className="header-text">
            <h1>My Goals</h1>
          </div>
        </div>
      </header>

      <div className="tabs">
        {(['weekly', 'monthly', 'yearly'] as GoalType[]).map(type => (
          <button
            key={type}
            className={`tab-button ${activeTab === type ? 'active' : ''}`}
            onClick={() => setActiveTab(type)}
          >
            {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="content-area">
        <div className="goals-list">
          <div className="goals-header-row">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Goals ({filteredGoals.length})</h2>
            <button className="add-goal-fab" onClick={() => setShowForm(true)} title="Add New Goal">
              +
            </button>
          </div>
          
          {filteredGoals.length === 0 ? (
            <div className="empty-state">
              <p>No {activeTab} goals yet. Create your first one!</p>
            </div>
          ) : (
            <div className="goals-grid">
              {filteredGoals.map(goal => (
                <div key={goal.id} className={`goal-card ${goal.completed ? 'completed' : ''} ${expandedGoalId === goal.id ? 'expanded' : ''}`}>
                  <div className="goal-header" onClick={() => toggleGoalExpand(goal.id)}>
                    <div className="goal-title-section">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleGoalComplete(goal.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="goal-checkbox"
                      />
                      <h3>{goal.title}</h3>
                    </div>
                    <div className="goal-actions">
                      <span className="goal-type-badge">
                        {getTypeIcon(goal.type)} {goal.type}
                      </span>
                      <button 
                        className="delete-goal-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                        title="Delete goal"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {expandedGoalId === goal.id && (
                    <div className="goal-details">
                      {goal.description && (
                        <p className="goal-description">{goal.description}</p>
                      )}
                      
                      <div className="goal-meta">
                        <span className="date-info">
                          📅 Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                        <span className="date-info">
                          📅 Created: {new Date(goal.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Progress: {calculateProgress(goal.plan)}%</span>
                          <span>{goal.plan.filter(s => s.completed).length}/{goal.plan.length} steps</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${calculateProgress(goal.plan)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="plan-section">
                        <h4>Action Plan</h4>
                        {goal.plan.length > 0 && (
                          <div className="plan-steps">
                            {goal.plan.map(step => (
                              <div key={step.id} className="plan-step">
                                <input
                                  type="checkbox"
                                  checked={step.completed}
                                  onChange={() => togglePlanStep(goal.id, step.id)}
                                  className="step-checkbox"
                                />
                                <span className={step.completed ? 'completed-step' : ''}>
                                  {step.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="add-plan-step">
                          <input
                            type="text"
                            value={newPlanStep[goal.id] || ''}
                            onChange={(e) => setNewPlanStep({
                              ...newPlanStep,
                              [goal.id]: e.target.value
                            })}
                            placeholder="Add a step..."
                            onKeyPress={(e) => e.key === 'Enter' && handleAddPlanStep(goal.id)}
                          />
                          <button onClick={() => handleAddPlanStep(goal.id)}>+ Add</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Goal</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="goal-title">Goal Title *</label>
                <input
                  id="goal-title"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Enter goal title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="goal-description">Description</label>
                <textarea
                  id="goal-description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Goal Type</label>
                <div className="type-options">
                  {(['weekly', 'monthly', 'yearly'] as GoalType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`type-option ${newGoal.type === type ? 'selected' : ''}`}
                      onClick={() => setNewGoal({...newGoal, type})}
                    >
                      {getTypeIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="target-date">Target Date *</label>
                <input
                  id="target-date"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <button 
                className="submit-goal-btn"
                onClick={handleAddGoal}
                disabled={!newGoal.title.trim() || !newGoal.targetDate}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;