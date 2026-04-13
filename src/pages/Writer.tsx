import React, { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { RightPanel } from '../components/RightPanel';
import { AudioPlayer } from '../components/AudioPlayer';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Writer() {
  const { currentMood, isSidebarOpen, isRightPanelOpen, setSidebarOpen, setRightPanelOpen } = useStore();

  // Handle auto-closing panels on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setRightPanelOpen(false);
      } else {
        setSidebarOpen(true);
        setRightPanelOpen(true);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.className = cn(
      'text-vintage-ink selection:bg-vintage-accent selection:text-vintage-paper overflow-hidden transition-colors duration-1000',
      getMoodBackgroundClass(currentMood),
      getMoodFontClass(currentMood)
    );
  }, [currentMood]);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      <AudioPlayer />
      
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 lg:z-0 transition-transform duration-300 lg:translate-x-0 w-72",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </div>

      <main className="flex-1 min-w-0 h-full">
        <Editor />
      </main>

      {/* RightPanel Overlay for Mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isRightPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setRightPanelOpen(false)}
      />

      <div className={cn(
        "fixed lg:relative inset-y-0 right-0 z-50 lg:z-0 transition-transform duration-300 lg:translate-x-0 w-80",
        isRightPanelOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <RightPanel />
      </div>
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
