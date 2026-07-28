class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;

  constructor() {
    // Restore mute setting
    const savedMute = localStorage.getItem('cyber_clicker_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cyber_clicker_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playClickSound(sfxStyle: string = 'synth') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      if (sfxStyle === 'guitar_power_chord') {
        // Electric Guitar Power Chord (Rock Overdrive)
        const freqs = [146.83, 220.00, 293.66]; // D3, A3, D4 Power Chord
        freqs.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const dist = this.ctx!.createWaveShaper();
          const gain = this.ctx!.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          // Simple distortion curve
          const curve = new Float32Array(256);
          for (let i = 0; i < 256; i++) {
            const x = (i * 2) / 256 - 1;
            curve[i] = ((3 + 10) * x * 20 * (Math.PI / 180)) / (Math.PI + 10 * Math.abs(x));
          }
          dist.curve = curve;

          gain.gain.setValueAtTime(this.volume * 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(dist);
          dist.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now);
          osc.stop(now + 0.18);
        });
      } else if (sfxStyle === 'piano_strum') {
        // Concert Grand Piano Strum
        const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const timeOffset = now + idx * 0.015;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, timeOffset);

          gain.gain.setValueAtTime(this.volume * 0.35, timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.22);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(timeOffset);
          osc.stop(timeOffset + 0.22);
        });
      } else if (sfxStyle === 'snare_pop') {
        // Crisp Snare Pop (Noise + Tone)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (sfxStyle === 'retro8bit') {
        // Retro 8-bit arcade blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.02);
        osc.frequency.setValueAtTime(783.99, now + 0.04);

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (sfxStyle === 'laser') {
        // Sci-Fi Laser Blaster
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (sfxStyle === 'bubble') {
        // Juicy Bubble Pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.05);

        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (sfxStyle === 'pluck') {
        // Acoustic Harmonic String Pluck
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.setValueAtTime(493.88, now); // B4

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.1);
        osc2.stop(now + 0.1);
      } else if (sfxStyle === 'lofi_vinyl') {
        // Warm Lofi Rhodes / Vinyl Chord
        const freqs = [220.00, 277.18, 329.63, 415.30]; // Amaj7 chord
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);

        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const tOffset = now + idx * 0.01;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, tOffset);

          gain.gain.setValueAtTime(this.volume * 0.2, tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, tOffset + 0.28);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(tOffset);
          osc.stop(tOffset + 0.28);
        });
      } else if (sfxStyle === 'cyber_beam') {
        // Cyber Synthwave Saw Bass Sweep
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(6, now);
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.12);

        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
      } else if (sfxStyle === 'crystal_glass') {
        // Celestial Crystalline Glass Chime
        const freqs = [1046.50, 1567.98, 2093.00, 3135.96]; // C6, G6, C7, G7
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const tOffset = now + idx * 0.008;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, tOffset);

          gain.gain.setValueAtTime(this.volume * 0.22, tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, tOffset + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(tOffset);
          osc.stop(tOffset + 0.25);
        });
      } else if (sfxStyle === 'oriental_tar') {
        // Persian Setar / Tar Resonant String Tremolo
        const notes = [293.66, 440.00, 587.33]; // D4, A4, D5
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const filter = this.ctx!.createBiquadFilter();
          const gain = this.ctx!.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.012);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq * 1.5, now);
          filter.Q.setValueAtTime(4, now);

          gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.012 + 0.22);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + i * 0.012);
          osc.stop(now + i * 0.012 + 0.22);
        });
      } else if (sfxStyle === 'arcade_coin') {
        // Cosmic Arcade Coin Drop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(987.77, now + 0.04); // B5

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      } else if (sfxStyle === 'heavy_sub_thump') {
        // Cyber 808 Sub Kick Thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

        gain.gain.setValueAtTime(this.volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
      } else if (sfxStyle === 'harpsichord_baroque') {
        // Baroque Harpsichord Bright Pluck
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now); // E5

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
      } else if (sfxStyle === 'zen_drop') {
        // Zen Liquid Water Drop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.07);

        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } else if (sfxStyle === 'space_laser_beam') {
        // Cosmic Warp Beam Laser
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(1750, now + 0.08);

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } else if (sfxStyle === '80s_synth_lead') {
        // Retro 80s Detuned Synth Stab
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(440, now); // A4
        osc2.frequency.setValueAtTime(444, now); // Slightly detuned

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.14);

        gain.gain.setValueAtTime(this.volume * 0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);
      } else {
        // Default Neural Synth Tap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio context policy fallback
    }
  }

  public playCritSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(300, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  public playBuySound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.001, now + i * 0.04);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + i * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  public playGoldenSpawnSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  public playGoldenClickSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.03);

        gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  public playAchievementSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(this.volume * 0.4, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  public playPrestigeSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch {
      // Ignore
    }
  }
}

export const audio = new SoundManager();
