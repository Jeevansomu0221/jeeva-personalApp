import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Target, DollarSign, 
  User, Briefcase, FileText, Link as LinkIcon, 
  Plus, Trash2, Edit2, Save, X, Eye,
  Flame
} from 'lucide-react';
import './Growth.css';

interface GrowthProps {
  onBack: () => void;
}

interface FitnessMetric {
  id: string;
  name: string;
  icon: string;
  unit: string;
  color: string;
  currentValue: number;
  targetValue: number;
  history: DailyRecord[];
}

interface DailyRecord {
  date: string;
  value: number;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  fileUrl: string;
}

interface ProfileData {
  resumeUrl: string;
  portfolioUrl: string;
  linkedInUrl: string;
  githubUrl: string;
  balance: number;
  targetBalance: number;
  resumeFile?: string;
  portfolioFile?: string;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

const Growth: React.FC<GrowthProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'fitness' | 'career' | 'finance'>('fitness');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddCertificate, setShowAddCertificate] = useState(false);
  const [showUpdateBalance, setShowUpdateBalance] = useState(false);
  const [showUpdateTarget, setShowUpdateTarget] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [newRecordValue, setNewRecordValue] = useState<number>(0);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [newMetric, setNewMetric] = useState({
    name: '',
    unit: '',
    icon: '💪',
    color: '#ef4444',
    targetValue: 0
  });

  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  const [updateBalanceValue, setUpdateBalanceValue] = useState<number>(0);
  const [updateTargetValue, setUpdateTargetValue] = useState<number>(0);

  // Fitness Metrics
  const [fitnessMetrics, setFitnessMetrics] = useState<FitnessMetric[]>([
    {
      id: '1',
      name: 'Push-ups',
      icon: '💪',
      unit: 'reps',
      color: '#ef4444',
      currentValue: 25,
      targetValue: 100,
      history: []
    },
    {
      id: '2',
      name: 'Pull-ups',
      icon: '🏋️',
      unit: 'reps',
      color: '#f59e0b',
      currentValue: 8,
      targetValue: 20,
      history: []
    },
    {
      id: '3',
      name: 'Running',
      icon: '🏃',
      unit: 'km',
      color: '#10b981',
      currentValue: 3,
      targetValue: 5,
      history: []
    },
    {
      id: '4',
      name: 'Meditation',
      icon: '🧘',
      unit: 'minutes',
      color: '#3b82f6',
      currentValue: 15,
      targetValue: 30,
      history: []
    }
  ]);

  // Career Data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      name: 'React Certification',
      issuer: 'React Academy',
      date: '2024-01-15',
      fileUrl: 'https://example.com/cert1.pdf'
    }
  ]);

  const [profileData, setProfileData] = useState<ProfileData>({
    resumeUrl: '',
    portfolioUrl: '',
    linkedInUrl: 'https://linkedin.com/in/jeeva',
    githubUrl: 'https://github.com/jeeva',
    balance: 15000,
    targetBalance: 25000
  });

  // Finance Data
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      date: '2024-12-10',
      description: 'Groceries',
      amount: 1500,
      category: 'Food'
    },
    {
      id: '2',
      date: '2024-12-09',
      description: 'Fuel',
      amount: 800,
      category: 'Transport'
    },
    {
      id: '3',
      date: '2024-12-08',
      description: 'Movie Tickets',
      amount: 600,
      category: 'Entertainment'
    }
  ]);

  // Editing states
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState<number>(0);

  // Load data from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem('jeeva-growth-metrics');
    const savedCertificates = localStorage.getItem('jeeva-certificates');
    const savedProfile = localStorage.getItem('jeeva-profile');
    const savedExpenses = localStorage.getItem('jeeva-expenses');

    if (savedMetrics) {
      const parsed = JSON.parse(savedMetrics);
      setFitnessMetrics(parsed.map((m: any) => ({
        ...m,
        history: m.history || []
      })));
    }

    if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setProfileData(profile);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('jeeva-growth-metrics', JSON.stringify(fitnessMetrics));
  }, [fitnessMetrics]);

  useEffect(() => {
    localStorage.setItem('jeeva-certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('jeeva-profile', JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem('jeeva-expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Add fitness record
  const addRecord = () => {
    if (!selectedMetric || newRecordValue <= 0) {
      alert('Please enter a valid value');
      return;
    }

    setFitnessMetrics(fitnessMetrics.map(metric => {
      if (metric.id === selectedMetric) {
        const newRecord: DailyRecord = {
          date: recordDate,
          value: newRecordValue
        };

        const updatedHistory = [...metric.history, newRecord];
        updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          ...metric,
          currentValue: newRecordValue,
          history: updatedHistory
        };
      }
      return metric;
    }));

    setShowAddRecord(false);
    setNewRecordValue(0);
    setRecordDate(new Date().toISOString().split('T')[0]);
    setSelectedMetric(null);
  };

  // Add new fitness metric
  const addNewMetric = () => {
    if (!newMetric.name.trim() || !newMetric.unit.trim() || newMetric.targetValue <= 0) {
      alert('Please fill all fields with valid values');
      return;
    }

    const newFitnessMetric: FitnessMetric = {
      id: Date.now().toString(),
      name: newMetric.name,
      icon: newMetric.icon,
      unit: newMetric.unit,
      color: newMetric.color,
      currentValue: 0,
      targetValue: newMetric.targetValue,
      history: []
    };

    setFitnessMetrics([...fitnessMetrics, newFitnessMetric]);
    setShowAddMetric(false);
    setNewMetric({
      name: '',
      unit: '',
      icon: '💪',
      color: '#ef4444',
      targetValue: 0
    });
  };

  // Delete fitness metric
  const deleteMetric = (id: string) => {
    if (window.confirm('Are you sure you want to delete this metric?')) {
      setFitnessMetrics(fitnessMetrics.filter(metric => metric.id !== id));
    }
  };

  // Calculate streak
  const calculateStreak = (history: DailyRecord[]): number => {
    if (history.length === 0) return 0;

    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length; i++) {
      const recordDate = new Date(sortedHistory[i].date);
      recordDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Get today's progress
  const getTodayProgress = (history: DailyRecord[]): number => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = history.find(r => r.date === today);
    return todayRecord?.value || 0;
  };

  // Add certificate
  const addCertificate = () => {
    if (!newCertificate.name.trim() || !newCertificate.issuer.trim()) {
      alert('Please fill all fields');
      return;
    }

    const newCert: Certificate = {
      id: Date.now().toString(),
      name: newCertificate.name,
      issuer: newCertificate.issuer,
      date: newCertificate.date,
      fileUrl: '#' // Placeholder for file upload
    };

    setCertificates([newCert, ...certificates]);
    setShowAddCertificate(false);
    setNewCertificate({
      name: '',
      issuer: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Delete certificate
  const deleteCertificate = (id: string) => {
    if (window.confirm('Delete this certificate?')) {
      setCertificates(certificates.filter(c => c.id !== id));
    }
  };

  const getProgressPercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Update metric target
  const updateMetricTarget = (metricId: string, newTarget: number) => {
    setFitnessMetrics(fitnessMetrics.map(metric => {
      if (metric.id === metricId) {
        return { ...metric, targetValue: newTarget };
      }
      return metric;
    }));
    setEditingMetric(null);
  };

  // Update balance
  const updateBalance = () => {
    if (updateBalanceValue < 0) {
      alert('Please enter a valid balance');
      return;
    }

    setProfileData({ ...profileData, balance: updateBalanceValue });
    setShowUpdateBalance(false);
    setUpdateBalanceValue(0);
  };

  // Update target balance
  const updateTargetBalance = () => {
    if (updateTargetValue < 0) {
      alert('Please enter a valid target balance');
      return;
    }

    setProfileData({ ...profileData, targetBalance: updateTargetValue });
    setShowUpdateTarget(false);
    setUpdateTargetValue(0);
  };

  // Add expense
  const addExpense = () => {
    if (!newExpense.description || newExpense.amount <= 0) {
      alert('Please enter valid expense details');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      date: newExpense.date,
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category
    };

    setExpenses([expense, ...expenses]);
    setShowAddExpense(false);
    setNewExpense({
      description: '',
      amount: 0,
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    if (window.confirm('Delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Calculate monthly expenses
  const getMonthlyExpenses = (): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="growth-container">
      {/* Header */}
      <div className="growth-header">
        <button onClick={onBack} className="growth-back-button">
          ← Back
        </button>
        <h1 className="growth-title">Growth Tracker</h1>
        <div style={{width: '60px'}}></div>
      </div>

      {/* Tabs */}
      <div className="growth-tabs-container">
        <div className="growth-tabs">
          <button
            onClick={() => setActiveTab('fitness')}
            className={`growth-tab ${activeTab === 'fitness' ? 'active' : ''}`}
          >
            <Target size={18} />
            <span className="growth-tab-text">Fitness & Health</span>
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`growth-tab ${activeTab === 'career' ? 'active' : ''}`}
          >
            <Briefcase size={18} />
            <span className="growth-tab-text">Career & Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`growth-tab ${activeTab === 'finance' ? 'active' : ''}`}
          >
            <DollarSign size={18} />
            <span className="growth-tab-text">Finance</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="growth-content">
        {/* FITNESS TAB */}
        {activeTab === 'fitness' && (
          <div className="growth-fitness-content">
            {/* Overview Cards */}
            <div className="growth-overview-row">
              <div className="growth-overview-card">
                <Flame size={20} color="#ef4444" />
                <div className="growth-overview-text">
                  <div className="growth-overview-label">Total Streak</div>
                  <div className="growth-overview-value">
                    {Math.max(...fitnessMetrics.map(m => calculateStreak(m.history)))} days
                  </div>
                </div>
              </div>
              <div className="growth-overview-card">
                <TrendingUp size={20} color="#10b981" />
                <div className="growth-overview-text">
                  <div className="growth-overview-label">Active</div>
                  <div className="growth-overview-value">
                    {fitnessMetrics.filter(m => m.history.length > 0).length}/{fitnessMetrics.length}
                  </div>
                </div>
              </div>
              <div className="growth-overview-card">
                <Award size={20} color="#f59e0b" />
                <div className="growth-overview-text">
                  <div className="growth-overview-label">Achieved</div>
                  <div className="growth-overview-value">
                    {fitnessMetrics.filter(m => m.currentValue >= m.targetValue).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Metric Button */}
            <button 
              className="growth-add-metric-btn"
              onClick={() => setShowAddMetric(true)}
            >
              <Plus size={18} />
              Add New Fitness Goal
            </button>

            {/* Metrics Grid */}
            <div className="growth-metrics-grid">
              {fitnessMetrics.map(metric => {
                const streak = calculateStreak(metric.history);
                const todayValue = getTodayProgress(metric.history);
                const progress = getProgressPercentage(metric.currentValue, metric.targetValue);

                return (
                  <div key={metric.id} className="growth-metric-card" style={{borderColor: metric.color}}>
                    <div className="growth-metric-header">
                      <span className="growth-metric-icon">{metric.icon}</span>
                      <div className="growth-metric-title">
                        <div className="growth-metric-name">{metric.name}</div>
                        <div className="growth-metric-unit">{metric.unit}</div>
                      </div>
                      <div className="growth-metric-actions">
                        {streak > 0 && (
                          <div className="growth-streak-badge">
                            <Flame size={12} color="#ef4444" />
                            <span className="growth-streak-text">{streak}d</span>
                          </div>
                        )}
                        <button
                          onClick={() => deleteMetric(metric.id)}
                          className="growth-delete-metric-btn"
                          title="Delete metric"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="growth-metric-progress">
                      <div className="growth-progress-bar-container">
                        <div 
                          className="growth-progress-bar-fill"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: metric.color
                          }}
                        />
                      </div>
                      <div className="growth-progress-text">{progress}%</div>
                    </div>

                    {/* Values */}
                    <div className="growth-metric-values">
                      <div className="growth-metric-value">
                        <div className="growth-value-label">Current</div>
                        <div className="growth-value-number" style={{color: metric.color}}>
                          {metric.currentValue}
                        </div>
                      </div>
                      <div className="growth-metric-value">
                        <div className="growth-value-label">Target</div>
                        <div className="growth-value-number">
                          {editingMetric === metric.id ? (
                            <div className="growth-target-edit">
                              <input
                                type="number"
                                value={tempTarget}
                                onChange={(e) => setTempTarget(parseFloat(e.target.value) || 0)}
                                className="growth-target-input"
                                autoFocus
                              />
                              <button
                                onClick={() => updateMetricTarget(metric.id, tempTarget)}
                                className="growth-target-save"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <>
                              {metric.targetValue}
                              <button
                                onClick={() => {
                                  setEditingMetric(metric.id);
                                  setTempTarget(metric.targetValue);
                                }}
                                className="growth-edit-btn"
                              >
                                <Edit2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="growth-metric-value">
                        <div className="growth-value-label">Today</div>
                        <div className="growth-value-number">{todayValue}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="growth-metric-actions-row">
                      <button
                        onClick={() => {
                          setSelectedMetric(metric.id);
                          setNewRecordValue(metric.currentValue);
                          setShowAddRecord(true);
                        }}
                        className="growth-add-record-btn"
                      >
                        <Plus size={14} />
                        Record
                      </button>
                      {metric.history.length > 0 && (
                        <button
                          onClick={() => {
                            const metricWithHistory = fitnessMetrics.find(m => m.id === metric.id);
                            if (metricWithHistory) {
                              const historyText = metricWithHistory.history
                                .slice(0, 5)
                                .map(h => `${h.date}: ${h.value} ${metric.unit}`)
                                .join('\n');
                              alert(`Recent history:\n\n${historyText}`);
                            }
                          }}
                          className="growth-view-history-btn"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CAREER TAB */}
        {activeTab === 'career' && (
          <div className="growth-career-content">
            {/* Profile Section */}
            <div className="growth-profile-card">
              <div className="growth-card-header">
                <User size={20} color="#6366f1" />
                <h3 className="growth-card-title">Professional Profile</h3>
              </div>
              
              <div className="growth-profile-links">
                <div className="growth-profile-link">
                  <LinkIcon size={16} />
                  <input
                    type="text"
                    value={profileData.linkedInUrl}
                    onChange={(e) => setProfileData({...profileData, linkedInUrl: e.target.value})}
                    placeholder="LinkedIn URL"
                    className="growth-profile-input"
                  />
                </div>
                <div className="growth-profile-link">
                  <LinkIcon size={16} />
                  <input
                    type="text"
                    value={profileData.githubUrl}
                    onChange={(e) => setProfileData({...profileData, githubUrl: e.target.value})}
                    placeholder="GitHub URL"
                    className="growth-profile-input"
                  />
                </div>
                <div className="growth-profile-link">
                  <FileText size={16} />
                  <input
                    type="text"
                    value={profileData.resumeUrl}
                    onChange={(e) => setProfileData({...profileData, resumeUrl: e.target.value})}
                    placeholder="Resume URL (Google Drive/Dropbox)"
                    className="growth-profile-input"
                  />
                </div>
                <div className="growth-profile-link">
                  <Briefcase size={16} />
                  <input
                    type="text"
                    value={profileData.portfolioUrl}
                    onChange={(e) => setProfileData({...profileData, portfolioUrl: e.target.value})}
                    placeholder="Portfolio URL"
                    className="growth-profile-input"
                  />
                </div>
              </div>
            </div>

            {/* Certificates Section */}
            <div className="growth-certificates-card">
              <div className="growth-card-header">
                <Award size={20} color="#f59e0b" />
                <h3 className="growth-card-title">Certificates ({certificates.length})</h3>
                <button onClick={() => setShowAddCertificate(true)} className="growth-add-btn-main">
                  <Plus size={20} />
                </button>
              </div>

              {certificates.length === 0 ? (
                <div className="growth-empty-state">
                  <Award size={32} color="#4b5563" />
                  <p className="growth-empty-text">No certificates yet</p>
                </div>
              ) : (
                <div className="growth-certificates-list">
                  {certificates.slice(0, 4).map(cert => (
                    <div key={cert.id} className="growth-certificate-item">
                      <div className="growth-cert-icon">📜</div>
                      <div className="growth-cert-info">
                        <div className="growth-cert-name">{cert.name}</div>
                        <div className="growth-cert-issuer">{cert.issuer} • {cert.date}</div>
                      </div>
                      <div className="growth-cert-actions">
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="growth-view-btn-mini">
                          <Eye size={14} />
                        </a>
                        <button onClick={() => deleteCertificate(cert.id)} className="growth-delete-btn-mini">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {certificates.length > 4 && (
                    <div className="growth-more-text">+ {certificates.length - 4} more</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="growth-finance-content">
            {/* Balance Cards */}
            <div className="growth-balance-row">
              <div className="growth-balance-card">
                <DollarSign size={24} color="#10b981" />
                <div className="growth-balance-text">
                  <div className="growth-balance-label">Current Balance</div>
                  <div className="growth-balance-amount">₹{profileData.balance.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => {
                    setUpdateBalanceValue(profileData.balance);
                    setShowUpdateBalance(true);
                  }}
                  className="growth-update-balance-btn"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <div className="growth-balance-card">
                <Target size={24} color="#f59e0b" />
                <div className="growth-balance-text">
                  <div className="growth-balance-label">Target Balance</div>
                  <div className="growth-balance-amount target">₹{profileData.targetBalance.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => {
                    setUpdateTargetValue(profileData.targetBalance);
                    setShowUpdateTarget(true);
                  }}
                  className="growth-update-balance-btn"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="growth-summary-card">
              <h3 className="growth-card-title">Monthly Summary</h3>
              <div className="growth-summary-stats">
                <div className="growth-summary-item">
                  <span>Expenses:</span>
                  <strong className="expense-amount">₹{getMonthlyExpenses().toLocaleString('en-IN')}</strong>
                </div>
                <div className="growth-summary-item">
                  <span>Remaining:</span>
                  <strong className={profileData.balance - getMonthlyExpenses() >= profileData.targetBalance ? 'positive' : 'warning'}>
                    ₹{Math.max(0, profileData.balance - getMonthlyExpenses()).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="growth-summary-item">
                  <span>Progress:</span>
                  <strong>
                    {profileData.balance > 0 
                      ? Math.round((profileData.balance / profileData.targetBalance) * 100) 
                      : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="growth-expenses-card">
              <div className="growth-card-header">
                <h3 className="growth-card-title">Recent Expenses ({expenses.length})</h3>
                <button onClick={() => setShowAddExpense(true)} className="growth-add-btn-main">
                  <Plus size={20} />
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="growth-empty-state">
                  <DollarSign size={32} color="#4b5563" />
                  <p className="growth-empty-text">No expenses recorded</p>
                </div>
              ) : (
                <div className="growth-expenses-list">
                  {expenses.slice(0, 5).map(expense => (
                    <div key={expense.id} className="growth-expense-item">
                      <div className="growth-expense-info">
                        <div className="growth-expense-description">{expense.description}</div>
                        <div className="growth-expense-meta">
                          <span className="growth-expense-category">{expense.category}</span>
                          <span className="growth-expense-date">{expense.date}</span>
                        </div>
                      </div>
                      <div className="growth-expense-actions">
                        <div className="growth-expense-amount">₹{expense.amount.toLocaleString('en-IN')}</div>
                        <button onClick={() => deleteExpense(expense.id)} className="growth-delete-expense-btn">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {expenses.length > 5 && (
                    <div className="growth-more-text">+ {expenses.length - 5} more</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New Metric Modal */}
      {showAddMetric && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Add New Fitness Goal</h3>
              <button onClick={() => setShowAddMetric(false)} className="growth-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="growth-form-group">
                <label className="growth-modal-label">Goal Name</label>
                <input
                  type="text"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
                  placeholder="e.g., Yoga, Swimming, etc."
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Unit of Measurement</label>
                <input
                  type="text"
                  value={newMetric.unit}
                  onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
                  placeholder="e.g., reps, km, minutes"
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Target Value</label>
                <input
                  type="number"
                  value={newMetric.targetValue}
                  onChange={(e) => setNewMetric({...newMetric, targetValue: parseFloat(e.target.value) || 0})}
                  placeholder="e.g., 100, 5, 30"
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Color</label>
                <div className="growth-color-picker">
                  {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => (
                    <button
                      key={color}
                      className={`growth-color-option ${newMetric.color === color ? 'selected' : ''}`}
                      style={{backgroundColor: color}}
                      onClick={() => setNewMetric({...newMetric, color})}
                    />
                  ))}
                </div>
              </div>
              <div className="growth-modal-actions">
                <button onClick={addNewMetric} className="growth-modal-save">
                  <Save size={16} />
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddRecord && selectedMetric && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Add Record</h3>
              <button onClick={() => setShowAddRecord(false)} className="growth-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="growth-form-group">
                <label className="growth-modal-label">Date</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">
                  Value ({fitnessMetrics.find(m => m.id === selectedMetric)?.unit})
                </label>
                <input
                  type="number"
                  value={newRecordValue}
                  onChange={(e) => setNewRecordValue(parseFloat(e.target.value) || 0)}
                  className="growth-modal-input"
                  autoFocus
                />
              </div>
              <div className="growth-modal-actions">
                <button onClick={addRecord} className="growth-modal-save">
                  <Save size={16} />
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAddCertificate && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Add Certificate</h3>
              <button onClick={() => setShowAddCertificate(false)} className="growth-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="growth-form-group">
                <label className="growth-modal-label">Certificate Name</label>
                <input
                  type="text"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                  placeholder="e.g., React Developer Certification"
                  className="growth-modal-input"
                  autoFocus
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Issuing Organization</label>
                <input
                  type="text"
                  value={newCertificate.issuer}
                  onChange={(e) => setNewCertificate({...newCertificate, issuer: e.target.value})}
                  placeholder="e.g., Coursera, Udemy"
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Date Received</label>
                <input
                  type="date"
                  value={newCertificate.date}
                  onChange={(e) => setNewCertificate({...newCertificate, date: e.target.value})}
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-modal-actions">
                <button onClick={addCertificate} className="growth-modal-save">
                  <Save size={16} />
                  Add Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {showUpdateBalance && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Update Current Balance</h3>
              <button onClick={() => setShowUpdateBalance(false)} className="growth-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="growth-form-group">
                <label className="growth-modal-label">Current Balance (₹)</label>
                <input
                  type="number"
                  value={updateBalanceValue}
                  onChange={(e) => setUpdateBalanceValue(parseFloat(e.target.value) || 0)}
                  className="growth-modal-input"
                  autoFocus
                />
              </div>
              <div className="growth-modal-actions">
                <button onClick={updateBalance} className="growth-modal-save">
                  <Save size={16} />
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Target Balance Modal */}
      {showUpdateTarget && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Update Target Balance</h3>
              <button onClick={() => setShowUpdateTarget(false)} className="growth-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="growth-form-group">
                <label className="growth-modal-label">Target Balance (₹)</label>
                <input
                  type="number"
                  value={updateTargetValue}
                  onChange={(e) => setUpdateTargetValue(parseFloat(e.target.value) || 0)}
                  className="growth-modal-input"
                  autoFocus
                />
              </div>
              <div className="growth-modal-actions">
                <button onClick={updateTargetBalance} className="growth-modal-save">
                  <Save size={16} />
                  Update Target
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Add Expense</h3>
              <button onClick={() => setShowAddExpense(false)} className="growth-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="growth-form-group">
                <label className="growth-modal-label">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="e.g., Lunch, Groceries, etc."
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Amount (₹)</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="growth-modal-input"
                />
              </div>
              <div className="growth-form-group">
                <label className="growth-modal-label">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="growth-modal-input"
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="growth-modal-actions">
                <button onClick={addExpense} className="growth-modal-save">
                  <Save size={16} />
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Growth;