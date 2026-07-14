import React from 'react';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { Portfolio } from './components/Portfolio';
import { BookingEngine } from './components/BookingEngine';
import { Academy } from './components/Academy';
import { About } from './components/About';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian text-white font-body">
      <Navbar />
      <Hero />
      <About />
      <Portfolio />
      <BookingEngine />
      <Academy />
      <Footer />
    </div>
  );
};

export default App;
