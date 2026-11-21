// ============================================================================
// SDM Camera & Solutions — Unified Data Layer (Source of Truth)
// ============================================================================

// ─── Design Tokens ───────────────────────────────────────────────────────────

export const designTokens = {
  colors: {
    obsidian: '#0A0A0A',
    darkSurface: '#111111',
    cardSurface: '#1A1A1A',
    borderSubtle: '#2A2A2A',
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
    accentGold: '#D4AF37',
    accentGoldLight: '#E8C547',
    accentGoldDark: '#B8962E',
    silver: '#C0C0C0',
    white: '#FFFFFF',
    error: '#EF4444',
    success: '#22C55E',
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
} as const;

// ─── Business Metadata ───────────────────────────────────────────────────────

export interface BusinessInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socials: {
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  founder: {
    name: string;
    title: string;
    bio: string;
    credentials: string[];
    filmography: { title: string; role: string }[];
    clientele: { category: string; organizations: string[]; relationship: string }[];
    workHistory: { role: string; organization: string; period?: string; description: string }[];
    services: { category: string; offerings: string[] }[];
    profileImage: string;
  };
}

export const businessInfo: BusinessInfo = {
  name: 'SDM Camera & Solutions',
  tagline: 'Capturing Moments. Engineering Visuals. Training the Next Generation.',
  phone: '9060606023',
  whatsapp: '8151830115',
  email: 'sandeepdft@gmail.com',
  address: 'H P World, 1639, Mahakavi Kuvempu Rd, beside Bengaluru, Mariappanapalya, Rajajinagar, Bengaluru, Karnataka 560021',
  socials: {
    instagram: 'https://instagram.com/sdmcamerasolutions',
    youtube: 'https://youtube.com/@sdmcamerasolutions',
    linkedin: 'https://linkedin.com/company/sdmcamerasolutions',
  },
  founder: {
    name: 'Sandeep Hanchin',
    title: 'Director of Photography (DoP) | Cinematographer',
    bio: 'A premium Director of Photography with 13+ years of experience bridging mainstream Kannada cinema and corporate production. Specializing in high-end visuals, production technology and logistics, and narrative innovation. Founder of SDM Camera Rentals in Rajajinagar and former academic mentor at the Government Film and Television Institute (GFTI), Hesaraghatta.',
    credentials: [
      'Feature film cinematography, visual storytelling, lighting, framing, and continuity',
      'Commercial and broadcast production to global brand benchmarks',
      'Technical direction across ARRI, RED, Sony FX systems, and complex optics',
      'Academic lectures and mentorship for emerging camera professionals',
    ],
    filmography: [
      { title: 'Hulibeera (2026)', role: 'Director of Photography' },
      { title: 'C++', role: 'Director of Photography' },
      { title: 'Antarjala (ಅಂತರ್ಜಲಾ)', role: 'Director of Photography' },
      { title: 'Kollegala (ಕೊಳ್ಳೇಗಾಲ)', role: 'Director of Photography' },
    ],
    clientele: [
      { category: 'Global tech & e-commerce', organizations: ['Google', 'Flipkart'], relationship: 'Sub-vendor' },
      { category: 'National broadcast networks', organizations: ['Times Network', 'Network-18'], relationship: 'Empanelled vendor' },
      { category: 'Industrial & corporate brands', organizations: ['WMG Bangalore', 'ACE Designers Bangalore'], relationship: 'Premium corporate projects' },
    ],
    workHistory: [
      { role: 'Freelance Director of Photography', organization: 'Independent productions', period: '2013 – Present', description: 'Designs camera, lighting, and movement workflows for narrative features, commercials, and documentaries; leads technical production logistics for corporate operations.' },
      { role: 'Founder & Technical Director', organization: 'SDM Camera Rentals, Bengaluru', description: 'Curates and supplies professional cinema equipment, consulting on production technology and camera packages for South Indian productions.' },
      { role: 'Faculty Member (Part-Time)', organization: 'Government Film and Television Institute (GFTI), Hesaraghatta', description: 'Mentored students on digital sensors, lighting, and contemporary production workflows.' },
    ],
    services: [
      { category: 'Cinematography', offerings: ['Feature films', 'Commercial advertisements', 'Documentaries'] },
      { category: 'Production coverage', offerings: ['Corporate AVs', 'Broadcasting events', 'Live music and event coverage'] },
      { category: 'Camera & technical direction', offerings: ['Cinema camera systems', 'Lighting workflows', 'Production equipment consulting'] },
    ],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
};

// ─── Event Packages ──────────────────────────────────────────────────────────

export interface EventPackage {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  startingPrice: number;
  currency: string;
  features: string[];
  image: string;
  duration: string;
}

export type EventCategory =
  | 'wedding'
  | 'engagement'
  | 'naming_ceremony'
  | 'kids_photoshoot'
  | 'pre_post_wedding'
  | 'corporate'
  | 'social_gathering'
  // Corporate shoot sub-types
  | 'podcast'
  | 'testimonials'
  | 'brand_shoot'
  | 'product_shoot'
  | 'events_vertical'
  // Documentary sub-types
  | 'documentary_news_events'
  | 'documentary_add'
  | 'documentary_movies';

export const eventPackages: EventPackage[] = [
  {
    id: 'evt-001',
    title: 'Royal Wedding Cinema',
    category: 'wedding',
    description: 'Complete cinematic coverage of your wedding with multi-camera setups, drone aerials, and a Hollywood-grade highlight reel.',
    startingPrice: 85000,
    currency: 'INR',
    features: ['4K Multi-Cam Coverage', 'Drone Aerials', '5-Min Cinematic Teaser', 'Full Event Edit', 'Photo Album (200+ Edits)'],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    duration: 'Full Day',
  },
  {
    id: 'evt-002',
    title: 'Engagement Bliss',
    category: 'engagement',
    description: 'Intimate engagement ceremony coverage with artistic portraits and candid storytelling.',
    startingPrice: 35000,
    currency: 'INR',
    features: ['2 Photographers', 'Candid Coverage', '100+ Edited Photos', 'Same-Day Preview'],
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
    duration: 'Half Day',
  },
  {
    id: 'evt-003',
    title: 'Naming Ceremony Special',
    category: 'naming_ceremony',
    description: 'Beautiful documentation of your little one\'s naming ceremony with family portraits and candid moments.',
    startingPrice: 20000,
    currency: 'INR',
    features: ['1 Photographer + 1 Videographer', 'Candid & Posed Shots', '50+ Edited Photos', 'Short Video Reel'],
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80',
    duration: '3-4 Hours',
  },
  {
    id: 'evt-004',
    title: 'Kids Wonderland Shoot',
    category: 'kids_photoshoot',
    description: 'Fun-filled themed photoshoot sessions for kids with props, costumes, and creative backdrops.',
    startingPrice: 8000,
    currency: 'INR',
    features: ['Themed Setup', 'Props Included', '30+ Edited Photos', 'Outdoor/Studio Options'],
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    duration: '2 Hours',
  },
  {
    id: 'evt-005',
    title: 'Pre/Post Wedding Cinema',
    category: 'pre_post_wedding',
    description: 'Destination-style cinematic pre-wedding or post-wedding shoots at premium locations.',
    startingPrice: 45000,
    currency: 'INR',
    features: ['Location Scouting', 'Cinematic 4K Video', 'Drone Shots', '80+ Edited Photos', 'Music Video Edit'],
    image: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&q=80',
    duration: 'Full Day',
  },
  {
    id: 'evt-006',
    title: 'Corporate Brilliance',
    category: 'corporate',
    description: 'Professional event coverage for conferences, product launches, and corporate gatherings.',
    startingPrice: 50000,
    currency: 'INR',
    features: ['Multi-Cam Setup', 'Live Streaming Option', 'Same-Day Edit', 'Executive Portraits', 'Event Highlight Reel'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    duration: 'Full Day',
  },
  {
    id: 'evt-007',
    title: 'Grand Social Gathering',
    category: 'social_gathering',
    description: 'Complete coverage for large social events — festivals, reunions, and community celebrations.',
    startingPrice: 40000,
    currency: 'INR',
    features: ['3+ Photographers', 'Videography Team', 'Drone Coverage', 'Full Event Documentation'],
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    duration: 'Full Day',
  },
  // ── Corporate Shoot sub-types ──
  {
    id: 'evt-008',
    title: 'Podcast Production',
    category: 'podcast',
    description: 'Multi-camera studio-quality podcast recording with professional lighting, audio, and post-production editing.',
    startingPrice: 18000,
    currency: 'INR',
    features: ['Multi-Cam Setup', 'Pro Audio Recording', 'Full Edit & Export', 'Thumbnail Graphics', 'YouTube-Ready Output'],
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80',
    duration: 'Half Day',
  },
  {
    id: 'evt-009',
    title: 'Testimonial Videos',
    category: 'testimonials',
    description: 'Polished customer or employee testimonial videos that build brand trust and credibility.',
    startingPrice: 12000,
    currency: 'INR',
    features: ['Studio or On-Location', '4K Recording', 'Professional Lighting', 'Branded Lower Thirds', 'Quick Turnaround'],
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
    duration: '3-4 Hours',
  },
  {
    id: 'evt-010',
    title: 'Brand Shoot',
    category: 'brand_shoot',
    description: 'Comprehensive brand photography and video content for websites, social media, and marketing collateral.',
    startingPrice: 35000,
    currency: 'INR',
    features: ['Brand Story Film', 'Team Headshots', 'Lifestyle Photography', 'Drone Exterior Shots', 'Social Cutdowns'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    duration: 'Full Day',
  },
  {
    id: 'evt-011',
    title: 'Product Shoot',
    category: 'product_shoot',
    description: 'High-end product photography and videography for e-commerce, advertising, and catalogue campaigns.',
    startingPrice: 15000,
    currency: 'INR',
    features: ['Studio Lighting Setup', 'White & Dark Backdrop', 'Hero Shots + Detail Shots', 'Lifestyle Context Photos', '360° Spin Video'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    duration: 'Full Day',
  },
  {
    id: 'evt-012',
    title: 'Events — Vertical for Social Media',
    category: 'events_vertical',
    description: 'Event coverage specifically shot and edited in vertical format (9:16) optimised for Instagram Reels, TikTok, and YouTube Shorts.',
    startingPrice: 20000,
    currency: 'INR',
    features: ['9:16 Vertical Shoot', 'Same-Day Reel Edit', 'Motion Graphics', 'Music Sync', 'Platform-Ready Delivery'],
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
    duration: 'Half to Full Day',
  },
  // ── Documentary sub-types ──
  {
    id: 'evt-013',
    title: 'Documentary — News & Events',
    category: 'documentary_news_events',
    description: 'Fast-turnaround documentary-style coverage of news events, press meets, and public interest stories with journalistic precision.',
    startingPrice: 30000,
    currency: 'INR',
    features: ['2-Cam ENG Setup', 'On-Site Audio', 'Interview Recording', 'Same-Day Rough Cut', 'Broadcast-Ready Deliverable'],
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    duration: 'As Required',
  },
  {
    id: 'evt-014',
    title: 'Documentary — Ads & Promos',
    category: 'documentary_add',
    description: 'Compelling documentary-style advertisements and promotional films that connect brands with their audience through authentic storytelling.',
    startingPrice: 55000,
    currency: 'INR',
    features: ['Script & Storyboard', 'Full Production Crew', 'Cinematic Grade', 'VoiceOver Recording', 'Multiple Deliverable Formats'],
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80',
    duration: '2-3 Days',
  },
  {
    id: 'evt-015',
    title: 'Movie Shoot',
    category: 'documentary_movies',
    description: 'End-to-end movie production support — from short films and music videos to feature-length productions with full cinema-grade equipment and crew.',
    startingPrice: 100000,
    currency: 'INR',
    features: ['Full Cinema Rig', 'Multi-Camera Setup', 'Gaffer & Lighting Crew', 'Production Sound', 'Post-Production Support'],
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
    duration: 'Multi-Day',
  },
];

// ─── Gear Rental Catalog ─────────────────────────────────────────────────────

export interface RentalGear {
  id: string;
  name: string;
  category: GearCategory;
  brand: string;
  dailyRate: number;
  currency: string;
  description: string;
  specs: string[];
  image: string;
  available: boolean;
}

export type GearCategory = 'camera' | 'lens' | 'anamorphic' | 'drone' | 'lighting';

export const rentalCatalog: RentalGear[] = [
  {
    id: 'gear-001',
    name: 'Sony FX6 Cinema Camera',
    category: 'camera',
    brand: 'Sony',
    dailyRate: 5000,
    currency: 'INR',
    description: 'Full-frame cinema camera with 4K 120fps, S-Cinetone, and dual base ISO.',
    specs: ['4K 120fps', 'Full Frame Sensor', 'Dual Base ISO', 'E-Mount', '14+ Stops DR'],
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-002',
    name: 'Canon EOS R5',
    category: 'camera',
    brand: 'Canon',
    dailyRate: 3500,
    currency: 'INR',
    description: 'Flagship mirrorless with 8K RAW video and 45MP stills for hybrid shooting.',
    specs: ['8K RAW Video', '45MP Full Frame', 'IBIS', 'Dual Card Slots', '20fps Burst'],
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-003',
    name: 'Blackmagic URSA Mini Pro 12K',
    category: 'camera',
    brand: 'Blackmagic',
    dailyRate: 8000,
    currency: 'INR',
    description: 'Cinema-grade 12K Super 35 sensor for ultimate flexibility in post-production.',
    specs: ['12K Super 35', 'BRAW Codec', '14 Stops DR', 'PL/EF Mount', 'Built-in NDs'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-004',
    name: 'Canon CN-E 50mm T1.3 L F',
    category: 'lens',
    brand: 'Canon',
    dailyRate: 2500,
    currency: 'INR',
    description: 'Premium cinema prime lens with silky-smooth bokeh and minimal breathing.',
    specs: ['T1.3 Aperture', '50mm Focal', '11-Blade Iris', 'Zero Breathing', 'EF Mount'],
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-005',
    name: 'Sirui 50mm T2.9 1.6x Anamorphic',
    category: 'anamorphic',
    brand: 'Sirui',
    dailyRate: 3000,
    currency: 'INR',
    description: 'Affordable anamorphic glass with classic oval bokeh and horizontal flares.',
    specs: ['1.6x Squeeze', 'T2.9', 'Blue Flare Coating', 'E/RF/L Mount', 'Compact Design'],
    image: 'https://images.unsplash.com/photo-1606986628253-e0af56d49205?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-006',
    name: 'DJI Inspire 3',
    category: 'drone',
    brand: 'DJI',
    dailyRate: 12000,
    currency: 'INR',
    description: 'Professional cinema drone with full-frame 8K Zenmuse X9 camera system.',
    specs: ['8K Full Frame', 'Dual Operator', 'Waypoint Nav', '28min Flight', 'Obstacle Avoidance'],
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-007',
    name: 'Aputure 600d Pro',
    category: 'lighting',
    brand: 'Aputure',
    dailyRate: 2000,
    currency: 'INR',
    description: 'Daylight-balanced LED with extreme output for large-scale production lighting.',
    specs: ['600W Output', '5600K Daylight', 'Bowens Mount', 'Wireless Control', 'Weather Sealed'],
    image: 'https://images.unsplash.com/photo-1565128939020-a1a854c1b30d?w=800&q=80',
    available: true,
  },
  {
    id: 'gear-008',
    name: 'Nanlite Forza 300B',
    category: 'lighting',
    brand: 'Nanlite',
    dailyRate: 1500,
    currency: 'INR',
    description: 'Bi-color LED with 2700K-6500K range for versatile studio and location use.',
    specs: ['300W Bi-Color', '2700-6500K', 'Bowens Mount', 'App Control', 'Quiet Fan'],
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80',
    available: false,
  },
];

// ─── Hero Video/Assets ───────────────────────────────────────────────────────

export const heroAssets = {
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-setting-up-a-camera-on-a-tripod-34490-large.mp4',
  fallbackImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=90',
  overlayGradient: 'linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,0.8))',
};

// ─── Navigation Config ───────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export const webNavItems: NavItem[] = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Booking', href: '#booking' },
  { label: 'Academy', href: '#academy' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Partners', href: '#partners' },
  { label: 'Contact', href: '#contact' },
];

export const mobileTabItems: NavItem[] = [
  { label: 'Home', href: 'Home', icon: 'home' },
  { label: 'Portfolio', href: 'Portfolio', icon: 'image' },
  { label: 'Rental', href: 'Rental', icon: 'camera' },
  { label: 'Academy', href: 'Academy', icon: 'book-open' },
];
