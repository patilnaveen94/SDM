import React from 'react';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Portfolio } from '../components/Portfolio';
import { BookingEngine } from '../components/BookingEngine';
import { Academy } from '../components/Academy';
import { About } from '../components/About';
import { UpdatesFeed } from '../components/UpdatesFeed';
import { Footer } from '../components/Footer';

export const PublicSite: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian text-white font-body">
      <Navbar />
      <Hero />
      <About />
      <UpdatesFeed />
      <Portfolio />
      <BookingEngine />
      <Academy />
      <Footer />
    </div>
  );
};
