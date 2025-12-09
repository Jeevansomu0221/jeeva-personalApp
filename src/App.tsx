import React, { useState } from 'react';
import './App.css';
import Home from './components/Home/Home';
import Clock from './components/Clock/Clock';
import Alarm from './components/Alarm/Alarm';
import Timer from './components/Timer/Timer';
import Stopwatch from './components/Stopwatch/Stopwatch';
import Music from './components/Music/Music';
import Goals from './components/Goals/Goals';
import Tasks from './components/Tasks/Tasks';
import ScreenTime from './components/ScreenTime/ScreenTime';
import Growth from './components/Growth/Growth';

type Screen = 'home' | 'clock' | 'alarm' | 'timer' | 'stopwatch' | 'music' | 'goals' | 'tasks' | 'screentime' | 'growth';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'clock':
        return <Clock onBack={() => setCurrentScreen('home')} />;
      case 'alarm':
        return <Alarm onBack={() => setCurrentScreen('home')} />;
      case 'timer':
        return <Timer onBack={() => setCurrentScreen('home')} />;
      case 'stopwatch':
        return <Stopwatch onBack={() => setCurrentScreen('home')} />;
      case 'music':
        return <Music onBack={() => setCurrentScreen('home')} />;
      case 'goals':
        return <Goals onBack={() => setCurrentScreen('home')} />;
      case 'tasks':
        return <Tasks onBack={() => setCurrentScreen('home')} />;
      case 'screentime':
        return <ScreenTime onBack={() => setCurrentScreen('home')} />;
      case 'growth':
        return <Growth onBack={() => setCurrentScreen('home')} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
};

export default App;