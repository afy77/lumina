import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

// Mapping moods to audio URLs
// TIPS: Jika Anda ingin menggunakan file MP3 sendiri:
// 1. Simpan file MP3 Anda di folder 'public/audio/'
// 2. Ganti URL di bawah menjadi '/audio/nama_file.mp3'
const moodAudioMap: Record<string, string> = {
  'Sunyi': '/audio/sunyi.mp3',
  'Hujan Malam': '/audio/hujan.mp3', 
  'Romantis': '/audio/romantis.mp3', 
  'Melankolis': '/audio/melankolis.mp3', 
  'Morning Light': '/audio/morning.mp3', 
  'Fantasy': '/audio/fantasy.mp3', 
  'Dark Poetry': '/audio/dark.mp3', 
};

export function AudioPlayer() {
  const { currentMood, audioVolume, isAudioMuted } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !isAudioMuted && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log('Interaction play prevented:', e));
      }
    };

    window.addEventListener('click', playAudio, { once: true });
    return () => window.removeEventListener('click', playAudio);
  }, [isAudioMuted]);

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
      if (isAudioMuted) {
        audioRef.current.pause();
      } else {
        // Only play if src is set
        if (audioRef.current.src) {
          audioRef.current.play().catch(e => console.log('Audio play prevented:', e));
        }
      }
    }
  }, [audioVolume, isAudioMuted]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      className="hidden" 
    />
  );
}
