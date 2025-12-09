import React from 'react';
import { Clock, Timer, Music, Target, CheckSquare, AlarmClock, Smartphone, StopCircle, TrendingUp } from 'lucide-react';
import './Home.css';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    { id: 'clock', name: 'Clock', icon: Clock, color: '#2563eb' },
    { id: 'alarm', name: 'Alarm', icon: AlarmClock, color: '#9333ea' },
    { id: 'timer', name: 'Timer', icon: Timer, color: '#ea580c' },
    { id: 'stopwatch', name: 'Stopwatch', icon: StopCircle, color: '#16a34a' },
    { id: 'music', name: 'Music', icon: Music, color: '#db2777' },
    { id: 'goals', name: 'Goals', icon: Target, color: '#dc2626' },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare, color: '#0d9488' },
    { id: 'screentime', name: 'Screen Time', icon: Smartphone, color: '#6366f1' },
    { id: 'growth', name: 'Growth', icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <h1 className="home-title">Jeeva</h1>
          <p className="home-subtitle">Your Personal Productivity Hub</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => onNavigate(feature.id)}
                className="feature-card"
                style={{ backgroundColor: feature.color }}
              >
                <Icon size={40} />
                <span className="feature-name">{feature.name}</span>
              </button>
            );
          })}
        </div>

        <div className="home-info">
          <p>👆 Click on any feature above to start building it</p>
        </div>
      </div>
    </div>
  );
};

export default Home;