import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export type Category = 'Puisi' | 'Cerpen' | 'Diary' | 'Quote' | 'Draft Bebas';
export type Mood = 'Melankolis' | 'Romantis' | 'Hujan Malam' | 'Sunyi' | 'Fantasy' | 'Dark Poetry' | 'Morning Light';

export interface Document {
  id: string;
  title: string;
  content: string;
  category: Category;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
}

interface AppState {
  documents: Document[];
  activeDocId: string | null;
  focusMode: boolean;
  typewriterMode: boolean;
  currentMood: Mood;
  audioVolume: number;
  isAudioMuted: boolean;
  activeAudio: string | null;
  selectedText: string;
  userDictionary: string[];
  spellCheckEnabled: boolean;
  
  // Actions
  addDocument: (category?: Category) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setActiveDoc: (id: string | null) => void;
  setFocusMode: (focus: boolean) => void;
  toggleTypewriterMode: () => void;
  setMood: (mood: Mood) => void;
  setAudio: (audio: string | null) => void;
  setAudioVolume: (volume: number) => void;
  toggleAudioMute: () => void;
  setSelectedText: (text: string) => void;
  toggleSpellCheck: () => void;
  addToDictionary: (word: string) => void;
  removeFromDictionary: (word: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      documents: [
        {
          id: 'welcome-doc',
          title: 'Selamat Datang di Lumina',
          content: 'Sebuah ruang tenang untuk menuangkan jiwa ke dalam kata-kata.\n\nMulailah menulis puisi, cerpen, atau sekadar catatan harianmu di sini. Rasakan nuansa klasik yang menenangkan pikiran.',
          category: 'Draft Bebas',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: ['welcome'],
          isFavorite: true,
          isPinned: true,
        }
      ],
      activeDocId: 'welcome-doc',
      focusMode: false,
      typewriterMode: false,
      currentMood: 'Sunyi',
      audioVolume: 0.5,
      isAudioMuted: false,
      activeAudio: null,
      selectedText: '',
      userDictionary: [],
      spellCheckEnabled: true,

      addDocument: (category = 'Draft Bebas') => {
        const newDoc: Document = {
          id: generateId(),
          title: '',
          content: '',
          category,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: [],
          isFavorite: false,
          isPinned: false,
        };
        set((state) => ({
          documents: [newDoc, ...state.documents],
          activeDocId: newDoc.id,
          focusMode: false, // Exit focus mode when creating new doc
        }));
      },

      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc
          ),
        }));
      },

      deleteDocument: (id) => {
        set((state) => {
          const newDocs = state.documents.filter((doc) => doc.id !== id);
          return {
            documents: newDocs,
            activeDocId: state.activeDocId === id ? (newDocs[0]?.id || null) : state.activeDocId,
          };
        });
      },

      setActiveDoc: (id) => set({ activeDocId: id }),
      setFocusMode: (focus) => set({ focusMode: focus }),
      toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),
      setMood: (mood) => set({ currentMood: mood }),
      setAudio: (audio) => set({ activeAudio: audio }),
      setAudioVolume: (volume) => set({ audioVolume: volume }),
      toggleAudioMute: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
      setSelectedText: (text) => set({ selectedText: text }),
      toggleSpellCheck: () => set((state) => ({ spellCheckEnabled: !state.spellCheckEnabled })),
      addToDictionary: (word) => set((state) => ({ 
        userDictionary: Array.from(new Set([...state.userDictionary, word.toLowerCase().trim()]))
      })),
      removeFromDictionary: (word) => set((state) => ({
        userDictionary: state.userDictionary.filter(w => w !== word.toLowerCase().trim())
      })),
    }),
    {
      name: 'lumina-storage',
    }
  )
);
