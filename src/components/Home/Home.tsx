import React from 'react';
import { Clock, Timer, Music, Target, CheckSquare, AlarmClock, Smartphone, StopCircle, TrendingUp, Sparkles } from 'lucide-react';
import './Home.css';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    { id: 'clock', name: 'Clock', icon: Clock, color: '#2563eb' },
    { id: 'alarm', name: 'Alarm', icon: AlarmClock, color: '#9333ea' },
    { id: 'timer', name: 'Timer', icon: Timer, color: '#ea580c' },
    { id: 'Notes', name: 'Notes', icon: StopCircle, color: '#16a34a' },
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
          <div className="logo-container">
            <div className="logo-circle">
              <Sparkles className="logo-icon" size={48} />
            </div>
            <div className="logo-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>
          <h1 className="home-title">Jeeva</h1>
          <p className="home-tagline">Elevate Your Everyday</p>
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
      </div>
    </div>
  );
};

export default Home;