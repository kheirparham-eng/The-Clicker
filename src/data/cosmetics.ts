export interface CosmeticItem {
  id: string;
  name: string;
  category: 'skin' | 'particle' | 'sfx';
  cost: number;
  iconName: string;
  description: string;
  previewColor?: string;
  badge?: string;
}

export const COSMETICS: CosmeticItem[] = [
  // --- CLICKABLE CORE SKINS ---
  {
    id: 'cyber_crystal',
    name: 'Cyber-Crystal',
    category: 'skin',
    cost: 0,
    iconName: 'Gem',
    description: 'Original faceted crystal pulsating with raw neural energy.',
    previewColor: '#00f3ff',
    badge: 'DEFAULT'
  },
  {
    id: 'plasma_orb',
    name: 'Plasma Energy Orb',
    category: 'skin',
    cost: 5000,
    iconName: 'Globe',
    description: 'Volatile plasma sphere surrounded by orbiting subatomic rings.',
    previewColor: '#a855f7'
  },
  {
    id: 'kawaii_star',
    name: 'Kawaii Pixel Star',
    category: 'skin',
    cost: 25000,
    iconName: 'Star',
    description: 'Adorable 8-bit star with glowing cute eyes and twinkle power.',
    previewColor: '#fbbf24'
  },
  {
    id: 'dragon_egg',
    name: 'Dragon Egg',
    category: 'skin',
    cost: 100000,
    iconName: 'Flame',
    description: 'Ancient mythical core wrapped in molten scales and burning draconic aura.',
    previewColor: '#f97316'
  },
  {
    id: 'neon_skull',
    name: 'Neon Cyber Skull',
    category: 'skin',
    cost: 500000,
    iconName: 'Skull',
    description: 'Cybernetic skull with glowing neon optic sockets and circuit grid.',
    previewColor: '#ec4899'
  },
  {
    id: 'vinyl_record',
    name: 'Golden Vinyl Record',
    category: 'skin',
    cost: 1500000,
    iconName: 'Disc',
    description: 'Spinning 180g gold vinyl record with glowing groove reflection aura.',
    previewColor: '#eab308'
  },
  {
    id: 'oscar_trophy',
    name: 'Hollywood Gold Trophy',
    category: 'skin',
    cost: 50000000,
    iconName: 'Award',
    description: 'Sleek 24K gold cinema award statuette radiating premiere glamour and star power.',
    previewColor: '#f59e0b'
  },
  {
    id: 'sunburst_guitar',
    name: 'Sunburst Electric Guitar',
    category: 'skin',
    cost: 250000000,
    iconName: 'Radio',
    description: 'Vintage 1954 sunburst rock guitar body pulsing with fiery amplifier distortion.',
    previewColor: '#ea580c'
  },
  {
    id: 'gargantua_core',
    name: 'Interstellar Black Hole',
    category: 'skin',
    cost: 1000000000,
    iconName: 'CircleDot',
    description: 'Supermassive cinematic black hole surrounded by a blinding accretion disk.',
    previewColor: '#818cf8'
  },
  {
    id: 'godfather_rose',
    name: 'Godfather Red Rose',
    category: 'skin',
    cost: 10000000000,
    iconName: 'Flame',
    description: 'Iconic velvet red rose framed by a vintage noir film reel and golden aura.',
    previewColor: '#e11d48'
  },
  {
    id: 'retro_boombox',
    name: 'Neon Synth Boombox',
    category: 'skin',
    cost: 50000000000,
    iconName: 'Disc',
    description: '80s chrome cassette boombox blasting neon pink & cyan equalizer wave peaks.',
    previewColor: '#ec4899'
  },
  {
    id: 'cinema_projector',
    name: '35mm Film Projector',
    category: 'skin',
    cost: 500000000000,
    iconName: 'Film',
    description: 'Dual spinning 35mm golden film reels beaming vintage Hollywood spotlight beams.',
    previewColor: '#eab308'
  },
  {
    id: 'kyber_crystal',
    name: 'Kyber Force Crystal',
    category: 'skin',
    cost: 5000000000000,
    iconName: 'Zap',
    description: 'Radiant plasma-infused Kyber crystal emitting a searing blue & red Force energy clash.',
    previewColor: '#06b6d4'
  },
  {
    id: 'grand_piano_core',
    name: 'Concert Grand Piano',
    category: 'skin',
    cost: 50000000000000,
    iconName: 'Music',
    description: 'Polished obsidian grand piano harp soundboard with golden string resonance.',
    previewColor: '#38bdf8'
  },
  {
    id: 'voyager_record',
    name: 'Voyager Golden Record',
    category: 'skin',
    cost: 500000000000000,
    iconName: 'Globe',
    description: 'Interstellar Golden Phonograph Record carrying Earth’s symphonies across deep space.',
    previewColor: '#facc15'
  },

  // --- PARTICLE EFFECTS ---
  {
    id: 'neon_sparks',
    name: 'Neon Sparks',
    category: 'particle',
    cost: 0,
    iconName: 'Sparkles',
    description: 'Electric cyan and magenta energy spark shower.',
    previewColor: '#00f3ff',
    badge: 'DEFAULT'
  },
  {
    id: 'music_notes',
    name: 'Musical Note Stream',
    category: 'particle',
    cost: 12000,
    iconName: 'Music',
    description: 'Floating glowing musical notes (♪, ♫, ♬, ♩) bursting in harmonic rhythm.',
    previewColor: '#c084fc'
  },
  {
    id: 'confetti',
    name: 'Confetti Blast',
    category: 'particle',
    cost: 10000,
    iconName: 'PartyPopper',
    description: 'Vibrant festive explosion of spinning multicolor confetti.',
    previewColor: '#3b82f6'
  },
  {
    id: 'hearts',
    name: 'Floating Hearts',
    category: 'particle',
    cost: 30000,
    iconName: 'Heart',
    description: 'Lovely floating pink and ruby heart particles rising upward.',
    previewColor: '#f43f5e'
  },
  {
    id: 'matrix',
    name: 'Matrix Rain',
    category: 'particle',
    cost: 150000,
    iconName: 'Terminal',
    description: 'Cascading digital green binary glyphs and cyber rain streams.',
    previewColor: '#10b981'
  },
  {
    id: 'stardust',
    name: 'Stardust Burst',
    category: 'particle',
    cost: 750000,
    iconName: 'Sun',
    description: 'Glittering golden stardust and shimmering cosmos sparkles.',
    previewColor: '#eab308'
  },

  // --- CLICK SFX ---
  {
    id: 'synth',
    name: 'Neural Synth Tap',
    category: 'sfx',
    cost: 0,
    iconName: 'Volume2',
    description: 'Clean electronic sine wave pulse.',
    previewColor: '#00f3ff',
    badge: 'DEFAULT'
  },
  {
    id: 'guitar_power_chord',
    name: 'Electric Guitar Chord',
    category: 'sfx',
    cost: 20000,
    iconName: 'Radio',
    description: 'Rock overdrive electric guitar power chord burst.',
    previewColor: '#f43f5e'
  },
  {
    id: 'piano_strum',
    name: 'Grand Piano Strum',
    category: 'sfx',
    cost: 50000,
    iconName: 'Music2',
    description: 'Resonant concert grand piano harmonic strum.',
    previewColor: '#38bdf8'
  },
  {
    id: 'snare_pop',
    name: 'Snare Pop',
    category: 'sfx',
    cost: 100000,
    iconName: 'Disc',
    description: 'Tight studio snare drum pop resonance.',
    previewColor: '#a855f7'
  },
  {
    id: 'retro8bit',
    name: 'Retro 8-Bit Pop',
    category: 'sfx',
    cost: 15000,
    iconName: 'Gamepad2',
    description: 'Chiptune square-wave blip from classic arcade cabinets.',
    previewColor: '#3b82f6'
  },
  {
    id: 'laser',
    name: 'Laser Pulse',
    category: 'sfx',
    cost: 75000,
    iconName: 'Zap',
    description: 'Sci-fi plasma blaster sound effect.',
    previewColor: '#a855f7'
  },
  {
    id: 'bubble',
    name: 'Bubble Pop',
    category: 'sfx',
    cost: 300000,
    iconName: 'Smile',
    description: 'Crisp and juicy acoustic bubble pop.',
    previewColor: '#06b6d4'
  },
  {
    id: 'pluck',
    name: 'Acoustic Pluck',
    category: 'sfx',
    cost: 1200000,
    iconName: 'Music',
    description: 'Warm harmonic string pluck resonance.',
    previewColor: '#10b981'
  },
  {
    id: 'lofi_vinyl',
    name: 'Lofi Chill Rhodes',
    category: 'sfx',
    cost: 2500000,
    iconName: 'Disc',
    description: 'Smooth, warm Lofi vinyl Rhodes major 7th chord chime.',
    previewColor: '#f59e0b'
  },
  {
    id: 'cyber_beam',
    name: 'Cyber Bass Stinger',
    category: 'sfx',
    cost: 10000000,
    iconName: 'Activity',
    description: 'Resonant synthwave saw bass drop with lowpass sweep.',
    previewColor: '#ec4899'
  },
  {
    id: 'crystal_glass',
    name: 'Celestial Glass Chime',
    category: 'sfx',
    cost: 50000000,
    iconName: 'Sparkles',
    description: 'Shimmering crystalline glass bell chord with high overtones.',
    previewColor: '#38bdf8'
  },
  {
    id: 'oriental_tar',
    name: 'Persian Setar Tremolo',
    category: 'sfx',
    cost: 250000000,
    iconName: 'Flame',
    description: 'Acoustic oriental plucked string tremolo with wooden resonance.',
    previewColor: '#f97316'
  },
  {
    id: 'arcade_coin',
    name: 'Cosmic Coin Chime',
    category: 'sfx',
    cost: 1000000000,
    iconName: 'Coins',
    description: 'Retro 8-bit dual ascending coin drop chime.',
    previewColor: '#eab308'
  },
  {
    id: 'heavy_sub_thump',
    name: '808 Sub-Bass Thump',
    category: 'sfx',
    cost: 5000000000,
    iconName: 'Volume2',
    description: 'Deep punchy 808 sub-bass kick frequency drop.',
    previewColor: '#ef4444'
  },
  {
    id: 'harpsichord_baroque',
    name: 'Baroque Harpsichord',
    category: 'sfx',
    cost: 25000000000,
    iconName: 'Music2',
    description: 'Bright dual-harmonic metallic harpsichord pluck.',
    previewColor: '#a855f7'
  },
  {
    id: 'zen_drop',
    name: 'Zen Liquid Water Drop',
    category: 'sfx',
    cost: 100000000000,
    iconName: 'Droplet',
    description: 'Calming organic liquid sine water drop pitch glide.',
    previewColor: '#06b6d4'
  },
  {
    id: 'space_laser_beam',
    name: 'Cosmic Warp Laser',
    category: 'sfx',
    cost: 500000000000,
    iconName: 'Zap',
    description: 'Futuristic ascending pitch warp laser beam.',
    previewColor: '#10b981'
  },
  {
    id: '80s_synth_lead',
    name: '80s Synthwave Stab',
    category: 'sfx',
    cost: 2500000000000,
    iconName: 'Radio',
    description: 'Retro detuned dual-sawtooth 80s synth lead stab.',
    previewColor: '#818cf8'
  }
];
