import React, { useState } from 'react';
import { FloatingText, ActiveBuff } from '../types';
import { formatNumber } from '../utils/gameMath';
import { audio } from '../services/audio';

interface HeroCoreProps {
  onCoreClick: (x: number, y: number) => { earned: number; isCrit: boolean };
  activeBuffs: ActiveBuff[];
  floatingTexts: FloatingText[];
  equippedSkin?: string;
  sfxStyle?: string;
}

export const HeroCore: React.FC<HeroCoreProps> = ({
  onCoreClick,
  activeBuffs,
  floatingTexts,
  equippedSkin = 'cyber_crystal',
  sfxStyle = 'synth',
}) => {
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 80);

    const result = onCoreClick(x, y);
    if (result.isCrit) {
      audio.playCritSound();
    } else {
      audio.playClickSound(sfxStyle);
    }
  };

  const renderSkinSVG = () => {
    switch (equippedSkin) {
      case 'plasma_orb':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
            <defs>
              <radialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d8b4fe" stopOpacity="1" />
                <stop offset="50%" stopColor="#9333ea" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Plasma Orbit Rings */}
            <ellipse cx="100" cy="100" rx="85" ry="32" fill="none" stroke="url(#ringGrad1)" strokeWidth="3" opacity="0.8" className="animate-[spin_6s_linear_infinite]" />
            <ellipse cx="100" cy="100" rx="32" ry="85" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.8" className="animate-[spin_9s_linear_infinite_reverse]" />
            {/* Plasma Core */}
            <circle cx="100" cy="100" r="55" fill="url(#plasmaGlow)" />
            <circle cx="100" cy="100" r="30" fill="#ffffff" className="animate-pulse" opacity="0.9" />
            <circle cx="100" cy="100" r="16" fill="#a855f7" />
          </svg>
        );

      case 'kawaii_star':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(250,204,21,0.85)]">
            <defs>
              <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#854d0e" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Twinkle background aura */}
            <circle cx="100" cy="100" r="70" fill="url(#starGlow)" className="animate-pulse" />
            {/* Kawaii 5-Point Star */}
            <g transform="translate(100, 100)">
              <polygon
                points="0,-60 18,-18 60,-18 24,10 38,54 0,26 -38,54 -24,10 -60,-18 -18,-18"
                fill="#facc15"
                stroke="#fef08a"
                strokeWidth="3"
              />
              {/* Cute Eyes */}
              <circle cx="-16" cy="-4" r="5" fill="#1e293b" />
              <circle cx="16" cy="-4" r="5" fill="#1e293b" />
              <circle cx="-14" cy="-6" r="2" fill="#ffffff" />
              <circle cx="18" cy="-6" r="2" fill="#ffffff" />
              {/* Rosy Cheeks */}
              <circle cx="-24" cy="8" r="6" fill="#f43f5e" opacity="0.8" />
              <circle cx="24" cy="8" r="6" fill="#f43f5e" opacity="0.8" />
              {/* Smiling Mouth */}
              <path d="M -8 8 Q 0 16 8 8" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'dragon_egg':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(249,115,22,0.85)]">
            <defs>
              <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
            </defs>
            {/* Fire Aura */}
            <circle cx="100" cy="100" r="70" fill="#f97316" opacity="0.25" className="animate-ping" />
            {/* Draconic Egg Shape */}
            <path
              d="M 100 25 C 145 25 160 85 150 145 C 140 180 60 180 50 145 C 40 85 55 25 100 25 Z"
              fill="url(#dragonGrad)"
              stroke="#fdba74"
              strokeWidth="2.5"
            />
            {/* Magma Cracks */}
            <path
              d="M 100 35 L 110 65 L 90 95 L 115 125 L 95 165"
              fill="none"
              stroke="#fef08a"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <path
              d="M 110 65 L 135 80"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 90 95 L 65 110"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'neon_skull':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(236,72,153,0.85)]">
            <defs>
              <linearGradient id="skullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>
            </defs>
            {/* Cyber Grid Halo */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="8 6" className="animate-[spin_10s_linear_infinite]" />
            {/* Skull Shape */}
            <path
              d="M 60 60 C 60 25 140 25 140 60 C 140 90 130 110 125 125 L 125 145 L 75 145 L 75 125 C 70 110 60 90 60 60 Z"
              fill="url(#skullGrad)"
              stroke="#fbcfe8"
              strokeWidth="2"
            />
            {/* Optic Sockets */}
            <circle cx="82" cy="72" r="14" fill="#0f172a" />
            <circle cx="118" cy="72" r="14" fill="#0f172a" />
            <circle cx="82" cy="72" r="7" fill="#ec4899" className="animate-pulse" />
            <circle cx="118" cy="72" r="7" fill="#ec4899" className="animate-pulse" />
            {/* Cyber Teeth Grid */}
            <rect x="80" y="128" width="8" height="12" fill="#fbcfe8" rx="1" />
            <rect x="92" y="128" width="8" height="12" fill="#fbcfe8" rx="1" />
            <rect x="104" y="128" width="8" height="12" fill="#fbcfe8" rx="1" />
            <rect x="116" y="128" width="8" height="12" fill="#fbcfe8" rx="1" />
          </svg>
        );

      case 'vinyl_record':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(234,179,8,0.85)]">
            <defs>
              <linearGradient id="vinylGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>
            {/* Spinning Vinyl Record Body */}
            <g className="animate-[spin_4s_linear_infinite]">
              <circle cx="100" cy="100" r="92" fill="#18181b" stroke="url(#vinylGold)" strokeWidth="3" />
              {/* Grooves */}
              <circle cx="100" cy="100" r="82" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="100" cy="100" r="72" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="100" cy="100" r="52" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
              {/* Gold Center Label */}
              <circle cx="100" cy="100" r="35" fill="url(#vinylGold)" />
              <circle cx="100" cy="100" r="10" fill="#09090b" />
              <circle cx="100" cy="100" r="4" fill="#fef08a" />
            </g>
          </svg>
        );

      case 'oscar_trophy':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(245,158,11,0.9)]">
            <defs>
              <linearGradient id="oscarGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <radialGradient id="oscarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="85" fill="url(#oscarGlow)" className="animate-pulse" />
            <polygon points="100,15 125,60 175,65 138,100 148,150 100,125 52,150 62,100 25,65 75,60" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.4" className="animate-[spin_12s_linear_infinite]" />
            <g transform="translate(100, 100)">
              <circle cx="0" cy="-55" r="14" fill="url(#oscarGold)" stroke="#fef08a" strokeWidth="1" />
              <path d="M -16 -38 C -12 -42 12 -42 16 -38 L 12 10 C 18 20 18 40 12 45 L -12 45 C -18 40 -18 20 -12 10 Z" fill="url(#oscarGold)" stroke="#fef08a" strokeWidth="1" />
              <line x1="-12" y1="-15" x2="-2" y2="15" stroke="#fef08a" strokeWidth="2.5" />
              <line x1="12" y1="-15" x2="2" y2="15" stroke="#fef08a" strokeWidth="2.5" />
              <rect x="-30" y="45" width="60" height="20" rx="3" fill="#18181b" stroke="url(#oscarGold)" strokeWidth="2" />
              <rect x="-38" y="65" width="76" height="12" rx="2" fill="url(#oscarGold)" />
            </g>
          </svg>
        );

      case 'sunburst_guitar':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(234,88,12,0.85)]">
            <defs>
              <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#ea580c" />
                <stop offset="85%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#09090b" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="85" fill="#f97316" opacity="0.15" className="animate-ping" />
            <path d="M 100 20 C 135 25 155 60 145 100 C 160 145 130 180 100 180 C 70 180 40 145 55 100 C 45 60 65 25 100 20 Z" fill="url(#sunburstGrad)" stroke="#fb923c" strokeWidth="2" />
            <circle cx="100" cy="115" r="22" fill="#09090b" stroke="#78350f" strokeWidth="3" />
            <line x1="90" y1="20" x2="90" y2="175" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <line x1="94" y1="20" x2="94" y2="175" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <line x1="98" y1="20" x2="98" y2="175" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <line x1="102" y1="20" x2="102" y2="175" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <line x1="106" y1="20" x2="106" y2="175" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <line x1="110" y1="20" x2="110" y2="175" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <rect x="82" y="70" width="36" height="10" rx="3" fill="#18181b" stroke="#fef08a" strokeWidth="1" />
            <rect x="82" y="145" width="36" height="10" rx="3" fill="#18181b" stroke="#fef08a" strokeWidth="1" />
          </svg>
        );

      case 'gargantua_core':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_40px_rgba(129,140,248,0.9)]">
            <defs>
              <linearGradient id="diskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#38bdf8" />
                <stop offset="70%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="url(#diskGrad)" strokeWidth="8" transform="rotate(-25, 100, 100)" className="animate-[spin_6s_linear_infinite]" opacity="0.9" />
            <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="#ffffff" strokeWidth="3" transform="rotate(25, 100, 100)" className="animate-[spin_9s_linear_infinite_reverse]" opacity="0.8" />
            <circle cx="100" cy="100" r="62" fill="none" stroke="url(#diskGrad)" strokeWidth="4" className="animate-pulse" />
            <circle cx="100" cy="100" r="48" fill="#000000" stroke="#a5b4fc" strokeWidth="2" />
            <circle cx="100" cy="100" r="46" fill="#030712" />
          </svg>
        );

      case 'godfather_rose':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(225,29,72,0.9)]">
            <defs>
              <radialGradient id="roseGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="60%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#4c0519" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="88" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="14 6 4 6" className="animate-[spin_15s_linear_infinite]" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="#e11d48" strokeWidth="1.5" opacity="0.6" />
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="55" fill="url(#roseGlow)" />
              <path d="M 0 -45 C 30 -45 45 -20 35 15 C 20 40 -20 40 -35 15 C -45 -20 -30 -45 0 -45 Z" fill="#e11d48" stroke="#fda4af" strokeWidth="1.5" />
              <path d="M -25 -25 C 0 -40 25 -40 30 -15 C 35 10 10 30 -15 25 C -35 20 -35 -10 -25 -25 Z" fill="#be123c" stroke="#fecdd3" strokeWidth="1.5" />
              <path d="M -12 -12 C 0 -22 18 -22 18 -5 C 18 10 0 18 -12 10 Z" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M 0 45 L 0 75" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
              <path d="M 0 58 Q 20 50 30 62" stroke="#16a34a" fill="none" strokeWidth="3" strokeLinecap="round" />
              <path d="M 0 65 Q -20 55 -28 70" stroke="#16a34a" fill="none" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'retro_boombox':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(236,72,153,0.9)]">
            <defs>
              <linearGradient id="boomboxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <rect x="15" y="45" width="170" height="110" rx="16" fill="#18181b" stroke="url(#boomboxGrad)" strokeWidth="3" />
            <path d="M 50 45 L 50 25 L 150 25 L 150 45" fill="none" stroke="url(#boomboxGrad)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="55" cy="100" r="30" fill="#09090b" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="55" cy="100" r="18" fill="#0284c7" className="animate-ping" opacity="0.5" />
            <circle cx="55" cy="100" r="10" fill="#f0f9ff" />
            <circle cx="145" cy="100" r="30" fill="#09090b" stroke="#ec4899" strokeWidth="2.5" />
            <circle cx="145" cy="100" r="18" fill="#db2777" className="animate-ping" opacity="0.5" />
            <circle cx="145" cy="100" r="10" fill="#f0f9ff" />
            <rect x="90" y="80" width="20" height="40" rx="2" fill="#27272a" stroke="#a1a1aa" strokeWidth="1" />
            <rect x="35" y="58" width="4" height="12" fill="#38bdf8" className="animate-pulse" />
            <rect x="42" y="55" width="4" height="15" fill="#38bdf8" className="animate-pulse" />
            <rect x="49" y="52" width="4" height="18" fill="#a855f7" className="animate-pulse" />
            <rect x="143" y="52" width="4" height="18" fill="#a855f7" className="animate-pulse" />
            <rect x="150" y="55" width="4" height="15" fill="#f43f5e" className="animate-pulse" />
            <rect x="157" y="58" width="4" height="12" fill="#f43f5e" className="animate-pulse" />
          </svg>
        );

      case 'cinema_projector':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(234,179,8,0.9)]">
            <defs>
              <linearGradient id="projectorLight" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="120,100 195,50 195,150" fill="url(#projectorLight)" />
            <g className="animate-[spin_5s_linear_infinite]">
              <circle cx="65" cy="65" r="32" fill="#18181b" stroke="#eab308" strokeWidth="2.5" />
              <circle cx="65" cy="65" r="10" fill="#eab308" />
              <line x1="65" y1="33" x2="65" y2="97" stroke="#eab308" strokeWidth="2" />
              <line x1="33" y1="65" x2="97" y2="65" stroke="#eab308" strokeWidth="2" />
            </g>
            <g className="animate-[spin_5s_linear_infinite]">
              <circle cx="130" cy="65" r="32" fill="#18181b" stroke="#eab308" strokeWidth="2.5" />
              <circle cx="130" cy="65" r="10" fill="#eab308" />
              <line x1="130" y1="33" x2="130" y2="97" stroke="#eab308" strokeWidth="2" />
              <line x1="98" y1="65" x2="162" y2="65" stroke="#eab308" strokeWidth="2" />
            </g>
            <rect x="55" y="95" width="75" height="55" rx="6" fill="#27272a" stroke="#fef08a" strokeWidth="2" />
            <circle cx="120" cy="122" r="14" fill="#18181b" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="120" cy="122" r="6" fill="#fef08a" className="animate-pulse" />
          </svg>
        );

      case 'kyber_crystal':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_40px_rgba(6,182,212,0.95)]">
            <defs>
              <linearGradient id="kyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
            </defs>
            <line x1="20" y1="180" x2="180" y2="20" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
            <line x1="20" y1="20" x2="180" y2="180" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
            <polygon points="100,25 135,75 125,145 100,175 75,145 65,75" fill="url(#kyberGrad)" stroke="#cffafe" strokeWidth="2" />
            <polygon points="100,25 115,75 100,145 85,75" fill="#ecfeff" opacity="0.6" />
            <circle cx="100" cy="100" r="30" fill="#ffffff" className="animate-ping" opacity="0.4" />
          </svg>
        );

      case 'grand_piano_core':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(56,189,248,0.85)]">
            <defs>
              <linearGradient id="pianoHarp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            <path d="M 30 150 L 30 50 C 30 30 170 30 170 90 C 170 140 120 160 30 150 Z" fill="#09090b" stroke="#38bdf8" strokeWidth="3" />
            <path d="M 45 135 L 45 60 C 45 45 155 45 155 90 C 155 125 115 145 45 135 Z" fill="url(#pianoHarp)" opacity="0.85" />
            <line x1="55" y1="65" x2="55" y2="135" stroke="#ffffff" strokeWidth="1" />
            <line x1="70" y1="65" x2="70" y2="138" stroke="#ffffff" strokeWidth="1" />
            <line x1="85" y1="65" x2="85" y2="140" stroke="#ffffff" strokeWidth="1" />
            <line x1="100" y1="65" x2="100" y2="142" stroke="#ffffff" strokeWidth="1" />
            <line x1="115" y1="65" x2="115" y2="135" stroke="#ffffff" strokeWidth="1" />
            <line x1="130" y1="70" x2="130" y2="120" stroke="#ffffff" strokeWidth="1" />
            <rect x="30" y="142" width="120" height="20" fill="#ffffff" stroke="#09090b" strokeWidth="1" />
            <rect x="42" y="142" width="6" height="12" fill="#09090b" />
            <rect x="54" y="142" width="6" height="12" fill="#09090b" />
            <rect x="78" y="142" width="6" height="12" fill="#09090b" />
            <rect x="90" y="142" width="6" height="12" fill="#09090b" />
            <rect x="102" y="142" width="6" height="12" fill="#09090b" />
          </svg>
        );

      case 'voyager_record':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_45px_rgba(250,204,21,0.95)]">
            <defs>
              <linearGradient id="voyagerGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="92" fill="#020617" stroke="url(#voyagerGold)" strokeWidth="3" />
            <g className="animate-[spin_10s_linear_infinite]">
              <circle cx="100" cy="100" r="82" fill="url(#voyagerGold)" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#713f12" strokeWidth="1" />
              <circle cx="100" cy="100" r="65" fill="none" stroke="#a16207" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="#713f12" strokeWidth="1" />
              <line x1="100" y1="100" x2="160" y2="100" stroke="#fef08a" strokeWidth="1.5" />
              <line x1="100" y1="100" x2="60" y2="140" stroke="#fef08a" strokeWidth="1.5" />
              <line x1="100" y1="100" x2="50" y2="70" stroke="#fef08a" strokeWidth="1.5" />
              <line x1="100" y1="100" x2="130" y2="40" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="14" fill="#020617" stroke="#fef08a" strokeWidth="1" />
              <circle cx="100" cy="100" r="4" fill="#fef08a" />
            </g>
          </svg>
        );

      case 'cyber_crystal':
      default:
        return (
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(0,243,255,0.6)]"
          >
            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f3ff" stopOpacity="1" />
                <stop offset="60%" stopColor="#ff007f" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f3ff" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Outer Rotating Circuit Ring 1 */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#00f3ff"
              strokeWidth="1.5"
              strokeDasharray="12 8 4 8"
              opacity="0.6"
              className="animate-[spin_12s_linear_infinite]"
            />

            {/* Outer Rotating Circuit Ring 2 (reverse) */}
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="#ff007f"
              strokeWidth="2"
              strokeDasharray="20 10 5 10"
              opacity="0.7"
              className="animate-[spin_8s_linear_infinite_reverse]"
            />

            {/* Core Radial Atmosphere */}
            <circle cx="100" cy="100" r="60" fill="url(#coreGlow)" />

            {/* Futuristic Crystal Facet Gem Core */}
            <g transform="translate(100, 100)">
              {/* Outer Gem Polygon */}
              <polygon
                points="0,-48 38,-22 38,22 0,48 -38,22 -38,-22"
                fill="url(#crystalGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.95"
              />

              {/* Inner Facet Highlights */}
              <polygon points="0,-48 0,0 38,-22" fill="#ffffff" opacity="0.35" />
              <polygon points="38,-22 0,0 38,22" fill="#000000" opacity="0.25" />
              <polygon points="0,48 0,0 -38,22" fill="#000000" opacity="0.3" />
              <polygon points="-38,-22 0,0 0,-48" fill="#ffffff" opacity="0.25" />

              {/* Center Energy Starburst */}
              <circle cx="0" cy="0" r="12" fill="#ffffff" className="animate-ping" opacity="0.8" />
              <circle cx="0" cy="0" r="8" fill="#00f3ff" />
            </g>

            {/* Orbital Particle Nodes */}
            <circle cx="100" cy="12" r="3" fill="#00f3ff" className="animate-pulse" />
            <circle cx="188" cy="100" r="3" fill="#ff007f" className="animate-pulse" />
            <circle cx="100" cy="188" r="3" fill="#00f3ff" className="animate-pulse" />
            <circle cx="12" cy="100" r="3" fill="#ff007f" className="animate-pulse" />
          </svg>
        );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-4 w-full max-w-lg mx-auto select-none">
      {/* Active Buffs / Frenzy Indicators */}
      {activeBuffs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-3 z-10">
          {activeBuffs.map((buff) => (
            <div
              key={buff.id}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-400/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{buff.name} ({buff.multiplier}x)</span>
              <span className="bg-amber-950/80 px-1 py-0.2 rounded text-[9px] text-amber-200 font-mono">
                {Math.ceil(buff.remainingSeconds)}s
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Interactive Energy Core Container */}
      <div
        id="hero-click-core"
        onClick={handleClick}
        className={`relative cursor-pointer transition-transform duration-75 ease-out touch-none ${
          isClicking ? 'scale-90 brightness-125' : 'hover:scale-105'
        }`}
      >
        {/* Outer Pulsing Glow aura */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-cyan-500/30 via-fuchsia-500/20 to-blue-600/30 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* SVG Core Object with Animated Rings */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {renderSkinSVG()}
        </div>

        {/* Floating Click Numbers */}
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {floatingTexts.map((item) => (
            <div
              key={item.id}
              style={{ left: `${item.x}px`, top: `${item.y}px` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 font-black tracking-wider transition-all duration-700 animate-[bounceFloat_0.8s_ease-out_forwards] pointer-events-none ${
                item.isCrit
                  ? 'text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] z-30 scale-125'
                  : 'text-lg sm:text-xl text-cyan-300 drop-shadow-[0_0_8px_rgba(0,243,255,0.8)] z-20'
              }`}
            >
              {item.isCrit ? `CRIT! +${formatNumber(Number(item.text))}` : `+${formatNumber(Number(item.text))}`}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[11px] tracking-widest text-cyan-400/80 uppercase font-mono">
          TAP CORE TO GENERATE NEURAL ENERGY
        </p>
      </div>
    </div>
  );
};
