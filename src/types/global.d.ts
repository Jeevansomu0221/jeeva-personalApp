// src/types/global.d.ts
interface Window {
  Beep?: (frequency: number, duration: number) => void;
  webkitAudioContext?: typeof AudioContext;
  webkitOfflineAudioContext?: typeof OfflineAudioContext;
}

// For AudioContext in older browsers
interface Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}