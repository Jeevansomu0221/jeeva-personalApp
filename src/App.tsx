import React, { useState } from 'react';
import './App.css';
import Home from './components/Home/Home';
import Clock from './components/Clock/Clock';
import Alarm from './components/Alarm/Alarm';
import Timer from './components/Timer/Timer';
import Notes from './components/Notes/Notes';
import Music from './components/Music/Music';
import Goals from './components/Goals/Goals';
import Tasks from './components/Tasks/Tasks';
import ScreenTime from './components/ScreenTime/ScreenTime';
import Growth from './components/Growth/Growth';
import TimeTable from './components/TimeTable/TimeTable';

type Screen = 'home' | 'clock' | 'alarm' | 'timer' | 'Notes' | 'music' | 'goals' | 'tasks' | 'screentime' | 'growth' | 'timetable';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const handleNavigate = (screen: string) => {
    // Type assertion to ensure screen is a valid Screen type
    if (isValidScreen(screen)) {
      setCurrentScreen(screen);
    }
  };

  // Helper function to check if a string is a valid Screen type
  const isValidScreen = (screen: string): screen is Screen => {
    const validScreens: Screen[] = ['home', 'clock', 'alarm', 'timer', 'Notes', 'music', 'goals', 'tasks', 'screentime', 'growth', 'timetable'];
    return validScreens.includes(screen as Screen);
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
      case 'Notes':
        return <Notes onBack={() => setCurrentScreen('home')} />;
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
      case 'timetable':
        return <TimeTable />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
};

export default App;