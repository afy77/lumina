import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

// Mapping moods to audio URLs (using free ambient sounds or placeholders)
const moodAudioMap: Record<string, string> = {
  'Sunyi': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_c6f2e24021.mp3?filename=night-crickets-10172.mp3', // Crickets
  'Hujan Malam': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=rain-and-thunder-16705.mp3', // Rain
  'Romantis': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=soft-piano-100-bpm-121529.mp3', // Soft Piano
  'Melankolis': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=soft-piano-100-bpm-121529.mp3', // Sad Piano
  'Morning Light': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=birds-morning-113396.mp3', // Birds
  'Fantasy': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=soft-piano-100-bpm-121529.mp3', // Ethereal
  'Dark Poetry': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=rain-and-thunder-16705.mp3', // Dark ambient
};

export function AudioPlayer() {
  const { currentMood, audioVolume, isAudioMuted } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audioUrl = moodAudioMap[currentMood];
      if (audioUrl && audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        if (!isAudioMuted) {
          audioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
        }
      }
    }
  }, [currentMood, isAudioMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
      audioRef.current.muted = isAudioMuted;
    }
  }, [audioVolume, isAudioMuted]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      className="hidden" 
      crossOrigin="anonymous"
    />
  );
}
