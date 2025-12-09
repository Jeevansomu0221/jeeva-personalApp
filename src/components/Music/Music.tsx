import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Plus, Music as MusicIcon, ListMusic, ChevronRight } from 'lucide-react';
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
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const songsListRef = useRef<HTMLDivElement>(null);

  // Load songs from localStorage
  useEffect(() => {
    const savedSongs = localStorage.getItem('jeeva-songs');
    if (savedSongs) {
      const parsed = JSON.parse(savedSongs);
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
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
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
    
    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      setCurrentSong(song);
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const playNext = () => {
    const filteredSongs = getFilteredSongs();
    if (filteredSongs.length === 0) return;
    
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex < filteredSongs.length - 1) {
      playSong(filteredSongs[currentIndex + 1]);
    } else {
      playSong(filteredSongs[0]); // Loop to first
    }
  };

  const playPrevious = () => {
    const filteredSongs = getFilteredSongs();
    if (filteredSongs.length === 0) return;
    
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  };

  const changeSongMode = (songId: string, newMode: string) => {
    setSongs(songs.map(s => s.id === songId ? { ...s, mode: newMode } : s));
  };

  const handleScroll = () => {
    setIsScrolling(true);
    if (songsListRef.current) {
      clearTimeout((songsListRef.current as any).scrollTimeout);
      (songsListRef.current as any).scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    }
  };

  const filteredSongs = getFilteredSongs();
  const currentModeInfo = modes.find(m => m.id === currentMode) || { name: 'All Songs', icon: '🎵', color: '#6366f1' };

  return (
    <div className="music-container">
      {/* Header */}
      <div className="music-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h1 className="music-title">Music Player</h1>
        <div className="header-actions">
          <span className="song-count">{filteredSongs.length} songs</span>
        </div>
      </div>

      <div className="music-content">
        {/* Mode Selector Mobile */}
        <div className="mode-selector-mobile">
          <button 
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="mode-selector-button"
            style={{ backgroundColor: currentMode === 'all' ? '#6366f1' : currentModeInfo.color }}
          >
            <span className="mode-emoji">{currentMode === 'all' ? '🎵' : currentModeInfo.icon}</span>
            <span className="mode-name">{currentMode === 'all' ? 'All Songs' : currentModeInfo.name}</span>
            <ChevronRight size={20} className={`chevron ${showModeSelector ? 'open' : ''}`} />
          </button>
          
          {showModeSelector && (
            <div className="mode-dropdown">
              <div className="mode-dropdown-content">
                <button
                  onClick={() => {
                    setCurrentMode('all');
                    setShowModeSelector(false);
                  }}
                  className="mode-option"
                >
                  <span className="mode-option-emoji">🎵</span>
                  <div>
                    <div className="mode-option-name">All Songs</div>
                    <div className="mode-option-description">All your music</div>
                  </div>
                </button>
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setCurrentMode(mode.id);
                      setShowModeSelector(false);
                    }}
                    className="mode-option"
                  >
                    <span className="mode-option-emoji">{mode.icon}</span>
                    <div>
                      <div className="mode-option-name">{mode.name}</div>
                      <div className="mode-option-description">{mode.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Now Playing Card - Fixed at top on mobile */}
        {currentSong && (
          <div className="now-playing-card">
            <div className="now-playing-art">
              <div className="album-art">
                <MusicIcon size={48} color="white" />
                {isPlaying && (
                  <div className="visualizer">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>
              <div className="song-info-mini">
                <div className="song-title-mini">{currentSong.title}</div>
                <div className="song-artist-mini">{currentSong.artist}</div>
              </div>
            </div>
            
            <div className="playback-controls">
              <button onClick={playPrevious} className="control-btn-sm" disabled={filteredSongs.length <= 1}>
                <SkipBack size={20} />
              </button>
              <button onClick={togglePlayPause} className="play-btn-sm">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={playNext} className="control-btn-sm" disabled={filteredSongs.length <= 1}>
                <SkipForward size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Add Songs Button */}
        <div className="add-songs-section">
          <button onClick={() => fileInputRef.current?.click()} className="add-songs-btn">
            <Plus size={20} />
            <span>Add Songs</span>
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

        {/* Songs List */}
        <div className="songs-list-container">
          <div className="list-header">
            <h3 className="list-title">
              <ListMusic size={20} />
              <span>{currentMode === 'all' ? 'All Songs' : currentModeInfo.name}</span>
              <span className="song-count-badge">{filteredSongs.length}</span>
            </h3>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="empty-state">
              <MusicIcon size={48} color="#4b5563" />
              <p>No songs in this category</p>
              <small>Click "Add Songs" to upload music</small>
            </div>
          ) : (
            <div 
              className="songs-list"
              ref={songsListRef}
              onScroll={handleScroll}
            >
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className={`song-item ${currentSong?.id === song.id ? 'active' : ''} ${
                    isScrolling ? 'no-hover' : ''
                  }`}
                  onClick={() => playSong(song)}
                >
                  <div className="song-number">{index + 1}</div>
                  <div className="song-info">
                    <div className="song-icon">
                      {currentSong?.id === song.id && isPlaying ? (
                        <div className="playing-animation">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <MusicIcon size={20} />
                      )}
                    </div>
                    <div className="song-details">
                      <div className="song-title">{song.title}</div>
                      <div className="song-meta">
                        <span className="song-artist">{song.artist}</span>
                        <span className="song-duration">{formatTime(song.duration)}</span>
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
                      aria-label="Delete song"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Player Bar - Only shown when song is playing */}
      {currentSong && (
        <div className="bottom-player">
          <div className="player-progress">
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={seekTo}
                className="progress-bar"
              />
              <div 
                className="progress-fill" 
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-bottom-controls">
            <div className="song-info-bottom">
              <div className="song-title-bottom">{currentSong.title}</div>
              <div className="song-artist-bottom">{currentSong.artist}</div>
            </div>
            
            <div className="player-main-controls">
              <button onClick={playPrevious} className="control-btn-bottom" disabled={filteredSongs.length <= 1}>
                <SkipBack size={20} />
              </button>
              <button onClick={togglePlayPause} className="play-btn-bottom">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={playNext} className="control-btn-bottom" disabled={filteredSongs.length <= 1}>
                <SkipForward size={20} />
              </button>
            </div>

            <div className="volume-control-bottom">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="volume-btn-bottom"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                className="volume-slider-bottom"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default Music;