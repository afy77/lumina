import React, { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { RightPanel } from '../components/RightPanel';
import { AudioPlayer } from '../components/AudioPlayer';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Writer() {
  const { currentMood } = useStore();

  // Apply mood classes to body
  useEffect(() => {
    document.body.className = cn(
      'text-vintage-ink selection:bg-vintage-accent selection:text-vintage-paper overflow-hidden transition-colors duration-1000',
      getMoodBackgroundClass(currentMood),
      getMoodFontClass(currentMood)
    );
  }, [currentMood]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AudioPlayer />
      <Sidebar />
      <Editor />
      <RightPanel />
    </div>
  );
}

function getMoodBackgroundClass(mood: string) {
  switch (mood) {
    case 'Melankolis': return 'bg-[#e6dfd3] bg-paper-texture-dark';
    case 'Romantis': return 'bg-[#f5e6e6] bg-paper-texture';
    case 'Hujan Malam': return 'bg-[#d8dee6] bg-paper-texture-dark';
    case 'Sunyi': return 'bg-vintage-paper bg-paper-texture';
    case 'Fantasy': return 'bg-[#e8e3f0] bg-paper-texture';
    case 'Dark Poetry': return 'bg-[#d1ccc5] bg-paper-texture-dark';
    case 'Morning Light': return 'bg-[#fdfbf7] bg-paper-texture';
    default: return 'bg-vintage-paper bg-paper-texture';
  }
}

function getMoodFontClass(mood: string) {
  switch (mood) {
    case 'Melankolis': return 'font-eb';
    case 'Romantis': return 'font-playfair';
    case 'Hujan Malam': return 'font-cormorant';
    case 'Sunyi': return 'font-cormorant';
    case 'Fantasy': return 'font-cinzel';
    case 'Dark Poetry': return 'font-eb';
    case 'Morning Light': return 'font-playfair';
    default: return 'font-cormorant';
  }
}
