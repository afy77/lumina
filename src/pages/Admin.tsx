import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trash2, Search, ArrowLeft, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface Poem {
  id: string;
  title: string;
  author_name: string;
  category: string;
  created_at: string;
}

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const ADMIN_PIN = '1234'; // User can change this later

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError('');
      fetchAdminData();
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
        .select('id, title, author_name, category, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPoems(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Hapus permanen karya "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('public_poems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPoems(poems.filter(p => p.id !== id));
    } catch (err) {
      alert('Gagal menghapus karya.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-vintage-paper bg-paper-texture flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/50 backdrop-blur-md p-8 rounded-[2rem] border border-vintage-border shadow-2xl text-center">
          <div className="w-16 h-16 bg-vintage-ink text-vintage-paper rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={24} />
          </div>
          <h1 className="font-cinzel text-2xl font-bold mb-2">Admin Lumina</h1>
          <p className="text-sm opacity-60 mb-8 font-serif italic">Gunakan PIN untuk mengakses Dashboard Moderasi</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              maxLength={4}
              placeholder="Masukkan PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-[1em] py-4 bg-black/5 border border-vintage-border rounded-2xl outline-none focus:ring-2 focus:ring-vintage-accent"
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
        </div>
      </div>
    );
  }

  const filteredPoems = poems.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-vintage-paper bg-paper-texture font-cormorant text-vintage-ink">
      {/* Header Admin */}
      <nav className="sticky top-0 z-50 glass-vintage border-b border-vintage-border/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-black/5 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-cinzel text-xl font-bold tracking-widest hidden sm:block">DASHBOARD MODERASI</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
            <ShieldCheck size={14} /> Admin Active
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div>
            <h2 className="font-playfair text-4xl font-bold mb-2">Manajemen Konten</h2>
            <p className="opacity-60 italic font-serif">Total {poems.length} karya terpublikasi di Lumina</p>
          </div>
          
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
            <input 
              type="text" 
              placeholder="Cari judul atau nama penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-vintage-border bg-white/50 outline-none focus:ring-1 focus:ring-vintage-accent italic"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-vintage-border overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-vintage-ink text-vintage-paper uppercase text-[10px] font-bold tracking-[0.2em]">
                  <th className="px-8 py-5">Tanggal</th>
                  <th className="px-8 py-5">Judul Karya</th>
                  <th className="px-8 py-5">Penulis</th>
                  <th className="px-8 py-5">Kategori</th>
                  <th className="px-8 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vintage-border/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center opacity-40">
                      <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                      <p className="font-serif italic text-lg">Memuat database...</p>
                    </td>
                  </tr>
                ) : filteredPoems.length > 0 ? (
                  filteredPoems.map((poem) => (
                    <tr key={poem.id} className="hover:bg-vintage-accent/5 transition-colors group">
                      <td className="px-8 py-6 text-xs opacity-50 font-bold">
                        {new Date(poem.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-playfair text-xl font-bold block">{poem.title}</span>
                      </td>
                      <td className="px-8 py-6 text-sm italic font-serif opacity-70">
                        {poem.author_name}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-vintage-accent bg-vintage-accent/10 px-3 py-1 rounded-full">
                          {poem.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => handleDelete(poem.id, poem.title)}
                          className="mx-auto flex items-center justify-center p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Hapus Karya"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center opacity-30 italic font-serif text-xl text-center">
                      Tidak ada karya yang ditemukan...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-10 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Lumina Management System &copy; 2026</p>
      </footer>
    </div>
  );
}
