import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PenTool, Sparkles, Heart, Share2, ArrowRight, Loader2, X, Menu } from 'lucide-react';
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
  const [poems, setPoems] = useState<PublicPoem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoem, setSelectedPoem] = useState<PublicPoem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch poems from Supabase
  const fetchPoems = async () => {
    setIsLoading(true);
    try {
      // Adding a small delay or unique param to bypass any potential caching
      let query = supabase
        .from('public_poems')
        .select('*')
        .order('created_at', { ascending: false });

      // Force no-cache by adding a filter that is always true but unique
      // query = query.filter('id', 'neq', '00000000-0000-0000-0000-000000000000');

      if (selectedCategory !== 'Semua') {
        query = (query as any).eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = (query as any).ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      console.log('Lumina: Fetched', data?.length, 'public poems.');
      setPoems(data || []);
    } catch (error) {
      console.error('Error fetching poems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, [selectedCategory, searchQuery]);

  // Fix body styles on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";
    document.body.style.position = "static";
    document.body.style.top = "";
    document.body.style.width = "";
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedPoem ? 'hidden' : 'auto';
  }, [selectedPoem]);

  return (
    <div className="w-full min-h-screen bg-vintage-paper bg-paper-texture font-cormorant text-vintage-ink selection:bg-vintage-accent selection:text-vintage-paper">
      
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-vintage border-b border-vintage-border/10 px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-cinzel text-2xl font-bold tracking-widest text-vintage-ink">
            LUMINA
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {['Semua', ...categories].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={cn(
                    "text-[10px] font-bold tracking-[0.2em] uppercase transition-colors hover:text-vintage-accent",
                    selectedCategory === cat ? "text-vintage-accent underline underline-offset-8" : "opacity-60"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Link to="/write" className="px-6 py-2 bg-vintage-ink text-vintage-paper rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-vintage-accent transition-all">
              Tulis Puisi
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-vintage-paper bg-paper-texture z-[70] shadow-2xl p-8 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <span className="font-cinzel text-xl font-bold tracking-widest">MENU</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 mb-12">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-vintage-accent opacity-40">Kategori</p>
                  <div className="flex flex-col gap-4">
                    {['Semua', ...categories].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat as any);
                          setIsMenuOpen(false);
                          const element = document.getElementById('explore');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={cn(
                          "text-left text-2xl font-playfair italic transition-all",
                          selectedCategory === cat ? "text-vintage-accent translate-x-2" : "opacity-60 hover:opacity-100 hover:translate-x-1"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-vintage-accent opacity-40">Pencarian</p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari judul..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-vintage-border bg-black/5 outline-none font-serif"
                    />
                  </div>
                </div>

                <div className="mt-auto">
                  <Link 
                    to="/write" 
                    className="flex items-center justify-center gap-3 w-full py-4 bg-vintage-ink text-vintage-paper rounded-full font-bold uppercase tracking-widest text-xs hover:bg-vintage-accent transition-all"
                  >
                    <PenTool size={16} /> Mulai Menulis
                  </Link>
                </div>
              </div>
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
              
              <div className="w-full md:w-5/12 h-64 md:h-auto overflow-hidden">
                <img src={selectedPoem.cover_url || 'https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt={selectedPoem.title} />
              </div>
              <div className="flex-1 overflow-y-auto p-10 md:p-16">
                <span className="text-xs font-bold uppercase tracking-widest text-vintage-accent mb-4 block">{selectedPoem.category}</span>
                <h2 className="font-playfair text-4xl font-bold mb-4">{selectedPoem.title}</h2>
                <p className="italic mb-8 font-serif">Oleh {selectedPoem.author_name}</p>
                <div className="h-px bg-vintage-ink/10 mb-8" />
                <pre className="font-cormorant text-xl leading-relaxed whitespace-pre-wrap italic">{selectedPoem.content}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="relative w-full min-h-screen md:min-h-[85vh] flex flex-col items-center justify-center text-center px-6 border-b border-vintage-border bg-[radial-gradient(circle_at_center,_var(--color-vintage-paper-dark)_0%,_transparent_100%)]">
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto pt-32 pb-20 md:py-20">
          <p className="mb-4 tracking-[0.5em] uppercase text-[10px] font-bold opacity-40">Sastra Digital Terkurasi</p>
          <h1 className="font-cinzel text-6xl sm:text-7xl md:text-9xl font-bold mb-8 tracking-tighter text-vintage-ink">LUMINA</h1>
          <div className="w-16 h-px bg-vintage-accent mx-auto mb-8 opacity-40" />
          <p className="text-xl md:text-3xl italic leading-relaxed font-serif px-4">
            "Tempat setiap diksi menemukan nadanya, <br className="hidden md:block" /> dan setiap rasa menemukan rumahnya."
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/write" className="w-64 sm:w-auto px-10 py-4 bg-vintage-ink text-vintage-paper rounded-full font-bold uppercase tracking-widest text-xs">Mulai Menulis</Link>
            <a href="#explore" className="w-64 sm:w-auto px-10 py-4 border border-vintage-ink/20 rounded-full font-bold uppercase tracking-widest text-xs">Jelajahi Karya</a>
          </div>
        </div>
      </section>

      <div id="explore" className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-52 pb-20 md:py-32 scroll-mt-60">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vintage-accent opacity-60 mb-2 block">The Community</span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold uppercase tracking-tight">Karya-Karya Pilihan</h2>
          <div className="w-12 h-1 bg-vintage-accent mx-auto mt-6" />
        </div>

        <div className="bg-vintage-paper/95 p-6 rounded-3xl border border-vintage-border shadow-soft mb-16">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-wrap justify-center gap-2">
              {['Semua', ...categories].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all",
                    selectedCategory === cat ? "bg-vintage-ink text-vintage-paper" : "bg-black/5 hover:bg-black/10 opacity-60"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                placeholder="Cari judul atau penyair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-vintage-border bg-black/5 outline-none focus:ring-1 focus:ring-vintage-accent focus:border-vintage-accent transition-all text-sm font-serif italic"
              />
            </div>
          </div>
        </div>

        {/* Poems Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20 min-h-[400px]">
            <Loader2 size={48} className="animate-spin mb-6" />
            <p className="tracking-[0.5em] uppercase text-xs font-bold">Menyusun Kata...</p>
          </div>
        ) : poems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {poems.map((poem, i) => (
              <motion.div 
                key={poem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.1 }}
                onClick={() => setSelectedPoem(poem)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] mb-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] transition-all duration-500">
                  <img 
                    src={poem.cover_url || 'https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=400'} 
                    alt={poem.title} 
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-vintage-ink/60 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex justify-between items-center text-vintage-paper">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-widest">
                        <Heart size={14} className="fill-vintage-accent text-vintage-accent" />
                        {poem.likes_count}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                        {Math.ceil(poem.content.split(' ').length / 200)} mnt baca
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-6 left-6">
                    <span className="bg-vintage-paper/90 backdrop-blur-md text-vintage-ink text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm">
                      {poem.category}
                    </span>
                  </div>
                </div>

                <div className="px-2">
                  <h3 className="font-playfair text-2xl font-bold leading-tight group-hover:text-vintage-accent transition-colors duration-300 mb-3">
                    {poem.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs opacity-50 uppercase tracking-widest font-bold">
                    <div className="w-4 h-[1px] bg-vintage-ink" />
                    <span>{poem.author_name}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <Sparkles className="mx-auto mb-6 opacity-10" size={48} />
            <p className="font-serif italic text-2xl opacity-30">Belum ada gema kata di sini...</p>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-40 border-t border-vintage-ink/5 pt-20 text-center"
        >
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
        </motion.div>
      </div>

      <footer className="border-t border-vintage-border py-20 px-6 text-center space-y-6">
        <h5 className="font-cinzel text-xl tracking-[0.5em] font-bold opacity-30">LUMINA</h5>
        <div className="flex justify-center gap-8 opacity-40 text-[10px] uppercase font-bold tracking-widest">
          <a href="#" className="hover:text-vintage-accent transition-colors">Tentang</a>
          <a href="#" className="hover:text-vintage-accent transition-colors">Arsip</a>
          <a href="#" className="hover:text-vintage-accent transition-colors">Kebijakan</a>
        </div>
        <p className="text-[10px] opacity-20 uppercase tracking-[0.2em] font-bold pt-8">Disusun dengan jiwa &copy; 2026</p>
      </footer>
    </div>
  );
}
