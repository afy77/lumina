import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
// The API key is injected via Vite's define plugin from process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function continueSentence(text: string, mood: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Lanjutkan tulisan berikut dengan gaya bahasa yang puitis, estetik, dan sesuai dengan nuansa "${mood}". Lanjutkan maksimal 2-3 kalimat saja. Jangan mengulang kalimat sebelumnya, langsung lanjutkan saja.\n\nTulisan:\n"${text}"`,
    });
    return response.text || '';
  } catch (error) {
    console.error('Error in continueSentence:', error);
    throw error;
  }
}

export async function suggestDiction(word: string, context: string, mood: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Berikan 5 sinonim atau kata ganti yang lebih puitis, indah, dan klasik untuk kata "${word}" dalam konteks kalimat "${context}". Nuansa tulisan adalah "${mood}". Berikan hanya daftar kata-katanya saja, pisahkan dengan koma.`,
    });
    const text = response.text || '';
    return text.split(',').map(w => w.trim()).filter(w => w.length > 0);
  } catch (error) {
    console.error('Error in suggestDiction:', error);
    throw error;
  }
}

export async function generateTitle(content: string, mood: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Buatkan 1 judul yang sangat puitis, estetik, dan elegan (maksimal 4 kata) untuk tulisan berikut. Nuansa tulisan adalah "${mood}". Berikan hanya judulnya saja tanpa tanda kutip.\n\nTulisan:\n"${content.substring(0, 500)}"`,
    });
    return response.text?.trim() || 'Tanpa Judul';
  } catch (error) {
    console.error('Error in generateTitle:', error);
    throw error;
  }
}

export async function generatePrompt(mood: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Berikan satu kalimat pemantik (writing prompt) yang sangat puitis dan menginspirasi untuk mulai menulis dengan nuansa "${mood}". Berikan hanya kalimatnya saja tanpa tanda kutip.`,
    });
    return response.text?.trim() || '';
  } catch (error) {
    console.error('Error in generatePrompt:', error);
    throw error;
  }
}
