import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '../lib/utils';
import { Maximize2, Minimize2, Star, Pin, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Editor() {
  const { documents, activeDocId, updateDocument, focusMode, setFocusMode, typewriterMode, setSelectedText } = useStore();
  const activeDoc = documents.find(d => d.id === activeDocId);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (activeDoc) {
      const words = activeDoc.content.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
    }
  }, [activeDoc?.content]);

  const handleSelectionChange = () => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      if (start !== end) {
        setSelectedText(editorRef.current.value.substring(start, end));
      } else {
        setSelectedText('');
      }
    }
  };

  // Typewriter mode effect
  useEffect(() => {
    if (typewriterMode && editorRef.current && containerRef.current) {
      const handleInput = () => {
        if (!editorRef.current || !containerRef.current) return;
        const cursorPosition = editorRef.current.selectionStart;
        const textBeforeCursor = editorRef.current.value.substring(0, cursorPosition);
        const linesBeforeCursor = textBeforeCursor.split('\n').length;
        
        // Calculate scroll position to keep current line roughly in middle
        const lineHeight = parseInt(window.getComputedStyle(editorRef.current).lineHeight) || 24;
        const targetScroll = (linesBeforeCursor * lineHeight) - (containerRef.current.clientHeight / 2);
        
        containerRef.current.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      };

      editorRef.current.addEventListener('input', handleInput);
      editorRef.current.addEventListener('keyup', handleInput);
      editorRef.current.addEventListener('click', handleInput);
      
      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener('input', handleInput);
          editorRef.current.removeEventListener('keyup', handleInput);
          editorRef.current.removeEventListener('click', handleInput);
        }
      };
    }
  }, [typewriterMode, activeDocId]);

  if (!activeDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-paper-texture">
        <div className="text-center opacity-50">
          <p className="font-cinzel text-xl mb-2">LUMINA</p>
          <p className="text-sm">Pilih atau buat tulisan baru untuk memulai.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-screen bg-paper-texture overflow-hidden transition-all duration-700">
      {/* Top Bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 transition-all duration-500",
        focusMode ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest opacity-50 border border-vintage-border px-3 py-1 rounded-full">
            {activeDoc.category}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => updateDocument(activeDoc.id, { isFavorite: !activeDoc.isFavorite })}
              className={cn("p-2 rounded-full transition-colors", activeDoc.isFavorite ? "text-vintage-accent" : "text-vintage-ink/40 hover:text-vintage-ink")}
            >
              <Star size={18} fill={activeDoc.isFavorite ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={() => updateDocument(activeDoc.id, { isPinned: !activeDoc.isPinned })}
              className={cn("p-2 rounded-full transition-colors", activeDoc.isPinned ? "text-vintage-accent" : "text-vintage-ink/40 hover:text-vintage-ink")}
            >
              <Pin size={18} fill={activeDoc.isPinned ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setFocusMode(true)}
          className="p-2 rounded-full text-vintage-ink/40 hover:text-vintage-ink transition-colors"
          title="Focus Mode"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Focus Mode Exit Button */}
      {focusMode && (
        <button 
          onClick={() => setFocusMode(false)}
          className="absolute top-6 right-6 z-30 p-3 rounded-full bg-vintage-ink text-vintage-paper opacity-0 hover:opacity-100 transition-opacity duration-300 shadow-lg"
          title="Exit Focus Mode"
        >
          <Minimize2 size={18} />
        </button>
      )}

      {/* Editor Area */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 overflow-y-auto hide-scrollbar px-8 sm:px-16 md:px-24 lg:px-48 xl:px-64 pb-32 transition-all duration-700",
          focusMode ? "pt-32" : "pt-24"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeDoc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl mx-auto w-full"
          >
            <TextareaAutosize
              value={activeDoc.title}
              onChange={(e) => updateDocument(activeDoc.id, { title: e.target.value })}
              placeholder="Judul Tulisan..."
              className="w-full bg-transparent border-none outline-none resize-none font-playfair text-4xl md:text-5xl font-bold mb-8 text-vintage-ink placeholder:text-vintage-ink/20 leading-tight"
            />
            
            <TextareaAutosize
              ref={editorRef}
              value={activeDoc.content}
              onChange={(e) => updateDocument(activeDoc.id, { content: e.target.value })}
              onSelect={handleSelectionChange}
              onKeyUp={handleSelectionChange}
              onClick={handleSelectionChange}
              placeholder="Mulai merangkai kata..."
              className="w-full bg-transparent border-none outline-none resize-none font-cormorant text-xl md:text-2xl text-vintage-ink/90 placeholder:text-vintage-ink/20 leading-relaxed min-h-[50vh]"
              spellCheck={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center z-20 transition-all duration-500 bg-gradient-to-t from-vintage-paper via-vintage-paper to-transparent",
        focusMode ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}>
        <div className="text-sm opacity-50 font-medium tracking-wide">
          {wordCount} kata • {Math.ceil(wordCount / 200)} mnt baca
        </div>
        
        <div className="text-xs opacity-40">
          Terakhir disimpan: {new Date(activeDoc.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
