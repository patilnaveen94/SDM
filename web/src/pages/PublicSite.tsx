import React from 'react';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { BookingEngine } from '../components/BookingEngine';
import { Academy } from '../components/Academy';
import { About } from '../components/About';
import { Partners } from '../components/Partners';
import { Footer } from '../components/Footer';
import { AnnouncementPopup } from '../components/AnnouncementPopup';
import { Testimonials } from '../components/Testimonials';

export const PublicSite: React.FC = () => {
  return (
    <div className="public-site-shell min-h-screen bg-obsidian text-white font-body">
      <Navbar />
      <Hero />
      <About />
      <Testimonials />
      <BookingEngine />
      <Academy />
      <Partners />
      <Footer />
      <AnnouncementPopup />
    </div>
  );
};
