import React from 'react';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { BookingEngine } from '../components/BookingEngine';
import { Academy } from '../components/Academy';
import { About } from '../components/About';
import { Portfolio } from '../components/Portfolio';
import { Partners } from '../components/Partners';
import { Footer } from '../components/Footer';

export const PublicSite: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian text-white font-body">
      <Navbar />
      <Hero />
      <About />
      <Portfolio />
      <BookingEngine />
      <Academy />
      <Partners />
      <Footer />
    </div>
  );
};
