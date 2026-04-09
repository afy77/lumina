import React, { useState } from 'react';
import { useStore, Mood } from '../store/useStore';
import { cn } from '../lib/utils';
import { Settings2, Sparkles, Volume2, VolumeX, Type, Moon, Sun, CloudRain, Flame, Coffee, Music, Loader2, X } from 'lucide-react';
import { continueSentence, generateTitle, generatePrompt, suggestDiction } from '../lib/gemini';

const moods: { name: Mood; icon: React.ElementType }[] = [
  { name: 'Sunyi', icon: Moon },
  { name: 'Hujan Malam', icon: CloudRain },
  { name: 'Romantis', icon: Flame },
  { name: 'Melankolis', icon: Coffee },
  { name: 'Morning Light', icon: Sun },
  { name: 'Fantasy', icon: Sparkles },
  { name: 'Dark Poetry', icon: Moon },
];

export function RightPanel() {
  const { 
    documents,
    activeDocId,
    updateDocument,
    focusMode, 
    currentMood, 
    setMood, 
    typewriterMode, 
    toggleTypewriterMode,
    audioVolume,
    setAudioVolume,
    isAudioMuted,
    toggleAudioMute,
    selectedText
  } = useStore();

  const activeDoc = documents.find(d => d.id === activeDocId);
  const [activeTab, setActiveTab] = useState<'tools' | 'mood'>('mood');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleContinueSentence = async () => {
    if (!activeDoc || !activeDoc.content.trim()) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const context = activeDoc.content.slice(-200);
      const continuation = await continueSentence(context, currentMood);
      updateDocument(activeDoc.id, { 
        content: activeDoc.content + (activeDoc.content.endsWith(' ') ? '' : ' ') + continuation 
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!activeDoc || !activeDoc.content.trim()) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const title = await generateTitle(activeDoc.content, currentMood);
      updateDocument(activeDoc.id, { title });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!activeDoc) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const prompt = await generatePrompt(currentMood);
      updateDocument(activeDoc.id, { 
        content: activeDoc.content + (activeDoc.content ? '\n\n' : '') + prompt 
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestDiction = async () => {
    if (!activeDoc || !selectedText.trim()) return;
    setIsGenerating(true);
    try {
      // Get some context around the selected text
      const content = activeDoc.content;
      const index = content.indexOf(selectedText);
      const contextStart = Math.max(0, index - 50);
      const contextEnd = Math.min(content.length, index + selectedText.length + 50);
      const context = content.substring(contextStart, contextEnd);
      
      const words = await suggestDiction(selectedText, context, currentMood);
      setSuggestions(words);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const replaceSelectedText = (newWord: string) => {
    if (!activeDoc || !selectedText) return;
    const newContent = activeDoc.content.replace(selectedText, newWord);
    updateDocument(activeDoc.id, { content: newContent });
    setSuggestions([]);
  };

  if (focusMode) return null;

  return (
    <div className="w-80 h-screen flex flex-col border-l border-vintage-border bg-paper-texture glass-vintage relative z-10 transition-all duration-500">
      {/* Tabs */}
      <div className="flex border-b border-vintage-border">
        <button 
          onClick={() => setActiveTab('mood')}
          className={cn(
            "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors",
            activeTab === 'mood' ? "text-vintage-ink border-b-2 border-vintage-ink" : "text-vintage-ink/40 hover:text-vintage-ink/70"
          )}
        >
          Atmosfer
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={cn(
            "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2",
            activeTab === 'tools' ? "text-vintage-ink border-b-2 border-vintage-ink" : "text-vintage-ink/40 hover:text-vintage-ink/70"
          )}
        >
          <Sparkles size={14} /> AI Tools
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
        {activeTab === 'mood' ? (
          <div className="space-y-8">
            {/* Mood Selection */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-vintage-ink-light mb-4 opacity-70">Pilih Nuansa</h3>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.name}
                    onClick={() => setMood(mood.name)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300",
                      currentMood === mood.name 
                        ? "bg-vintage-ink text-vintage-paper border-vintage-ink shadow-md" 
                        : "border-vintage-border hover:bg-black/5 text-vintage-ink/70"
                    )}
                  >
                    <mood.icon size={20} />
                    <span className="text-xs font-medium">{mood.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Controls */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-vintage-ink-light mb-4 opacity-70 flex items-center justify-between">
                <span>Audio Ambience</span>
                <button onClick={toggleAudioMute} className="hover:text-vintage-ink transition-colors">
                  {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs opacity-60">Volume</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-vintage-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-vintage-ink [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                </div>
                
                <div className="p-3 rounded-lg border border-vintage-border bg-black/5 text-sm flex items-center gap-3">
                  <Music size={16} className="opacity-50" />
                  <span className="opacity-80">Auto-play berdasarkan nuansa</span>
                </div>
              </div>
            </div>

            {/* Editor Settings */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-vintage-ink-light mb-4 opacity-70">Pengaturan Editor</h3>
              <div className="space-y-2">
                <button 
                  onClick={toggleTypewriterMode}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                    typewriterMode ? "border-vintage-ink bg-black/5" : "border-vintage-border hover:bg-black/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Type size={16} className={typewriterMode ? "text-vintage-ink" : "opacity-50"} />
                    <span className="text-sm font-medium">Typewriter Mode</span>
                  </div>
                  <div className={cn("w-8 h-4 rounded-full transition-colors relative", typewriterMode ? "bg-vintage-accent" : "bg-vintage-border")}>
                    <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", typewriterMode ? "translate-x-4" : "translate-x-0.5")} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-vintage-border bg-black/5 text-center">
              <Sparkles size={24} className="mx-auto mb-2 text-vintage-accent" />
              <h3 className="font-playfair text-lg font-bold mb-1">Inspirasi AI</h3>
              <p className="text-xs opacity-70 mb-4">Biarkan AI membantu merangkai kata-kata indah untuk tulisanmu.</p>
              
              <div className="space-y-2">
                <AIToolButton 
                  title="Saran Diksi" 
                  desc={selectedText ? `Cari sinonim untuk "${selectedText}"` : "Blok kata untuk mencari sinonim"}
                  onClick={handleSuggestDiction}
                  disabled={isGenerating || !selectedText.trim()}
                  isLoading={isGenerating && suggestions.length === 0}
                />
                
                {suggestions.length > 0 && (
                  <div className="p-3 bg-vintage-paper rounded-lg border border-vintage-border text-left relative mt-2">
                    <button 
                      onClick={() => setSuggestions([])}
                      className="absolute top-2 right-2 opacity-50 hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Pilih Kata:</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((word, i) => (
                        <button
                          key={i}
                          onClick={() => replaceSelectedText(word)}
                          className="px-2 py-1 text-sm rounded-md border border-vintage-border hover:bg-vintage-accent hover:text-vintage-paper transition-colors"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <AIToolButton 
                  title="Lanjutkan Kalimat" 
                  desc="AI akan meneruskan tulisanmu" 
                  onClick={handleContinueSentence}
                  disabled={isGenerating || !activeDoc?.content.trim()}
                  isLoading={isGenerating && suggestions.length === 0}
                />
                <AIToolButton 
                  title="Buat Judul" 
                  desc="Generate judul dari isi tulisan" 
                  onClick={handleGenerateTitle}
                  disabled={isGenerating || !activeDoc?.content.trim()}
                  isLoading={isGenerating && suggestions.length === 0}
                />
                <AIToolButton 
                  title="Prompt Menulis" 
                  desc="Dapatkan ide tulisan baru" 
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating}
                  isLoading={isGenerating && suggestions.length === 0}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AIToolButton({ title, desc, onClick, disabled, isLoading }: { title: string, desc: string, onClick: () => void, disabled?: boolean, isLoading?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left p-3 rounded-lg border border-vintage-border hover:border-vintage-accent hover:bg-vintage-accent/5 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
    >
      <div>
        <div className="font-medium text-sm group-hover:text-vintage-accent transition-colors">{title}</div>
        <div className="text-xs opacity-50 mt-0.5">{desc}</div>
      </div>
      {isLoading && <Loader2 size={16} className="animate-spin text-vintage-accent" />}
    </button>
  );
}
