import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Target, DollarSign, 
  User, Briefcase, FileText, Link as LinkIcon, 
  Plus, Trash2, Edit2, Save, X, Eye,
  Flame, ChevronRight
} from 'lucide-react';

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
  const [newRecordValue, setNewRecordValue] = useState<number>(0);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

  // Fitness Metrics
  const [fitnessMetrics, setFitnessMetrics] = useState<FitnessMetric[]>([
    {
      id: 'pushups',
      name: 'Push-ups',
      icon: '💪',
      unit: 'reps',
      color: '#ef4444',
      currentValue: 0,
      targetValue: 100,
      history: []
    },
    {
      id: 'pullups',
      name: 'Pull-ups',
      icon: '🏋️',
      unit: 'reps',
      color: '#f59e0b',
      currentValue: 0,
      targetValue: 20,
      history: []
    },
    {
      id: 'height',
      name: 'Height Growth',
      icon: '📏',
      unit: 'cm',
      color: '#10b981',
      currentValue: 0,
      targetValue: 180,
      history: []
    },
    {
      id: 'weight',
      name: 'Weight',
      icon: '⚖️',
      unit: 'kg',
      color: '#3b82f6',
      currentValue: 0,
      targetValue: 70,
      history: []
    },
    {
      id: 'jawline',
      name: 'Jawline Exercise',
      icon: '😎',
      unit: 'days',
      color: '#8b5cf6',
      currentValue: 0,
      targetValue: 30,
      history: []
    },
    {
      id: 'face',
      name: 'Face Treatment',
      icon: '✨',
      unit: 'sessions',
      color: '#ec4899',
      currentValue: 0,
      targetValue: 10,
      history: []
    },
    {
      id: 'running',
      name: 'Running',
      icon: '🏃',
      unit: 'km',
      color: '#06b6d4',
      currentValue: 0,
      targetValue: 5,
      history: []
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: '🧘',
      unit: 'minutes',
      color: '#a855f7',
      currentValue: 0,
      targetValue: 30,
      history: []
    }
  ]);

  // Career Data
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    resumeUrl: '',
    portfolioUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    balance: 0,
    targetBalance: 0
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<ProfileData>(profileData);

  // Finance Data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

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
      setTempProfile(profile);
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

        const existingIndex = metric.history.findIndex(r => r.date === recordDate);
        let updatedHistory = [...metric.history];

        if (existingIndex >= 0) {
          updatedHistory[existingIndex] = newRecord;
        } else {
          updatedHistory.push(newRecord);
        }

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

  // Get this week's progress
  const getWeekProgress = (history: DailyRecord[]): number => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekRecords = history.filter(r => new Date(r.date) >= weekAgo);
    if (weekRecords.length === 0) return 0;

    const total = weekRecords.reduce((sum, r) => sum + r.value, 0);
    return Math.round(total / weekRecords.length);
  };

  // Get today's progress
  const getTodayProgress = (history: DailyRecord[]): number => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = history.find(r => r.date === today);
    return todayRecord?.value || 0;
  };

  // Add certificate
  const addCertificate = () => {
    const name = prompt('Enter certificate name:');
    const issuer = prompt('Enter issuer/organization:');
    const date = prompt('Enter date (YYYY-MM-DD):');
    const fileUrl = prompt('Enter certificate URL or file path:');

    if (name && issuer && date && fileUrl) {
      const newCert: Certificate = {
        id: Date.now().toString(),
        name,
        issuer,
        date,
        fileUrl
      };
      setCertificates([newCert, ...certificates]);
    }
  };

  // Save profile
  const saveProfile = () => {
    setProfileData(tempProfile);
    setEditingProfile(false);
  };

  // Delete certificate
  const deleteCertificate = (id: string) => {
    if (window.confirm('Delete this certificate?')) {
      setCertificates(certificates.filter(c => c.id !== id));
    }
  };

  // Delete metric record
  const deleteRecord = (metricId: string, date: string) => {
    setFitnessMetrics(fitnessMetrics.map(metric => {
      if (metric.id === metricId) {
        return {
          ...metric,
          history: metric.history.filter(r => r.date !== date)
        };
      }
      return metric;
    }));
  };

  const getProgressPercentage = (current: number, target: number): number => {
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

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'resumeFile' | 'portfolioFile') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setTempProfile({ ...tempProfile, [field]: base64 });
      };
      reader.readAsDataURL(file);
    }
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

  // Get expenses by category
  const getExpensesByCategory = (): { [key: string]: number } => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    return monthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as { [key: string]: number });
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Home
      </button>

      <div style={styles.content}>
        <h2 style={styles.title}>Growth Dashboard</h2>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('fitness')}
            style={{...styles.tab, ...(activeTab === 'fitness' ? styles.tabActive : {})}}
          >
            <Target size={20} />
            Fitness & Health
          </button>
          <button
            onClick={() => setActiveTab('career')}
            style={{...styles.tab, ...(activeTab === 'career' ? styles.tabActive : {})}}
          >
            <Briefcase size={20} />
            Career & Profile
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            style={{...styles.tab, ...(activeTab === 'finance' ? styles.tabActive : {})}}
          >
            <DollarSign size={20} />
            Finance
          </button>
        </div>

        {/* FITNESS TAB */}
        {activeTab === 'fitness' && (
          <div style={styles.section}>
            {/* Overall Stats */}
            <div style={styles.overviewCards}>
              <div style={styles.overviewCard}>
                <Flame size={32} color="#ef4444" />
                <div>
                  <div style={styles.overviewLabel}>Total Streak</div>
                  <div style={styles.overviewValue}>
                    {Math.max(...fitnessMetrics.map(m => calculateStreak(m.history)))} days
                  </div>
                </div>
              </div>
              <div style={styles.overviewCard}>
                <TrendingUp size={32} color="#10b981" />
                <div>
                  <div style={styles.overviewLabel}>Active Metrics</div>
                  <div style={styles.overviewValue}>
                    {fitnessMetrics.filter(m => m.history.length > 0).length}/{fitnessMetrics.length}
                  </div>
                </div>
              </div>
              <div style={styles.overviewCard}>
                <Award size={32} color="#f59e0b" />
                <div>
                  <div style={styles.overviewLabel}>Goals Achieved</div>
                  <div style={styles.overviewValue}>
                    {fitnessMetrics.filter(m => m.currentValue >= m.targetValue).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={styles.metricsGrid}>
              {fitnessMetrics.map(metric => {
                const streak = calculateStreak(metric.history);
                const weekAvg = getWeekProgress(metric.history);
                const todayValue = getTodayProgress(metric.history);
                const progress = getProgressPercentage(metric.currentValue, metric.targetValue);

                return (
                  <div key={metric.id} style={{...styles.metricCard, borderColor: metric.color}}>
                    <div style={styles.metricHeader}>
                      <span style={styles.metricIcon}>{metric.icon}</span>
                      <h4 style={styles.metricName}>{metric.name}</h4>
                    </div>

                    <div style={styles.metricStats}>
                      <div style={styles.statRow}>
                        <span>Current:</span>
                        <strong style={{ color: metric.color }}>
                          {metric.currentValue} {metric.unit}
                        </strong>
                      </div>
                      <div style={styles.statRow}>
                        <span>Target:</span>
                        {editingMetric === metric.id ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="number"
                              value={tempTarget}
                              onChange={(e) => setTempTarget(parseFloat(e.target.value) || 0)}
                              style={{ width: '60px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #ccc' }}
                              autoFocus
                            />
                            <button
                              onClick={() => updateMetricTarget(metric.id, tempTarget)}
                              style={{ padding: '2px 6px', fontSize: '12px', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingMetric(null)}
                              style={{ padding: '2px 6px', fontSize: '12px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <strong>{metric.targetValue} {metric.unit}</strong>
                            <button
                              onClick={() => {
                                setEditingMetric(metric.id);
                                setTempTarget(metric.targetValue);
                              }}
                              style={{ 
                                marginLeft: '8px', 
                                padding: '2px 6px', 
                                fontSize: '12px',
                                cursor: 'pointer',
                                background: 'transparent',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                              }}
                            >
                              <Edit2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                      <div style={styles.statRow}>
                        <span>Today:</span>
                        <strong>{todayValue} {metric.unit}</strong>
                      </div>
                      <div style={styles.statRow}>
                        <span>Week Avg:</span>
                        <strong>{weekAvg} {metric.unit}</strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={styles.metricProgress}>
                      <div style={styles.progressLabel}>{progress}% Complete</div>
                      <div style={styles.progressBarContainer}>
                        <div 
                          style={{ 
                            ...styles.progressBarFill,
                            width: `${progress}%`,
                            backgroundColor: metric.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Streak */}
                    {streak > 0 && (
                      <div style={styles.metricStreak}>
                        <Flame size={16} color="#ef4444" />
                        <span>{streak} day streak!</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={styles.metricActions}>
                      <button
                        onClick={() => {
                          setSelectedMetric(metric.id);
                          setNewRecordValue(metric.currentValue);
                          setShowAddRecord(true);
                        }}
                        style={styles.metricBtnAdd}
                      >
                        <Plus size={16} />
                        Add Record
                      </button>
                      {metric.history.length > 0 && (
                        <button
                          onClick={() => {
                            const metricWithHistory = fitnessMetrics.find(m => m.id === metric.id);
                            if (metricWithHistory) {
                              const historyText = metricWithHistory.history
                                .slice(0, 10)
                                .map(h => `${h.date}: ${h.value} ${metric.unit}`)
                                .join('\n');
                              alert(`Recent history for ${metric.name}:\n\n${historyText}`);
                            }
                          }}
                          style={styles.metricBtnView}
                        >
                          <Eye size={16} />
                          History
                        </button>
                      )}
                    </div>

                    {/* Recent Records */}
                    {metric.history.length > 0 && (
                      <div style={styles.metricRecent}>
                        <div style={styles.recentLabel}>Recent Entries:</div>
                        {metric.history.slice(0, 3).map((record, idx) => (
                          <div key={idx} style={styles.recentEntry}>
                            <span>{record.date}</span>
                            <span>{record.value} {metric.unit}</span>
                            <button
                              onClick={() => deleteRecord(metric.id, record.date)}
                              style={styles.deleteMiniBtn}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Record Modal */}
            {showAddRecord && selectedMetric && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                  <h3>Add Record</h3>
                  <div style={styles.modalForm}>
                    <div style={styles.formGroup}>
                      <label>Date</label>
                      <input
                        type="date"
                        value={recordDate}
                        onChange={(e) => setRecordDate(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Value ({fitnessMetrics.find(m => m.id === selectedMetric)?.unit})</label>
                      <input
                        type="number"
                        value={newRecordValue}
                        onChange={(e) => setNewRecordValue(parseFloat(e.target.value) || 0)}
                        style={styles.input}
                        autoFocus
                      />
                    </div>
                    <div style={styles.modalActions}>
                      <button onClick={addRecord} style={styles.modalSaveBtn}>
                        <Save size={18} />
                        Save
                      </button>
                      <button onClick={() => {
                        setShowAddRecord(false);
                        setSelectedMetric(null);
                      }} style={styles.modalCancelBtn}>
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAREER TAB */}
        {activeTab === 'career' && (
          <div style={styles.section}>
            {/* Profile Links */}
            <div style={styles.profileCard}>
              <div style={styles.profileHeader}>
                <User size={32} color="#6366f1" />
                <h3>Professional Profile</h3>
                {!editingProfile && (
                  <button onClick={() => setEditingProfile(true)} style={styles.editProfileBtn}>
                    <Edit2 size={18} />
                    Edit
                  </button>
                )}
              </div>

              {editingProfile ? (
                <div style={styles.profileForm}>
                  <div style={styles.formGroup}>
                    <label>Resume URL (optional)</label>
                    <input
                      type="text"
                      value={tempProfile.resumeUrl}
                      onChange={(e) => setTempProfile({ ...tempProfile, resumeUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      style={styles.input}
                    />
                    <label style={{ marginTop: '8px' }}>Or Upload Resume File</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'resumeFile')}
                      style={styles.input}
                    />
                    {tempProfile.resumeFile && <small style={{ color: '#10b981' }}>✓ File uploaded</small>}
                  </div>
                  <div style={styles.formGroup}>
                    <label>Portfolio URL (optional)</label>
                    <input
                      type="text"
                      value={tempProfile.portfolioUrl}
                      onChange={(e) => setTempProfile({ ...tempProfile, portfolioUrl: e.target.value })}
                      placeholder="https://yourportfolio.com"
                      style={styles.input}
                    />
                    <label style={{ marginTop: '8px' }}>Or Upload Portfolio File</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'portfolioFile')}
                      style={styles.input}
                    />
                    {tempProfile.portfolioFile && <small style={{ color: '#10b981' }}>✓ File uploaded</small>}
                  </div>
                  <div style={styles.formGroup}>
                    <label>LinkedIn URL</label>
                    <input
                      type="text"
                      value={tempProfile.linkedInUrl}
                      onChange={(e) => setTempProfile({ ...tempProfile, linkedInUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>GitHub URL</label>
                    <input
                      type="text"
                      value={tempProfile.githubUrl}
                      onChange={(e) => setTempProfile({ ...tempProfile, githubUrl: e.target.value })}
                      placeholder="https://github.com/username"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.profileActions}>
                    <button onClick={saveProfile} style={styles.saveBtn}>
                      <Save size={18} />
                      Save
                    </button>
                    <button onClick={() => {
                      setEditingProfile(false);
                      setTempProfile(profileData);
                    }} style={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.profileLinks}>
                  {(profileData.resumeUrl || profileData.resumeFile) && (
                    <a 
                      href={profileData.resumeFile || profileData.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={styles.profileLink}
                      download={profileData.resumeFile ? "resume.pdf" : undefined}
                    >
                      <FileText size={20} />
                      <span>Resume {profileData.resumeFile && '(File)'}</span>
                      <ChevronRight size={18} />
                    </a>
                  )}
                  {(profileData.portfolioUrl || profileData.portfolioFile) && (
                    <a 
                      href={profileData.portfolioFile || profileData.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={styles.profileLink}
                      download={profileData.portfolioFile ? "portfolio.pdf" : undefined}
                    >
                      <Briefcase size={20} />
                      <span>Portfolio {profileData.portfolioFile && '(File)'}</span>
                      <ChevronRight size={18} />
                    </a>
                  )}
                  {profileData.linkedInUrl && (
                    <a href={profileData.linkedInUrl} target="_blank" rel="noopener noreferrer" style={styles.profileLink}>
                      <LinkIcon size={20} />
                      <span>LinkedIn</span>
                      <ChevronRight size={18} />
                    </a>
                  )}
                  {profileData.githubUrl && (
                    <a href={profileData.githubUrl} target="_blank" rel="noopener noreferrer" style={styles.profileLink}>
                      <LinkIcon size={20} />
                      <span>GitHub</span>
                      <ChevronRight size={18} />
                    </a>
                  )}
                  {!profileData.resumeUrl && !profileData.portfolioUrl && !profileData.linkedInUrl && !profileData.githubUrl && !profileData.resumeFile && !profileData.portfolioFile && (
                    <p style={styles.emptyText}>No profile links added yet. Click Edit to add them.</p>
                  )}
                </div>
              )}
            </div>

            {/* Certificates */}
            <div style={styles.certificatesCard}>
              <div style={styles.certificatesHeader}>
                <Award size={28} color="#f59e0b" />
                <h3>Certificates & Achievements</h3>
                <button onClick={addCertificate} style={styles.addCertBtn}>
                  <Plus size={20} />
                  Add Certificate
                </button>
              </div>

              {certificates.length === 0 ? (
                <div style={styles.emptyState}>
                  <Award size={64} color="#4b5563" />
                  <p>No certificates added yet</p>
                  <small>Click "Add Certificate" to upload your achievements</small>
                </div>
              ) : (
                <div style={styles.certificatesList}>
                  {certificates.map(cert => (
                    <div key={cert.id} style={styles.certificateItem}>
                      <div style={styles.certIcon}>📜</div>
                      <div style={styles.certInfo}>
                        <div style={styles.certName}>{cert.name}</div>
                        <div style={styles.certIssuer}>{cert.issuer}</div>
                        <div style={styles.certDate}>{cert.date}</div>
                      </div>
                      <div style={styles.certActions}>
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" style={styles.viewCertBtn}>
                          <Eye size={18} />
                        </a>
                        <button onClick={() => deleteCertificate(cert.id)} style={styles.deleteCertBtn}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div style={styles.section}>
            {/* Balance Cards */}
            <div style={styles.financeCardsRow}>
              <div style={styles.balanceCard}>
                <DollarSign size={40} color="#10b981" />
                <div>
                  <div style={styles.balanceLabel}>Current Balance</div>
                  <div style={styles.balanceAmount}>
                    ₹{profileData.balance.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newBalance = prompt('Enter current balance:', profileData.balance.toString());
                    if (newBalance !== null) {
                      setProfileData({ ...profileData, balance: parseFloat(newBalance) || 0 });
                    }
                  }}
                  style={styles.updateBalanceBtn}
                >
                  <Edit2 size={18} />
                  Update
                </button>
              </div>

              <div style={{...styles.balanceCard, borderColor: '#f59e0b'}}>
                <Target size={40} color="#f59e0b" />
                <div>
                  <div style={styles.balanceLabel}>Target Balance (This Month)</div>
                  <div style={{...styles.balanceAmount, color: '#f59e0b'}}>
                    ₹{profileData.targetBalance.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newTarget = prompt('Enter target balance for this month:', profileData.targetBalance.toString());
                    if (newTarget !== null) {
                      setProfileData({ ...profileData, targetBalance: parseFloat(newTarget) || 0 });
                    }
                  }}
                  style={styles.updateBalanceBtn}
                >
                  <Edit2 size={18} />
                  Update
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div style={styles.monthlySummary}>
              <h3>This Month's Summary</h3>
              <div style={styles.summaryStats}>
                <div style={styles.summaryItem}>
                  <span>Total Expenses:</span>
                  <strong style={{ color: '#ef4444' }}>₹{getMonthlyExpenses().toLocaleString('en-IN')}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Remaining to Target:</span>
                  <strong style={{ color: profileData.balance >= profileData.targetBalance ? '#10b981' : '#f59e0b' }}>
                    ₹{Math.max(0, profileData.targetBalance - profileData.balance).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Progress:</span>
                  <strong>
                    {profileData.targetBalance > 0 
                      ? Math.round((profileData.balance / profileData.targetBalance) * 100) 
                      : 0}%
                  </strong>
                </div>
              </div>

              {/* Progress Bar */}
              {profileData.targetBalance > 0 && (
                <div style={{...styles.metricProgress, marginTop: '16px'}}>
                  <div style={styles.progressBarContainer}>
                    <div 
                      style={{ 
                        ...styles.progressBarFill,
                        width: `${Math.min((profileData.balance / profileData.targetBalance) * 100, 100)}%`,
                        backgroundColor: profileData.balance >= profileData.targetBalance ? '#10b981' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expenses by Category */}
            {Object.keys(getExpensesByCategory()).length > 0 && (
              <div style={styles.categoryBreakdown}>
                <h3>Expenses by Category</h3>
                <div style={styles.categoryList}>
                  {Object.entries(getExpensesByCategory()).map(([category, amount]) => (
                    <div key={category} style={styles.categoryItem}>
                      <span>{category}</span>
                      <strong>₹{amount.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div style={styles.expensesCard}>
              <div style={styles.expensesHeader}>
                <h3>Daily Expenses</h3>
                <button onClick={() => setShowAddExpense(true)} style={styles.addExpenseBtn}>
                  <Plus size={20} />
                  Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <div style={styles.emptyState}>
                  <DollarSign size={64} color="#4b5563" />
                  <p>No expenses recorded yet</p>
                  <small>Click "Add Expense" to track your spending</small>
                </div>
              ) : (
                <div style={styles.expensesList}>
                  {expenses.slice(0, 20).map(expense => (
                    <div key={expense.id} style={styles.expenseItem}>
                      <div style={styles.expenseInfo}>
                        <div style={styles.expenseDescription}>{expense.description}</div>
                        <div style={styles.expenseMeta}>
                          <span style={styles.expenseCategory}>{expense.category}</span>
                          <span style={styles.expenseDate}>{expense.date}</span>
                        </div>
                      </div>
                      <div style={styles.expenseActions}>
                        <div style={styles.expenseAmount}>₹{expense.amount.toLocaleString('en-IN')}</div>
                        <button onClick={() => deleteExpense(expense.id)} style={styles.deleteExpenseBtn}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                  <h3>Add Expense</h3>
                  <div style={styles.modalForm}>
                    <div style={styles.formGroup}>
                      <label>Date</label>
                      <input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Description</label>
                      <input
                        type="text"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        placeholder="e.g., Lunch at restaurant"
                        style={styles.input}
                        autoFocus
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Amount (₹)</label>
                      <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Category</label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        style={styles.input}
                      >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Bills">Bills</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={styles.modalActions}>
                      <button onClick={addExpense} style={styles.modalSaveBtn}>
                        <Save size={18} />
                        Save
                      </button>
                      <button onClick={() => setShowAddExpense(false)} style={styles.modalCancelBtn}>
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    padding: '24px',
  },
  backButton: {
    background: '#1e293b',
    color: '#e2e8f0',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '24px',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '32px',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#1e293b',
    border: 'none',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  section: {
    marginTop: '24px',
  },
  overviewCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  overviewCard: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  overviewLabel: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  overviewValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  metricCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    borderLeft: '4px solid',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  metricIcon: {
    fontSize: '32px',
  },
  metricName: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  metricStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#94a3b8',
  },
  metricProgress: {
    marginBottom: '12px',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    background: '#334155',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  metricStreak: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: '#fef2f2',
    borderRadius: '6px',
    marginBottom: '12px',
    color: '#991b1b',
    fontSize: '14px',
  },
  metricActions: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  metricBtnAdd: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  metricBtnView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  metricRecent: {
    borderTop: '1px solid #334155',
    paddingTop: '12px',
  },
  recentLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '8px',
  },
  recentEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '13px',
    color: '#cbd5e1',
  },
  deleteMiniBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '0 8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#e2e8f0',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
  },
  modalSaveBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  modalCancelBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  profileCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  editProfileBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  profileActions: {
    display: 'flex',
    gap: '12px',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelBtn: {
    padding: '12px 24px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  profileLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#e2e8f0',
    transition: 'background 0.3s',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center' as const,
    padding: '32px',
  },
  certificatesCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
  },
  certificatesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  addCertBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#94a3b8',
  },
  certificatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  certificateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
  },
  certIcon: {
    fontSize: '32px',
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  certIssuer: {
    fontSize: '14px',
    color: '#94a3b8',
  },
  certDate: {
    fontSize: '12px',
    color: '#64748b',
  },
  certActions: {
    display: 'flex',
    gap: '8px',
  },
  viewCertBtn: {
    padding: '8px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  deleteCertBtn: {
    padding: '8px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  financeCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  balanceCard: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderLeft: '4px solid #10b981',
  },
  balanceLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '4px',
  },
  balanceAmount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#10b981',
  },
  updateBalanceBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  monthlySummary: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '16px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryBreakdown: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  categoryList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: '#0f172a',
    borderRadius: '6px',
  },
  expensesCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
  },
  expensesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  addExpenseBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  expensesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: '4px',
  },
  expenseMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '14px',
  },
  expenseCategory: {
    color: '#3b82f6',
  },
  expenseDate: {
    color: '#94a3b8',
  },
  expenseActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  expenseAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ef4444',
  },
  deleteExpenseBtn: {
    padding: '8px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
};

export default Growth;