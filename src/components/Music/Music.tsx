import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Plus, Music as MusicIcon, ListMusic } from 'lucide-react';
import './Music.css';

interface MusicProps {
  onBack: () => void;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  file: File | null;
  url: string;
  mode: string;
}

interface Mode {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

const Music: React.FC<MusicProps> = ({ onBack }) => {
  const modes: Mode[] = [
    { id: 'high-dopamine', name: 'High Dopamine', color: '#dc2626', icon: '🔥', description: 'Energetic & Motivating' },
    { id: 'relax', name: 'Relax', color: '#0ea5e9', icon: '😌', description: 'Calm & Peaceful' },
    { id: 'exercise', name: 'Exercise', color: '#ea580c', icon: '💪', description: 'High Energy Workout' },
    { id: 'study', name: 'Study', color: '#8b5cf6', icon: '📚', description: 'Focus & Concentration' },
    { id: 'nature', name: 'Nature', color: '#10b981', icon: '🌿', description: 'Nature Sounds' },
    { id: 'bhagavad-gita', name: 'Bhagavad Gita', color: '#f59e0b', icon: '🕉️', description: 'Spiritual Wisdom' },
  ];

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentMode, setCurrentMode] = useState<string>('all');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load songs from localStorage
  useEffect(() => {
    const savedSongs = localStorage.getItem('jeeva-songs');
    if (savedSongs) {
      const parsed = JSON.parse(savedSongs);
      // Note: Files can't be stored in localStorage, so we'll need user to re-add them
      setSongs(parsed.map((s: any) => ({ ...s, file: null })));
    }
  }, []);

  // Save songs to localStorage (without file data)
  useEffect(() => {
    if (songs.length > 0) {
      const songsToSave = songs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        duration: s.duration,
        mode: s.mode,
        url: '' // URL will be regenerated when file is loaded
      }));
      localStorage.setItem('jeeva-songs', JSON.stringify(songsToSave));
    }
  }, [songs]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        
        audio.addEventListener('loadedmetadata', () => {
          const newSong: Song = {
            id: Date.now().toString() + Math.random(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            duration: audio.duration,
            file: file,
            url: url,
            mode: currentMode === 'all' ? 'high-dopamine' : currentMode
          };
          setSongs(prev => [...prev, newSong]);
        });
      }
    });
  };

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    const filteredSongs = getFilteredSongs();
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex < filteredSongs.length - 1) {
      playSong(filteredSongs[currentIndex + 1]);
    } else {
      playSong(filteredSongs[0]); // Loop to first
    }
  };

  const playPrevious = () => {
    const filteredSongs = getFilteredSongs();
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex > 0) {
      playSong(filteredSongs[currentIndex - 1]);
    } else {
      playSong(filteredSongs[filteredSongs.length - 1]); // Loop to last
    }
  };

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredSongs = (): Song[] => {
    if (currentMode === 'all') return songs;
    return songs.filter(s => s.mode === currentMode);
  };

  const deleteSong = (id: string) => {
    setSongs(songs.filter(s => s.id !== id));
    if (currentSong?.id === id) {
      setCurrentSong(null);
      setIsPlaying(false);
    }
  };

  const changeSongMode = (songId: string, newMode: string) => {
    setSongs(songs.map(s => s.id === songId ? { ...s, mode: newMode } : s));
  };

  const filteredSongs = getFilteredSongs();

  return (
    <div className="feature-container">
      <button onClick={onBack} className="back-button">
        ← Back to Home
      </button>

      <div className="feature-content music-content">
        <h2 className="feature-title">Music Player</h2>

        {/* Mode Selector */}
        <div className="modes-container">
          <button
            onClick={() => setCurrentMode('all')}
            className={`mode-chip ${currentMode === 'all' ? 'active' : ''}`}
            style={{ backgroundColor: currentMode === 'all' ? '#6366f1' : '#374151' }}
          >
            🎵 All Songs
          </button>
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setCurrentMode(mode.id)}
              className={`mode-chip ${currentMode === mode.id ? 'active' : ''}`}
              style={{ backgroundColor: currentMode === mode.id ? mode.color : '#374151' }}
            >
              {mode.icon} {mode.name}
            </button>
          ))}
        </div>

        {/* Add Songs Button */}
        <div className="add-songs-section">
          <button onClick={() => fileInputRef.current?.click()} className="add-songs-btn">
            <Plus size={20} />
            Add Songs to {currentMode === 'all' ? 'Library' : modes.find(m => m.id === currentMode)?.name}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Current Playing */}
        {currentSong && (
          <div className="now-playing">
            <div className="now-playing-info">
              <MusicIcon size={48} color="#a78bfa" />
              <div>
                <h3>{currentSong.title}</h3>
                <p>{currentSong.artist}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
              <span className="time-label">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={seekTo}
                className="progress-bar"
              />
              <span className="time-label">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="player-controls">
              <button onClick={playPrevious} className="control-button">
                <SkipBack size={28} />
              </button>
              <button onClick={togglePlayPause} className="control-button play-button">
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button onClick={playNext} className="control-button">
                <SkipForward size={28} />
              </button>
            </div>

            {/* Volume Control */}
            <div className="volume-control">
              <button onClick={() => setIsMuted(!isMuted)} className="volume-button">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="volume-slider"
              />
            </div>
          </div>
        )}

        {/* Songs List */}
        <div className="songs-list">
          <h3 className="list-title">
            <ListMusic size={24} />
            {currentMode === 'all' ? 'All Songs' : modes.find(m => m.id === currentMode)?.name} ({filteredSongs.length})
          </h3>

          {filteredSongs.length === 0 && (
            <div className="empty-state">
              <MusicIcon size={64} color="#4b5563" />
              <p>No songs in this category</p>
              <small>Click "Add Songs" to upload music</small>
            </div>
          )}

          {filteredSongs.map(song => (
            <div
              key={song.id}
              className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
              onClick={() => playSong(song)}
            >
              <div className="song-info">
                <div className="song-icon">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="playing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <MusicIcon size={24} />
                  )}
                </div>
                <div className="song-details">
                  <div className="song-title">{song.title}</div>
                  <div className="song-meta">
                    {song.artist} • {formatTime(song.duration)}
                  </div>
                </div>
              </div>
              
              <div className="song-actions">
                <select
                  value={song.mode}
                  onChange={(e) => {
                    e.stopPropagation();
                    changeSongMode(song.id, e.target.value);
                  }}
                  className="mode-select"
                  onClick={(e) => e.stopPropagation()}
                >
                  {modes.map(mode => (
                    <option key={mode.id} value={mode.id}>{mode.icon} {mode.name}</option>
                  ))}
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSong(song.id);
                  }}
                  className="delete-song-btn"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default Music;