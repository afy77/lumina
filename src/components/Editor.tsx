import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '../lib/utils';
import { Maximize2, Minimize2, Star, Pin, Settings2, Plus, Share, Image as ImageIcon, X, Send, Loader2, Menu, PanelRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isCommonWord } from '../lib/dictionary';
import { supabase } from '../lib/supabase';

export function Editor() {
  const { documents, activeDocId, updateDocument, focusMode, setFocusMode, typewriterMode, selectedText, setSelectedText, userDictionary, spellCheckEnabled, addToDictionary, isSidebarOpen, isRightPanelOpen, setSidebarOpen, setRightPanelOpen } = useStore();
  const activeDoc = documents.find(d => d.id === activeDocId);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [wordCount, setWordCount] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareForm, setShareForm] = useState({ author: '', image: null as File | null, imageUrl: '' });
  const [isSharing, setIsSharing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShareForm({ ...shareForm, image: file, imageUrl: '' });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleShare = async () => {
    if (!activeDoc || !shareForm.author.trim()) return;
    setIsSharing(true);
    try {
      let finalImageUrl = shareForm.imageUrl;
      
      // 1. Upload Image if file exists
      if (shareForm.image && !useUrl) {
        const fileExt = shareForm.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('poem-covers')
          .upload(filePath, shareForm.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('poem-covers')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
      }

      // 2. Insert into DB
      const { error: insertError } = await supabase
        .from('public_poems')
        .insert({
          title: activeDoc.title || 'Tanpa Judul',
          content: activeDoc.content,
          author_name: shareForm.author,
          category: activeDoc.category,
          cover_url: finalImageUrl,
        });

      if (insertError) throw insertError;

      alert('Puisi berhasil dibagikan ke komunitas!');
      setIsShareModalOpen(false);
      setShareForm({ author: '', image: null, imageUrl: '' });
      setImagePreview(null);
    } catch (error: any) {
      alert('Gagal membagikan puisi: ' + error.message);
    } finally {
      setIsSharing(false);
    }
  };

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

  // Typewriter mode effect (Enhanced)
  useEffect(() => {
    if (typewriterMode && editorRef.current && containerRef.current) {
      const handleScroll = () => {
        if (!editorRef.current || !containerRef.current) return;
        
        const textarea = editorRef.current;
        const container = containerRef.current;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        
        // Menghitung perkiraan baris (termasuk perkiraan line-wrap)
        const lines = textBeforeCursor.split('\n');
        const textareaWidth = textarea.clientWidth;
        const avgCharWidth = 10; // Estimasi rata-rata lebar karakter
        const charsPerLine = Math.floor(textareaWidth / avgCharWidth);
        
        let estimatedRow = 0;
        lines.forEach(line => {
          estimatedRow += Math.max(1, Math.ceil(line.length / charsPerLine));
        });

        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 32;
        const titleHeight = 120; // Estimasi tinggi area judul dan padding atas
        
        // Target: Kursor berada di 35% tinggi layar (memberikan banyak ruang di bawah)
        const cursorY = (estimatedRow * lineHeight) + titleHeight;
        const targetScroll = cursorY - (container.clientHeight * 0.35);
        
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      };

      editorRef.current.addEventListener('input', handleScroll);
      editorRef.current.addEventListener('keyup', handleScroll);
      editorRef.current.addEventListener('click', handleScroll);
      
      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener('input', handleScroll);
          editorRef.current.removeEventListener('keyup', handleScroll);
          editorRef.current.removeEventListener('click', handleScroll);
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
      <div className={cn(
        "absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20 transition-all duration-500 bg-vintage-paper/50 backdrop-blur-sm lg:bg-transparent",
        focusMode ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 lg:hidden rounded-full text-vintage-ink/60 hover:text-vintage-accent transition-colors"
          >
            <Menu size={20} />
          </button>

          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 border border-vintage-border px-2 md:px-3 py-1 rounded-full hidden sm:inline-block">
            {activeDoc.category}
          </span>
          <div className="flex gap-1 md:gap-2">
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
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 rounded-full text-vintage-ink/40 hover:text-green-700 transition-colors"
              title="Bagikan ke Komunitas"
            >
              <Share size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setFocusMode(true)}
            className="p-2 rounded-full text-vintage-ink/40 hover:text-vintage-ink transition-colors"
            title="Focus Mode"
          >
            <Maximize2 size={18} />
          </button>
          <button 
            onClick={() => setRightPanelOpen(!isRightPanelOpen)}
            className="p-2 lg:hidden rounded-full text-vintage-ink/60 hover:text-vintage-accent transition-colors"
          >
            <PanelRight size={20} />
          </button>
        </div>
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

            <div className="relative">
              {spellCheckEnabled && (
                <div 
                  className="absolute top-0 left-0 w-full h-full pointer-events-none font-cormorant text-xl md:text-2xl text-transparent leading-relaxed whitespace-pre-wrap break-words"
                  style={{ padding: '0', margin: '0' }}
                >
                  {activeDoc.content.split(/(\s+)/).map((part, index) => {
                    const isWord = /[a-zA-Z]/.test(part);
                    const word = part.toLowerCase().replace(/[^a-z]/g, '');
                    const isWrong = isWord && !isCommonWord(word) && !(userDictionary || []).includes(word);
                    
                    return (
                      <span 
                        key={index} 
                        className={cn(isWrong ? "border-b-2 border-red-500/50 border-dashed" : "")}
                      >
                        {part}
                      </span>
                    );
                  })}
                </div>
              )}
              
              <TextareaAutosize
                ref={editorRef}
                value={activeDoc.content}
                onChange={(e) => updateDocument(activeDoc.id, { content: e.target.value })}
                onSelect={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                onClick={handleSelectionChange}
                placeholder="Mulai merangkai kata..."
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none font-cormorant text-xl md:text-2xl text-vintage-ink/90 placeholder:text-vintage-ink/20 leading-relaxed min-h-[50vh]",
                  spellCheckEnabled && "text-vintage-ink/80" // Slightly transparent to let lines show better if needed
                )}
                spellCheck={false}
              />

              {/* Spell Check Context Menu */}
              <AnimatePresence>
                {spellCheckEnabled && selectedText && !isCommonWord(selectedText.toLowerCase().replace(/[^a-z]/g, '')) && !(userDictionary || []).includes(selectedText.toLowerCase().trim()) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-50 bg-vintage-ink text-vintage-paper text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-xl cursor-pointer flex items-center gap-2"
                    style={{ 
                      left: '50%', 
                      bottom: '100%', 
                      transform: 'translateX(-50%) translateY(-10px)' 
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToDictionary(selectedText);
                      setSelectedText('');
                    }}
                  >
                    <Plus size={14} /> Simpan ke Perpustakaan
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-paper-texture bg-vintage-paper rounded-3xl shadow-2xl overflow-hidden border border-vintage-border"
            >
              <div className="p-6 border-b border-vintage-border flex justify-between items-center">
                <h3 className="font-cinzel font-bold text-lg tracking-widest">Bagikan Karya</h3>
                <button onClick={() => setIsShareModalOpen(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Nama Penulis</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama Anda..."
                    value={shareForm.author}
                    onChange={(e) => setShareForm({ ...shareForm, author: e.target.value })}
                    className="w-full bg-black/5 border border-vintage-border rounded-xl px-4 py-3 outline-none focus:border-vintage-accent transition-colors font-playfair italic"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50">Ilustrasi Cover (Opsional)</label>
                    <div className="flex bg-black/5 rounded-full p-0.5">
                      <button 
                        onClick={() => setUseUrl(false)}
                        className={cn("px-3 py-1 text-[10px] font-bold rounded-full transition-all", !useUrl ? "bg-vintage-ink text-vintage-paper shadow-sm" : "opacity-40 hover:opacity-100")}
                      >
                        UPLOAD
                      </button>
                      <button 
                        onClick={() => setUseUrl(true)}
                        className={cn("px-3 py-1 text-[10px] font-bold rounded-full transition-all", useUrl ? "bg-vintage-ink text-vintage-paper shadow-sm" : "opacity-40 hover:opacity-100")}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {useUrl ? (
                      <div className="w-full space-y-3">
                        <input 
                          type="url" 
                          placeholder="Tempel link gambar di sini..."
                          value={shareForm.imageUrl}
                          onChange={(e) => {
                            setShareForm({ ...shareForm, imageUrl: e.target.value, image: null });
                            setImagePreview(e.target.value);
                          }}
                          className="w-full bg-black/5 border border-vintage-border rounded-xl px-4 py-3 outline-none focus:border-vintage-accent transition-colors text-sm"
                        />
                        {imagePreview && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" onError={() => setImagePreview(null)} />
                          </div>
                        )}
                      </div>
                    ) : imagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md group">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          onClick={() => { setImagePreview(null); setShareForm({ ...shareForm, image: null, imageUrl: '' }); }}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-video border-2 border-dashed border-vintage-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors">
                        <ImageIcon size={32} className="opacity-20 mb-2" />
                        <span className="text-xs opacity-40">Klik untuk upload gambar</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleShare}
                    disabled={isSharing || !shareForm.author.trim()}
                    className="w-full py-4 bg-vintage-ink text-vintage-paper rounded-full font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Publikasikan Karya
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
