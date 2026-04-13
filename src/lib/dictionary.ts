export const commonIndonesianWords = new Set([
  'apa', 'itu', 'saya', 'kamu', 'dia', 'mereka', 'kita', 'kami', 'ada', 'adalah', 'di', 'ke', 'dari', 
  'untuk', 'dengan', 'yang', 'ini', 'itu', 'sudah', 'belum', 'bisa', 'tidak', 'mau', 'akan', 'harus', 
  'jika', 'tetapi', 'dan', 'atau', 'bila', 'namun', 'serta', 'sangat', 'banyak', 'sedikit', 'benar', 
  'salah', 'kata', 'puisi', 'lumina', 'cinta', 'malam', 'hari', 'senja', 'langit', 'bintang', 'bulan', 
  'hati', 'jiwa', 'rasa', 'rindu', 'luka', 'duka', 'tawa', 'senyum', 'cahaya', 'gelap', 'sunyi', 
  'ramai', 'hidup', 'mati', 'waktu', 'selalu', 'pernah', 'sering', 'kadang', 'mungkin', 'pasti', 
  'mari', 'yuk', 'ayo', 'sebagai', 'pada', 'oleh', 'dalam', 'bagi', 'supaya', 'agar', 'demi', 
  'guna', 'tentang', 'seperti', 'bagai', 'laksana', 'bak', 'umpama', 'kian', 'makin', 'malah', 
  'melainkan', 'hanya', 'saja', 'pun', 'kah', 'lah', 'seolah', 'seakan', 'rupanya', 'agaknya', 
  'kiranya', 'semoga', 'moga', 'amin', 'salam', 'doa', 'tulisan', 'buku', 'pena', 'tinta', 
  'kertas', 'diksi', 'rima', 'bait', 'larik', 'seorang', 'sebuah', 'sesuatu', 'setiap', 'semua',
  'beberapa', 'kali', 'lagi', 'saja', 'pun', 'begitu', 'begini', 'tadi', 'nanti', 'besok', 'kemarin',
  'saat', 'ketika', 'setelah', 'sebelum', 'hingga', 'sampai', 'walau', 'meskipun', 'punya', 'milik',
  'buat', 'kasih', 'beri', 'ambil', 'bawa', 'datang', 'pergi', 'pulang', 'lihat', 'dengar', 'cium',
  'pikir', 'tahu', 'mengerti', 'paham', 'baca', 'tulis', 'gambar', 'nyanyi', 'duduk', 'berdiri',
  'jalan', 'lari', 'lompat', 'makan', 'minum', 'tidur', 'bangun', 'diam', 'bicara', 'cakap'
]);

export function isCommonWord(word: string): boolean {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length <= 1) return true;
  if (!isNaN(Number(cleanWord))) return true;
  return commonIndonesianWords.has(cleanWord);
}
