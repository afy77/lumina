import React from 'react';
import { useStore, Category } from '../store/useStore';
import { cn, formatDate } from '../lib/utils';
import { Plus, Book, Feather, BookOpen, Quote, FileText, Star, Pin, Trash2 } from 'lucide-react';

const categories: { name: Category; icon: React.ElementType }[] = [
  { name: 'Puisi', icon: Feather },
  { name: 'Cerpen', icon: BookOpen },
  { name: 'Diary', icon: Book },
  { name: 'Quote', icon: Quote },
  { name: 'Draft Bebas', icon: FileText },
];

export function Sidebar() {
  const { documents, activeDocId, setActiveDoc, addDocument, focusMode, deleteDocument } = useStore();

  if (focusMode) return null;

  const pinnedDocs = documents.filter(d => d.isPinned);
  const unpinnedDocs = documents.filter(d => !d.isPinned);

  return (
    <div className="w-72 h-screen flex flex-col border-r border-vintage-border bg-paper-texture glass-vintage relative z-10 transition-all duration-500">
      <div className="p-6 pb-4">
        <h1 className="font-cinzel text-2xl font-bold tracking-widest text-vintage-ink mb-6 text-center text-shadow-vintage">
          LUMINA
        </h1>
        
        <button
          onClick={() => addDocument()}
          className="w-full py-2.5 px-4 rounded-lg border border-vintage-border hover:bg-vintage-ink hover:text-vintage-paper transition-all duration-300 flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} />
          <span>Tulis Baru</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6 space-y-6">
        {/* Categories */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-vintage-ink-light mb-3 px-2 opacity-70">Kategori</h2>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => addDocument(cat.name)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-black/5 transition-colors flex items-center gap-3 text-sm group"
              >
                <cat.icon size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Documents */}
        {pinnedDocs.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-vintage-ink-light mb-3 px-2 opacity-70 flex items-center gap-1">
              <Pin size={12} /> Disematkan
            </h2>
            <div className="space-y-1">
              {pinnedDocs.map(doc => (
                <DocItem key={doc.id} doc={doc} isActive={activeDocId === doc.id} onSelect={() => setActiveDoc(doc.id)} onDelete={() => deleteDocument(doc.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Documents */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-vintage-ink-light mb-3 px-2 opacity-70">Semua Tulisan</h2>
          <div className="space-y-1">
            {unpinnedDocs.map(doc => (
              <DocItem key={doc.id} doc={doc} isActive={activeDocId === doc.id} onSelect={() => setActiveDoc(doc.id)} onDelete={() => deleteDocument(doc.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const DocItem: React.FC<{ doc: any, isActive: boolean, onSelect: () => void, onDelete: () => void }> = ({ doc, isActive, onSelect, onDelete }) => {
  return (
    <div
      className={cn(
        "group w-full text-left px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer flex flex-col gap-1 relative",
        isActive ? "bg-vintage-ink text-vintage-paper shadow-md" : "hover:bg-black/5"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate pr-4">{doc.title || 'Tanpa Judul'}</span>
        {doc.isFavorite && <Star size={12} className={isActive ? "text-vintage-paper" : "text-vintage-accent"} fill="currentColor" />}
      </div>
      <div className={cn("text-xs flex items-center justify-between", isActive ? "opacity-70" : "opacity-50")}>
        <span>{formatDate(doc.updatedAt)}</span>
        <span>{doc.category}</span>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
          isActive ? "hover:bg-white/20" : "hover:bg-black/10"
        )}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
