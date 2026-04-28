import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trash2, Search, ArrowLeft, Loader2, ShieldCheck, Lock, FileText, Heart, TrendingUp, Share2, Award, Eye, Star, EyeOff, CheckSquare, Plus, X, BarChart3, List, LayoutDashboard, Database, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface Poem {
  id: string;
  title: string;
  author_name: string;
  category: string;
  created_at: string;
  likes_count: number;
  cover_url: string;
  content: string;
  is_featured?: boolean;
  is_hidden?: boolean;
}

interface CategoryData {
  id: string;
  name: string;
  created_at: string;
}

const COLORS = ['#D4AF37', '#8B5A2B', '#2F4F4F', '#800000', '#4A5D23', '#483C32'];

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // New states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'poems' | 'categories'>('dashboard');
  const [selectedPoems, setSelectedPoems] = useState<string[]>([]);
  const [previewPoem, setPreviewPoem] = useState<Poem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Scroll to top when tab changes
  useEffect(() => {
    document.getElementById('admin-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '050606';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError('');
      fetchAdminData();
      fetchCategories();
    } else {
      setError('PIN Salah. Akses Ditolak.');
      setPin('');
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_poems')
        .select('id, title, author_name, category, created_at, likes_count, cover_url, content, is_featured, is_hidden')
        .order('created_at', { ascending: false });

      if (error) {
        const fallback = await supabase
          .from('public_poems')
          .select('id, title, author_name, category, created_at, likes_count, cover_url, content')
          .order('created_at', { ascending: false });
        
        if (fallback.error) throw fallback.error;
        setPoems((fallback.data || []).map(p => ({ ...p, is_featured: false, is_hidden: false })));
        toast.error('Kolom is_featured / is_hidden belum ada. Jalankan SQL Migration.');
      } else {
        setPoems(data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Gagal mengambil data puisi.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        setCategories([
          { id: '1', name: 'Puisi', created_at: new Date().toISOString() },
          { id: '2', name: 'Cerpen', created_at: new Date().toISOString() },
          { id: '3', name: 'Diary', created_at: new Date().toISOString() },
          { id: '4', name: 'Quote', created_at: new Date().toISOString() },
          { id: '5', name: 'Draft Bebas', created_at: new Date().toISOString() },
        ]);
        toast.error('Tabel categories belum ada. Menampilkan data dummy.');
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    toast((t) => (
      <div className="flex flex-col gap-4 p-2 text-center">
        <span className="font-playfair text-lg">Hapus permanen karya "{title}"?</span>
        <div className="flex gap-2 justify-center mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 border rounded-full text-xs">Batal</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await confirmDelete(id);
            }} 
            className="px-4 py-2 bg-red-600 text-white rounded-full text-xs"
          >
            Hapus Permanen
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const confirmDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('public_poems').delete().eq('id', id);
      if (error) throw error;
      setPoems(poems.filter(p => p.id !== id));
      setSelectedPoems(prev => prev.filter(pId => pId !== id));
      toast.success('Karya berhasil dihapus.');
    } catch (err) {
      toast.error('Gagal menghapus karya.');
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('public_poems').update({ is_featured: !currentStatus }).eq('id', id);
      if (error) throw error;
      setPoems(poems.map(p => p.id === id ? { ...p, is_featured: !currentStatus } : p));
      toast.success(!currentStatus ? 'Karya di-highlight (Featured)' : 'Highlight dihapus');
    } catch (err) {
      toast.error('Gagal mengubah status. Pastikan kolom is_featured ada.');
    }
  };

  const toggleHidden = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('public_poems').update({ is_hidden: !currentStatus }).eq('id', id);
      if (error) throw error;
      setPoems(poems.map(p => p.id === id ? { ...p, is_hidden: !currentStatus } : p));
      toast.success(!currentStatus ? 'Karya disembunyikan' : 'Karya ditampilkan');
    } catch (err) {
      toast.error('Gagal mengubah status. Pastikan kolom is_hidden ada.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPoems.length === 0) return;
    toast((t) => (
      <div className="flex flex-col gap-4 p-2 text-center">
        <span className="font-playfair text-lg">Hapus {selectedPoems.length} karya terpilih?</span>
        <div className="flex gap-2 justify-center mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 border rounded-full text-xs">Batal</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase.from('public_poems').delete().in('id', selectedPoems);
                if (error) throw error;
                setPoems(poems.filter(p => !selectedPoems.includes(p.id)));
                setSelectedPoems([]);
                toast.success(`${selectedPoems.length} karya berhasil dihapus.`);
              } catch (err) {
                toast.error('Gagal menghapus karya massal.');
              }
            }} 
            className="px-4 py-2 bg-red-600 text-white rounded-full text-xs"
          >
            Hapus Massal
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: newCategoryName.trim() })
        .select()
        .single();
      
      if (error) throw error;
      setCategories([...categories, data]);
      setNewCategoryName('');
      toast.success('Kategori ditambahkan');
    } catch (err) {
      toast.error('Gagal menambah kategori. Pastikan tabel categories ada.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Kategori dihapus');
    } catch (err) {
      toast.error('Gagal menghapus kategori.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-vintage-paper bg-paper-texture flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/50 backdrop-blur-md p-8 rounded-[2rem] border border-vintage-border shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-vintage-ink text-vintage-paper rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={24} />
          </div>
          <h1 className="font-cinzel text-2xl font-bold mb-2">Admin Lumina</h1>
          <p className="text-sm opacity-60 mb-8 font-serif italic">Gunakan PIN untuk mengakses Dashboard Moderasi</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              maxLength={6}
              placeholder="Masukkan PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-[1em] py-4 bg-black/5 border border-vintage-border rounded-2xl outline-none focus:ring-2 focus:ring-vintage-accent font-mono"
              autoFocus
            />
            {error && <p className="text-red-600 text-xs font-bold">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-vintage-ink text-vintage-paper rounded-full font-bold uppercase tracking-widest text-xs hover:bg-vintage-accent transition-all"
            >
              Masuk Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Derived state
  const filteredPoems = poems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPoems = poems.length;
  const totalLikes = poems.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const topPoem = poems.length > 0 
    ? poems.reduce((prev, current) => (prev.likes_count || 0) > (current.likes_count || 0) ? prev : current) 
    : null;

  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: poems.filter(p => p.category === cat.name).length
  })).filter(d => d.value > 0);

  const dateMap: Record<string, number> = {};
  poems.forEach(p => {
    const date = new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  const trendData = Object.entries(dateMap).map(([date, count]) => ({ date, count })).reverse().slice(-14);

  const topPoemsData = [...poems]
    .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    .slice(0, 5)
    .map(p => ({
      title: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
      fullTitle: p.title,
      likes_count: p.likes_count || 0,
    }));

  const SidebarContent = () => (
    <div className="p-8 flex flex-col h-full">
      <button onClick={() => navigate('/')} className="mb-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
        <ArrowLeft size={14} /> Kembali ke Web
      </button>
      
      <h1 className="font-cinzel text-2xl font-bold tracking-widest text-center mb-2">MODERASI</h1>
      <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20 shadow-sm mx-auto mb-16 w-fit">
        <ShieldCheck size={14} /> Active
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
          className={cn("px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-4", activeTab === 'dashboard' ? 'bg-vintage-ink text-vintage-paper shadow-lg scale-105' : 'bg-black/5 opacity-60 hover:opacity-100 hover:bg-black/10')}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button 
          onClick={() => { setActiveTab('poems'); setIsMobileMenuOpen(false); }} 
          className={cn("px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-4", activeTab === 'poems' ? 'bg-vintage-ink text-vintage-paper shadow-lg scale-105' : 'bg-black/5 opacity-60 hover:opacity-100 hover:bg-black/10')}
        >
          <List size={18} /> Karya
        </button>
        <button 
          onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }} 
          className={cn("px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-4", activeTab === 'categories' ? 'bg-vintage-ink text-vintage-paper shadow-lg scale-105' : 'bg-black/5 opacity-60 hover:opacity-100 hover:bg-black/10')}
        >
          <Database size={18} /> Kategori
        </button>
      </div>

      <div className="mt-auto text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Lumina &copy; 2026</p>
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-vintage-paper bg-paper-texture font-cormorant text-vintage-ink overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 left-0 z-50 glass-vintage border-r border-vintage-border/10">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-vintage-paper bg-paper-texture z-[70] shadow-2xl md:hidden border-r border-vintage-border">
              <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 bg-black/5 rounded-full"><X size={20} /></button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main id="admin-main-scroll" className="flex-1 h-screen overflow-y-auto relative hide-scrollbar">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 glass-vintage border-b border-vintage-border/10 px-6 py-4 flex justify-between items-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-black/5 rounded-full"><Menu size={24} /></button>
          <span className="font-cinzel text-lg font-bold tracking-widest">MODERASI</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 min-h-full">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-vintage-border shadow-soft flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-vintage-ink/5 flex items-center justify-center text-vintage-ink">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Total Karya</p>
                    <h3 className="font-playfair text-4xl font-bold">{totalPoems}</h3>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-vintage-border shadow-soft flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-vintage-accent/10 flex items-center justify-center text-vintage-accent">
                    <Heart size={24} className="fill-vintage-accent/20" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Total Apresiasi</p>
                    <h3 className="font-playfair text-4xl font-bold">{totalLikes}</h3>
                  </div>
                </div>

                <div className="bg-vintage-ink text-vintage-paper p-6 rounded-[2rem] shadow-xl flex items-center gap-6 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-white/5 rotate-12"><Award size={120} /></div>
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center relative z-10">
                    <TrendingUp size={24} />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Karya Terpopuler</p>
                    <h3 className="font-playfair text-xl font-bold truncate leading-tight">{topPoem ? topPoem.title : '-'}</h3>
                    {topPoem && <p className="text-xs italic opacity-70 mt-1">{topPoem.likes_count} Suka</p>}
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-vintage-border shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="text-vintage-accent" />
                    <h3 className="font-playfair text-2xl font-bold">Tren Publikasi Karya Baru</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(0,0,0,0.3)" tick={{fontFamily: 'Cormorant Garamond', fontSize: 12}} />
                        <YAxis stroke="rgba(0,0,0,0.3)" tick={{fontFamily: 'Cormorant Garamond', fontSize: 12}} allowDecimals={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#F8F5F0', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'Cormorant Garamond' }}
                        />
                        <Line type="monotone" dataKey="count" name="Karya Baru" stroke="#8B5A2B" strokeWidth={3} dot={{ fill: '#8B5A2B', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-vintage-border shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <PieChart className="text-vintage-accent" />
                    <h3 className="font-playfair text-2xl font-bold">Distribusi Kategori</h3>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#F8F5F0', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'Cormorant Garamond' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {categoryData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-70">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Poems Chart */}
              <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-vintage-border shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-vintage-accent" />
                  <h3 className="font-playfair text-2xl font-bold">5 Karya Paling Populer (Berdasarkan Apresiasi)</h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPoemsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="title" type="category" axisLine={false} tickLine={false} tick={{fontFamily: 'Cormorant Garamond', fontSize: 14, fontWeight: 'bold'}} width={180} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#F8F5F0', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'Cormorant Garamond' }}
                        cursor={{fill: 'rgba(0,0,0,0.03)'}}
                        labelFormatter={(label) => {
                          const poem = topPoemsData.find(p => p.title === label);
                          return poem ? poem.fullTitle : label;
                        }}
                      />
                      <Bar dataKey="likes_count" name="Total Interaksi" radius={[0, 8, 8, 0]} barSize={24}>
                        {topPoemsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* POEMS MODERATION TAB */}
          {activeTab === 'poems' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-2">Manajemen Konten</h2>
                  <p className="opacity-60 italic font-serif">Pilih, sembunyikan, atau jadikan Pilihan Editor</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3.5 rounded-xl border border-vintage-border bg-white/70 backdrop-blur-md outline-none text-sm font-bold uppercase tracking-widest text-vintage-ink/70"
                  >
                    <option value="All">Semua Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>

                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari judul..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-vintage-border bg-white/70 backdrop-blur-md outline-none focus:ring-2 focus:ring-vintage-accent transition-all italic text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <AnimatePresence>
                {selectedPoems.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm"
                  >
                    <span className="text-red-800 font-bold text-sm flex items-center gap-2">
                      <CheckSquare size={18} /> {selectedPoems.length} karya terpilih
                    </span>
                    <button 
                      onClick={handleBulkDelete}
                      className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                    >
                      Hapus Massal
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Table */}
              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-vintage-border overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-vintage-ink text-vintage-paper uppercase text-[10px] font-bold tracking-[0.2em]">
                        <th className="px-6 py-5 text-center w-12">
                          <input 
                            type="checkbox" 
                            checked={selectedPoems.length === filteredPoems.length && filteredPoems.length > 0}
                            onChange={(e) => setSelectedPoems(e.target.checked ? filteredPoems.map(p => p.id) : [])}
                            className="accent-vintage-accent w-4 h-4"
                          />
                        </th>
                        <th className="px-6 py-5">Karya</th>
                        <th className="px-6 py-5">Judul</th>
                        <th className="px-6 py-5">Kategori</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-6 py-5 text-center">Aksi Moderasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vintage-border/10">
                      {isLoading ? (
                        <tr><td colSpan={6} className="px-6 py-32 text-center"><Loader2 className="animate-spin mx-auto mb-4" size={32} /></td></tr>
                      ) : filteredPoems.length > 0 ? (
                        filteredPoems.map((poem, index) => (
                          <tr 
                            key={poem.id} 
                            className={cn("transition-colors group hover:bg-white/50 animate-fade-in", index % 2 === 0 ? "bg-black/[0.02]" : "", poem.is_hidden ? "opacity-50" : "")}
                          >
                            <td className="px-6 py-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={selectedPoems.includes(poem.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedPoems([...selectedPoems, poem.id]);
                                  else setSelectedPoems(selectedPoems.filter(id => id !== poem.id));
                                }}
                                className="accent-vintage-accent w-4 h-4"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-12 h-16 rounded-xl overflow-hidden shadow-sm relative">
                                <img src={poem.cover_url || 'https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=200'} alt={poem.title} className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-playfair text-lg font-bold flex items-center gap-2">
                                {poem.title} 
                                {poem.is_featured && <Star size={14} className="fill-vintage-accent text-vintage-accent" />}
                              </div>
                              <div className="text-xs italic font-serif opacity-70">oleh {poem.author_name} • {poem.likes_count} Suka</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-vintage-accent bg-vintage-accent/10 px-3 py-1.5 rounded-full border border-vintage-accent/20">
                                {poem.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {poem.is_hidden ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-200 text-gray-600 px-3 py-1 rounded-full border border-gray-300 flex items-center justify-center gap-1 w-fit mx-auto">
                                  <EyeOff size={12} /> Disembunyikan
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center justify-center gap-1 w-fit mx-auto">
                                  <Eye size={12} /> Publik
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setPreviewPoem(poem)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Preview Isi">
                                  <Search size={16} />
                                </button>
                                <button onClick={() => toggleFeatured(poem.id, !!poem.is_featured)} className={cn("w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-sm", poem.is_featured ? "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-amber-100 hover:text-amber-600")} title="Jadikan Pilihan Editor">
                                  <Star size={16} className={poem.is_featured ? "fill-current" : ""} />
                                </button>
                                <button onClick={() => toggleHidden(poem.id, !!poem.is_hidden)} className={cn("w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-sm", poem.is_hidden ? "bg-gray-800 text-white border-gray-900 hover:bg-gray-700" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-200")} title={poem.is_hidden ? "Tampilkan Kembali" : "Sembunyikan Karya"}>
                                  {poem.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button onClick={() => handleDelete(poem.id, poem.title)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Hapus Permanen">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="px-6 py-32 text-center opacity-30 italic font-serif text-xl">Tidak ada karya...</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-vintage-border p-8 shadow-xl">
                <h2 className="font-playfair text-3xl font-bold mb-2">Manajemen Kategori</h2>
                <p className="opacity-60 italic font-serif mb-8">Tambah atau hapus kategori untuk mengelompokkan karya</p>
                
                <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
                  <input 
                    type="text" 
                    placeholder="Nama Kategori Baru..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-xl border border-vintage-border bg-black/5 outline-none focus:border-vintage-accent font-serif italic"
                  />
                  <button type="submit" className="px-8 py-4 bg-vintage-ink text-vintage-paper rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-vintage-accent transition-all shadow-md">
                    <Plus size={16} /> Tambah
                  </button>
                </form>

                <div className="space-y-4">
                  {categories.map((cat, i) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-vintage-border rounded-xl shadow-sm">
                      <span className="font-playfair text-xl font-bold">{cat.name}</span>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Hapus Kategori"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-[2rem] flex gap-4 text-blue-800">
                <Database size={24} className="shrink-0" />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Catatan Developer</h4>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Untuk fitur ini berjalan optimal, pastikan Anda telah membuat tabel <code>categories</code> di Supabase dengan kolom <code>id</code> (UUID) dan <code>name</code> (Text). Dan tambahkan kolom <code>is_featured</code> (Boolean) serta <code>is_hidden</code> (Boolean) pada tabel <code>public_poems</code>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewPoem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewPoem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-3xl bg-vintage-paper bg-paper-texture rounded-[2rem] shadow-2xl overflow-hidden border border-vintage-border z-10 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-vintage-border/20 flex justify-between items-center bg-white/50 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-vintage-accent bg-vintage-accent/10 px-3 py-1 rounded-full border border-vintage-accent/20">
                  {previewPoem.category}
                </span>
                <button onClick={() => setPreviewPoem(null)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 md:p-12 overflow-y-auto">
                <h2 className="font-playfair text-4xl font-bold mb-4">{previewPoem.title}</h2>
                <p className="italic mb-8 font-serif opacity-70">Oleh {previewPoem.author_name}</p>
                <div className="h-px bg-vintage-ink/10 mb-8" />
                <pre className="font-cormorant text-xl leading-relaxed whitespace-pre-wrap italic">{previewPoem.content}</pre>
              </div>
              <div className="p-6 bg-white/50 border-t border-vintage-border/20 flex justify-end gap-4 backdrop-blur-md">
                <button onClick={() => { toggleHidden(previewPoem.id, !!previewPoem.is_hidden); setPreviewPoem(null); }} className="px-6 py-2.5 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
                  {previewPoem.is_hidden ? 'Tampilkan' : 'Sembunyikan'}
                </button>
                <button onClick={() => { handleDelete(previewPoem.id, previewPoem.title); setPreviewPoem(null); }} className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
                  Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
