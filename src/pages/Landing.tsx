import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PenTool, Sparkles, Heart, Share2, ArrowRight, Loader2, X } from 'lucide-react';
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

  // Fetch poems from Supabase
  const fetchPoems = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('public_poems')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'Semua') {
        query = (query as any).eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = (query as any).ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
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

  // Handle scroll lock
  useEffect(() => {
    if (selectedPoem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedPoem]);

  // Ensure body scroll is enabled and classes are reset when on landing page
  useEffect(() => {
    document.body.className = "bg-vintage-paper text-vintage-ink font-cormorant selection:bg-vintage-accent selection:text-vintage-paper overflow-y-auto";
  }, []);

  return (
    <div className="min-h-screen bg-vintage-paper bg-paper-texture overflow-y-auto font-cormorant text-vintage-ink selection:bg-vintage-accent selection:text-vintage-paper scroll-smooth">
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
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-paper-texture bg-vintage-paper rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row border border-vintage-border"
            >
              <button 
                onClick={() => setSelectedPoem(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>

              {/* Poem Cover */}
              <div className="w-full md:w-5/12 h-64 md:h-auto overflow-hidden bg-vintage-ink/5 relative">
                <img 
                  src={selectedPoem.cover_url || 'https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=800'} 
                  className="w-full h-full object-cover"
                  alt={selectedPoem.title}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:bg-gradient-to-b" />
              </div>

              {/* Poem Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-16 lg:p-20 hide-scrollbar bg-paper-texture">
                <div className="max-w-prose mx-auto">
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold uppercase tracking-[0.4em] text-vintage-accent mb-6 block"
                  >
                    {selectedPoem.category}
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-playfair text-4xl md:text-6xl font-bold mb-6 leading-tight"
                  >
                    {selectedPoem.title}
                  </motion.h2>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4 mb-12"
                  >
                    <div className="w-12 h-[1px] bg-vintage-ink" />
                    <p className="text-xl italic font-serif">Oleh {selectedPoem.author_name}</p>
                  </motion.div>
                  
                  <div className="w-full h-[0.5px] bg-vintage-ink/10 mb-12" />

                  <motion.pre 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="font-cormorant text-2xl md:text-3xl leading-relaxed text-vintage-ink/90 whitespace-pre-wrap break-words italic first-letter:text-5xl first-letter:font-playfair first-letter:mr-2"
                  >
                    {selectedPoem.content}
                  </motion.pre>

                  <div className="mt-24 pt-12 border-t border-vintage-ink/5 flex justify-between items-center opacity-40 text-[10px] tracking-[0.3em] uppercase font-bold">
                    <span>Lumina Archives</span>
                    <span>{new Date(selectedPoem.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden border-b border-vintage-border bg-[radial-gradient(circle_at_center,_var(--color-vintage-paper-dark)_0%,_transparent_100%)]">
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 tracking-[1em] uppercase text-xs font-bold"
          >
            Sastra Digital Terkurasi
          </motion.div>
          
          <motion.h1 
            className="font-cinzel text-6xl md:text-9xl font-bold mb-8 tracking-tighter text-vintage-ink drop-shadow-sm"
          >
            LUMINA
          </motion.h1>
          
          <div className="w-24 h-px bg-vintage-accent mx-auto mb-8 opacity-50" />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="text-xl md:text-3xl italic max-w-3xl mx-auto leading-relaxed font-serif"
          >
            "Tempat setiap diksi menemukan nadanya, <br className="hidden md:block" /> dan setiap rasa menemukan rumahnya."
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-16 flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link 
              to="/write" 
              className="px-10 py-4 bg-vintage-ink text-vintage-paper rounded-full font-bold uppercase tracking-[0.3em] text-xs transition-all hover:bg-vintage-accent hover:shadow-[0_20px_40px_-10px_rgba(44,30,22,0.3)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
            >
              <PenTool size={16} className="group-hover:rotate-12 transition-transform" />
              Mulai Menulis
            </Link>
            <a 
              href="#explore" 
              className="px-10 py-4 border border-vintage-ink/20 rounded-full font-bold uppercase tracking-[0.3em] text-xs transition-all hover:bg-vintage-ink/5 flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
            >
              Jelajahi Karya <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-[1px] h-12 bg-vintage-ink" />
        </div>
        
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-vintage-accent/5 rounded-full blur-[100px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-vintage-ink/5 rounded-full blur-[100px]" />
      </section>

      {/* Explore Section */}
      <main id="explore" className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-[0.5em] text-vintage-accent opacity-60">The Community</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold">Karya-Karya Pilihan</h2>
            <div className="w-16 h-1 bg-vintage-accent mx-auto" />
          </motion.div>
        </div>

        <div className="sticky top-0 z-40 py-8 bg-vintage-paper/80 backdrop-blur-md mb-16 border-b border-vintage-border/50">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => setSelectedCategory('Semua')}
                className={cn(
                  "px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all uppercase",
                  selectedCategory === 'Semua' ? "bg-vintage-ink text-vintage-paper shadow-lg" : "hover:bg-black/5 opacity-50 hover:opacity-100"
                )}
              >
                SEMUA
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all uppercase",
                    selectedCategory === cat ? "bg-vintage-ink text-vintage-paper shadow-lg" : "hover:bg-black/5 opacity-50 hover:opacity-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
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
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
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
      </main>

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
