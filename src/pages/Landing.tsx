import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PenTool, Sparkles, Heart, Share2, ArrowRight, Loader2, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Category } from '../store/useStore';
import { supabase } from '../lib/supabase';

interface PublicPoem {
  id: string;
  title: string;
  author_name: string;
  category: Category;
  cover_url: string;
  likes_count: number;
  content: string;
  created_at: string;
}

const categories: Category[] = ['Puisi', 'Cerpen', 'Diary', 'Quote', 'Draft Bebas'];

export function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [likedPoems, setLikedPoems] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_liked_poems');
    return saved ? JSON.parse(saved) : [];
  });
  const [poems, setPoems] = useState<PublicPoem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoem, setSelectedPoem] = useState<PublicPoem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;

  const fetchPoems = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true);
      setPage(1);
    }
    
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('public_poems')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (selectedCategory !== 'Semua') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = (query as any).ilike('title', `%${searchQuery}%`);
      }

      const { data, count, error } = await query;
      
      if (error) throw error;
      
      if (isLoadMore) {
        setPoems(prev => [...prev, ...(data || [])]);
        setPage(currentPage);
      } else {
        setPoems(data || []);
      }

      if (count !== null && (from + (data?.length || 0)) >= count) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
    } catch (error) {
      console.error('Error fetching poems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, [selectedCategory, searchQuery]);

  // Deep linking for shared poems
  useEffect(() => {
    const checkSharedPoem = async () => {
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get('id');
      if (sharedId) {
        try {
          const { data, error } = await supabase
            .from('public_poems')
            .select('*')
            .eq('id', sharedId)
            .single();
          
          if (data && !error) {
            setSelectedPoem(data);
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (err) {
          console.error("Shared poem not found", err);
        }
      }
    };
    checkSharedPoem();
  }, []);

  const handleLike = async (poem: PublicPoem) => {
    if (likedPoems.includes(poem.id)) {
      alert('Anda sudah menyukai karya ini sebelumnya ❤️');
      return;
    }

    setLikedPoems(prev => {
      const newLiked = [...prev, poem.id];
      localStorage.setItem('lumina_liked_poems', JSON.stringify(newLiked));
      return newLiked;
    });
    
    if (selectedPoem?.id === poem.id) {
      setSelectedPoem({ ...selectedPoem, likes_count: selectedPoem.likes_count + 1 });
    }
    setPoems(prev => prev.map(p => p.id === poem.id ? { ...p, likes_count: p.likes_count + 1 } : p));

    try {
      await supabase
        .from('public_poems')
        .update({ likes_count: poem.likes_count + 1 })
        .eq('id', poem.id);
    } catch (error) {
      console.error('Failed to update likes', error);
    }
  };

  const handleShare = async (poem: PublicPoem) => {
    const shareUrl = `${window.location.origin}?id=${poem.id}`;
    const shareData = {
      title: `LUMINA: ${poem.title}`,
      text: `Baca karya indah berjudul "${poem.title}" oleh ${poem.author_name} di LUMINA.`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Tautan karya berhasil disalin! Silakan tempel di WA/IG Anda.');
    }
  };

  // Reset body scroll on unmount or selectedPoem
  useEffect(() => {
    document.body.style.overflow = selectedPoem ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPoem]);

  const SidebarContent = () => (
    <div className="p-8 flex flex-col h-full">
      <div 
        onClick={() => document.getElementById('landing-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })} 
        className="font-cinzel text-3xl font-bold tracking-widest text-vintage-ink mb-16 text-center cursor-pointer"
      >
        LUMINA
      </div>

      <div className="flex-1 space-y-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-vintage-accent opacity-40 mb-6 text-center">Kategori</p>
          <div className="flex flex-col gap-2">
            {['Semua', ...categories].map(cat => (
              <button 
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat as Category | 'Semua');
                  setIsMenuOpen(false);
                  document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={cn(
                  "py-3 text-center text-sm font-bold tracking-[0.2em] uppercase transition-all rounded-full",
                  selectedCategory === cat ? "bg-vintage-ink text-vintage-paper shadow-md scale-105" : "text-vintage-ink opacity-60 hover:opacity-100 hover:bg-black/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <Link to="/write" className="flex items-center justify-center gap-3 w-full py-4 bg-vintage-ink text-vintage-paper rounded-full text-xs font-bold tracking-widest uppercase hover:bg-vintage-accent transition-all shadow-xl group">
          <PenTool size={16} className="group-hover:rotate-12 transition-transform" /> Tulis Puisi
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-vintage-paper bg-paper-texture font-cormorant text-vintage-ink selection:bg-vintage-accent selection:text-vintage-paper overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 left-0 z-50 glass-vintage border-r border-vintage-border/10">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-vintage-paper bg-paper-texture z-[70] shadow-2xl md:hidden border-r border-vintage-border"
            >
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 p-2 bg-black/5 rounded-full z-50">
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPoem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoem(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-paper-texture bg-vintage-paper rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-vintage-border z-10"
            >
              <button 
                onClick={() => setSelectedPoem(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-5/12 h-64 md:h-auto overflow-hidden bg-black/5">
                <img src={selectedPoem.cover_url || 'https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt={selectedPoem.title} />
              </div>
              <div className="flex-1 overflow-y-auto p-10 md:p-16">
                <span className="text-xs font-bold uppercase tracking-widest text-vintage-accent mb-4 block">{selectedPoem.category}</span>
                <h2 className="font-playfair text-4xl font-bold mb-4">{selectedPoem.title}</h2>
                <p className="italic mb-8 font-serif">Oleh {selectedPoem.author_name}</p>
                <div className="h-px bg-vintage-ink/10 mb-8" />
                <pre className="font-cormorant text-xl leading-relaxed whitespace-pre-wrap italic">{selectedPoem.content}</pre>
                
                <div className="mt-12 flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(selectedPoem)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all",
                      likedPoems.includes(selectedPoem.id) 
                        ? "border-vintage-accent bg-vintage-accent/10 text-vintage-accent" 
                        : "border-vintage-border hover:border-vintage-ink hover:bg-black/5"
                    )}
                  >
                    <Heart size={16} className={cn(likedPoems.includes(selectedPoem.id) ? "fill-vintage-accent" : "")} />
                    {selectedPoem.likes_count} Suka
                  </button>
                  <button 
                    onClick={() => handleShare(selectedPoem)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-vintage-border hover:border-vintage-ink hover:bg-black/5 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    <Share2 size={16} />
                    Bagikan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main id="landing-main-scroll" className="flex-1 h-screen overflow-y-auto relative hide-scrollbar">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 glass-vintage border-b border-vintage-border/10 px-6 py-4 flex justify-between items-center">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-black/5 rounded-full"><Menu size={24} /></button>
          <span className="font-cinzel text-xl font-bold tracking-widest text-vintage-ink">LUMINA</span>
          <div className="w-10" />
        </div>

        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 border-b border-vintage-border bg-[radial-gradient(circle_at_center,_var(--color-vintage-paper-dark)_0%,_transparent_100%)]">
          <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto py-20">
            <p className="mb-4 tracking-[0.5em] uppercase text-[10px] font-bold opacity-40">Sastra Digital Terkurasi</p>
            <h1 className="font-cinzel text-6xl sm:text-7xl md:text-9xl font-bold mb-8 tracking-tighter text-vintage-ink">LUMINA</h1>
            <div className="w-16 h-px bg-vintage-accent mx-auto mb-8 opacity-40" />
            <p className="text-xl md:text-3xl italic leading-relaxed font-serif px-4">
              "Tempat setiap diksi menemukan nadanya, <br className="hidden md:block" /> dan setiap rasa menemukan rumahnya."
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/write" className="w-64 sm:w-auto px-10 py-4 bg-vintage-ink text-vintage-paper rounded-full font-bold uppercase tracking-widest text-xs shadow-xl">Mulai Menulis</Link>
              <button onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="w-64 sm:w-auto px-10 py-4 border border-vintage-ink/20 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/5 transition-colors">Jelajahi Karya</button>
            </div>
          </div>
        </section>

        <div id="explore" className="relative w-full max-w-7xl mx-auto px-6 pt-24 pb-20">
          
          <div className="relative z-20 text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vintage-accent opacity-60 mb-2 block">The Community</span>
            <h2 className="font-playfair text-3xl md:text-5xl font-bold uppercase tracking-tight">Karya-Karya Pilihan</h2>
            <div className="w-12 h-1 bg-vintage-accent mx-auto mt-6" />
          </div>

          <div className="sticky top-[80px] z-40 bg-vintage-paper/95 backdrop-blur-md p-4 rounded-full border border-vintage-border mb-16 shadow-sm mx-auto max-w-md hidden md:block">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                placeholder="Cari judul atau penyair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-black/5 outline-none focus:ring-1 focus:ring-vintage-accent focus:border-vintage-accent transition-all text-sm font-serif italic border-none"
              />
            </div>
          </div>
          
          {/* Mobile search */}
          <div className="md:hidden sticky top-[80px] z-40 bg-vintage-paper/95 backdrop-blur-md p-4 rounded-full border border-vintage-border mb-12 shadow-sm">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-black/5 outline-none border-none text-sm font-serif italic"
              />
            </div>
          </div>

          {/* Poems Grid */}
          <div className="relative z-10 w-full min-h-[400px]">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center py-32 bg-vintage-paper/50 backdrop-blur-sm rounded-3xl">
                <Loader2 size={48} className="animate-spin mb-6 opacity-40" />
                <p className="tracking-[0.5em] uppercase text-xs font-bold opacity-40">Menyusun Kata...</p>
              </div>
            )}

            {poems.length > 0 ? (
              <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 transition-opacity duration-300", isLoading ? "opacity-30" : "opacity-100")}>
              {poems.map((poem) => (
                <div 
                  key={poem.id}
                  onClick={() => setSelectedPoem(poem)}
                  className="group cursor-pointer bg-white/40 p-4 rounded-[2rem] border border-vintage-border hover:bg-white/80 transition-all shadow-sm hover:shadow-xl animate-fade-in"
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] mb-6 shadow-inner">
                    <img 
                      src={poem.cover_url || 'https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=400'} 
                      alt={poem.title} 
                      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-vintage-ink/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="flex justify-between items-center text-vintage-paper transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest">
                          <Heart size={14} className="fill-vintage-accent text-vintage-accent" />
                          {poem.likes_count}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                          Baca
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md text-vintage-ink text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-sm">
                        {poem.category}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 pb-2 text-center">
                    <h3 className="font-playfair text-xl font-bold leading-tight group-hover:text-vintage-accent transition-colors duration-300 mb-2 truncate">
                      {poem.title}
                    </h3>
                    <div className="text-xs opacity-50 uppercase tracking-widest font-bold truncate">
                      {poem.author_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <Sparkles className="mx-auto mb-6 opacity-10" size={48} />
              <p className="font-serif italic text-2xl opacity-30">Belum ada karya untuk kategori ini...</p>
            </div>
          )}
          </div>

          {poems.length > 0 && hasMore && !isLoading && (
            <div className="mt-16 text-center">
              <button 
                onClick={() => fetchPoems(true)}
                className="px-8 py-3 border border-vintage-ink/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}

          <div className="mt-40 border-t border-vintage-ink/5 pt-20 text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <h4 className="font-playfair text-3xl md:text-4xl font-bold italic">"Jadilah bagian dari keabadian kata."</h4>
              <p className="opacity-50 text-lg leading-relaxed font-serif">Karya-karya yang Anda bagikan akan menjadi lentera bagi mereka yang sedang mencari makna.</p>
              <Link 
                to="/write" 
                className="inline-flex items-center gap-3 text-vintage-accent font-bold tracking-[0.3em] hover:gap-6 transition-all uppercase text-xs"
              >
                Tulis & Bagikan Karya Anda <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <footer className="border-t border-vintage-border py-20 px-6 text-center space-y-6">
          <h5 className="font-cinzel text-xl tracking-[0.5em] font-bold opacity-30">LUMINA</h5>
          <div className="flex justify-center gap-8 opacity-40 text-[10px] uppercase font-bold tracking-widest">
            <a href="#" className="hover:text-vintage-accent transition-colors">Tentang</a>
            <a href="#" className="hover:text-vintage-accent transition-colors">Arsip</a>
            <a href="#" className="hover:text-vintage-accent transition-colors">Kebijakan</a>
          </div>
          <p className="text-[10px] opacity-20 uppercase tracking-[0.2em] font-bold pt-8 flex items-center justify-center gap-4">
            Disusun dengan jiwa &copy; 2026
            <Link to="/admin" className="hover:opacity-100 transition-opacity">Moderasi</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
