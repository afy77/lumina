import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Writer } from './pages/Writer';
import { Admin } from './pages/Admin';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ className: 'font-serif !bg-vintage-paper !text-vintage-ink !border !border-vintage-border shadow-2xl' }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/write" element={<Writer />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
