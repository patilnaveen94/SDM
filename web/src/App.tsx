import React from 'react';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { Portfolio } from './components/Portfolio';
import { BookingEngine } from './components/BookingEngine';
import { Academy } from './components/Academy';
import { About } from './components/About';
import { Footer } from './components/Footer';

/**
 * Page flow (Business Analyst optimized):
 * 1. Hero — Cinematic first impression, brand statement
 * 2. About — Build trust/credibility (founder, govt credentials)
 * 3. Portfolio — Prove quality through visual work
 * 4. Booking — Convert interest into bookings/rentals
 * 5. Academy — Upsell training to engaged visitors
 * 6. Footer — Contact, socials, closing
 */
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
