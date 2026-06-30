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
    profileImage: string;
  };
}

export const businessInfo: BusinessInfo = {
  name: 'SDM Camera & Solutions',
  tagline: 'Capturing Moments. Engineering Visuals. Training the Next Generation.',
  phone: '7829399506',
  email: 'info@sdmcamerasolutions.com',
  address: 'Bengaluru, Karnataka, India',
  socials: {
    instagram: 'https://instagram.com/sdmcamerasolutions',
    youtube: 'https://youtube.com/@sdmcamerasolutions',
    linkedin: 'https://linkedin.com/company/sdmcamerasolutions',
  },
  founder: {
    name: 'SDM',
    title: 'Elite Cinematographer & Master Trainer',
    bio: 'With over a decade of experience in professional cinematography, SDM has trained hundreds of aspiring filmmakers across prestigious government institutes. A visionary who bridges the gap between traditional photography mastery and cutting-edge cinema technology.',
    credentials: [
      'Certified Cinematography Instructor — Government Film Institute',
      'Master Trainer — National Skill Development Programme',
      'Award-Winning Wedding & Event Cinematographer',
      'Professional Equipment Consultant & Rental Specialist',
      'Guest Faculty — State Institute of Film & Television',
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
  | 'social_gathering';

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

// ─── Academy Courses ─────────────────────────────────────────────────────────

export interface AcademyCourse {
  id: string;
  title: string;
  category: CourseCategory;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Masterclass';
  price: number;
  currency: string;
  description: string;
  syllabus: string[];
  image: string;
  enrolledCount: number;
  rating: number;
}

export type CourseCategory = 'photography' | 'cinematography' | 'editing';

export const academyCourses: AcademyCourse[] = [
  {
    id: 'course-001',
    title: 'Professional Photography Masterclass',
    category: 'photography',
    instructor: 'SDM',
    duration: '8 Weeks',
    level: 'Masterclass',
    price: 25000,
    currency: 'INR',
    description: 'An intensive masterclass covering everything from lighting theory to advanced composition, taught at government-accredited standards.',
    syllabus: [
      'Camera Fundamentals & Manual Control',
      'Lighting Theory & Studio Techniques',
      'Composition & Visual Storytelling',
      'Portrait & Fashion Photography',
      'Event & Wedding Coverage Workflow',
      'Post-Processing & Color Grading',
      'Business of Photography',
      'Portfolio Building & Client Management',
    ],
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80',
    enrolledCount: 156,
    rating: 4.9,
  },
  {
    id: 'course-002',
    title: 'Cinematic Filmmaking Intensive',
    category: 'cinematography',
    instructor: 'SDM',
    duration: '12 Weeks',
    level: 'Advanced',
    price: 45000,
    currency: 'INR',
    description: 'Learn cinema-grade filmmaking from pre-production to final delivery using industry-standard equipment and workflows.',
    syllabus: [
      'Cinema Camera Systems & Codecs',
      'Anamorphic & Special Lens Techniques',
      'Camera Movement & Stabilization',
      'Cinematic Lighting Design',
      'Audio Recording for Film',
      'Directing & Shot Planning',
      'Color Science & DaVinci Resolve',
      'Drone Cinematography',
      'Wedding Film Storytelling',
      'Delivery & Distribution Formats',
    ],
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
    enrolledCount: 89,
    rating: 4.8,
  },
  {
    id: 'course-003',
    title: 'High-End Editing & Color Grading',
    category: 'editing',
    instructor: 'SDM',
    duration: '6 Weeks',
    level: 'Intermediate',
    price: 18000,
    currency: 'INR',
    description: 'Master DaVinci Resolve and Adobe Premiere Pro for professional-grade editing and Hollywood color grading techniques.',
    syllabus: [
      'NLE Fundamentals (Premiere & Resolve)',
      'Multi-Cam Editing Workflows',
      'Sound Design & Mixing',
      'Color Theory & Scopes',
      'Primary & Secondary Color Grading',
      'Film Emulation & Look Development',
    ],
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
    enrolledCount: 213,
    rating: 4.7,
  },
];

// ─── Portfolio Items ─────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  type: 'image' | 'video';
  thumbnail: string;
  fullUrl: string;
  description: string;
}

export type PortfolioCategory = 'all' | 'wedding' | 'corporate' | 'rental_gear' | 'videos';

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'port-001',
    title: 'Royal Palace Wedding',
    category: 'wedding',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=90',
    description: 'A grand wedding celebration captured in cinematic glory.',
  },
  {
    id: 'port-002',
    title: 'Beach Sunset Ceremony',
    category: 'wedding',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600&q=90',
    description: 'Intimate beachside vows captured during golden hour.',
  },
  {
    id: 'port-003',
    title: 'Tech Summit 2024',
    category: 'corporate',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=90',
    description: 'Full-day coverage of a leading technology summit.',
  },
  {
    id: 'port-004',
    title: 'Product Launch Event',
    category: 'corporate',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=90',
    description: 'High-energy product launch with stage lighting.',
  },
  {
    id: 'port-005',
    title: 'Cinema Rig Setup',
    category: 'rental_gear',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=1600&q=90',
    description: 'Our premium Sony FX6 rigged for a documentary shoot.',
  },
  {
    id: 'port-006',
    title: 'Drone Fleet',
    category: 'rental_gear',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1600&q=90',
    description: 'DJI Inspire 3 ready for aerial cinema operations.',
  },
  {
    id: 'port-007',
    title: 'Wedding Highlight Film',
    category: 'videos',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80',
    fullUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'A cinematic wedding highlight film showcasing our storytelling.',
  },
  {
    id: 'port-008',
    title: 'Behind the Scenes',
    category: 'videos',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
    fullUrl: 'https://www.w3schools.com/html/movie.mp4',
    description: 'A look behind the camera at our production workflow.',
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
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Booking', href: '#booking' },
  { label: 'Academy', href: '#academy' },
  { label: 'Contact', href: '#contact' },
];

export const mobileTabItems: NavItem[] = [
  { label: 'Home', href: 'Home', icon: 'home' },
  { label: 'Portfolio', href: 'Portfolio', icon: 'image' },
  { label: 'Rental', href: 'Rental', icon: 'camera' },
  { label: 'Academy', href: 'Academy', icon: 'book-open' },
];
