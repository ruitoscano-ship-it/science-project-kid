// Reusable SVG icons + Professor Eureka mascot
// Simple geometric shapes only — no over-detailed SVGs

const VarIcon = ({ name, size = 24 }) => {
  const s = size;
  const stroke = '#2C2A4A';
  const sw = 2.2;
  switch (name) {
    case 'meteo': // satellite dish
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18 L12 10 L20 18 Z" fill="#7FC8E8" />
          <line x1="12" y1="10" x2="12" y2="20" />
          <circle cx="18" cy="6" r="2" fill="#FFD23F" />
          <path d="M14 8 Q16 6 18 6" />
        </svg>
      );
    case 'dam': // dam wall + water
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 16 Q12 11 21 16 L21 20 L3 20 Z" fill="#4A9FD9" />
          <rect x="9" y="6" width="6" height="12" fill="#C9A06B" />
        </svg>
      );
    case 'tree':
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="14" width="4" height="6" fill="#A85439" />
          <circle cx="12" cy="10" r="6" fill="#6BBE5E" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="3" width="10" height="18" rx="2" fill="#fff" />
          <rect x="9" y="6" width="6" height="9" fill="#FFD23F" />
          <circle cx="12" cy="18" r="0.9" fill={stroke} />
        </svg>
      );
    case 'tower': // watchtower
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 21 L8 8 L16 8 L18 21 Z" fill="#C9A06B" />
          <path d="M5 8 L19 8 L17 4 L7 4 Z" fill="#A85439" />
          <rect x="10" y="12" width="4" height="4" fill="#FFD23F" />
        </svg>
      );
    case 'firebreak':
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" fill="#6BBE5E" />
          <rect x="15" y="3" width="6" height="6" fill="#6BBE5E" />
          <rect x="3" y="15" width="6" height="6" fill="#6BBE5E" />
          <rect x="15" y="15" width="6" height="6" fill="#6BBE5E" />
          <rect x="9" y="3" width="6" height="18" fill="#E8B85C" />
        </svg>
      );
    case 'plane':
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14 L11 12 L17 6 L20 7 L15 13 L21 17 L19 18 L13 16 L11 20 L9 19 L10 15 L4 16 Z" fill="#E8845C" />
        </svg>
      );
    case 'broom':
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4 L20 10" />
          <path d="M5 21 L13 13 L17 17 L9 19 Z" fill="#E8B85C" />
        </svg>
      );
    case 'sensor': // squiggly wave
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="#fff" />
          <path d="M5 12 L8 12 L9 8 L11 16 L13 9 L15 14 L19 12" stroke="#E8845C" strokeWidth="2.4" />
        </svg>
      );
    case 'building':
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="4" width="14" height="17" fill="#C9A06B" />
          <rect x="8" y="8" width="3" height="3" fill="#FFD23F" />
          <rect x="13" y="8" width="3" height="3" fill="#FFD23F" />
          <rect x="8" y="14" width="3" height="3" fill="#FFD23F" />
          <rect x="13" y="14" width="3" height="3" fill="#FFD23F" />
        </svg>
      );
    case 'school': // school with flag
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="11" fill="#FFF1B8" />
          <path d="M3 10 L12 4 L21 10 Z" fill="#E8845C" />
          <line x1="14" y1="6" x2="14" y2="2" />
          <path d="M14 2 L18 3 L14 4 Z" fill="#E8845C" />
          <rect x="10" y="14" width="4" height="7" fill="#A85439" />
        </svg>
      );
    case 'bolt': // lightning + ground
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
          <path d="M13 2 L8 12 H12 L10 22 L18 10 H13 L16 2 Z" fill="#FFD23F" stroke={stroke} />
          <line x1="4" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'droplet': // water drop
      return (
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
          <path d="M12 3 Q6 10 6 15 Q6 20 12 20 Q18 20 18 15 Q18 10 12 3 Z" fill="#4A9FD9" stroke={stroke} />
          <path d="M10 14 Q12 17 14 14" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        </svg>
      );
    default:
      return <svg width={s} height={s}><rect width="100%" height="100%" fill="#ddd" /></svg>;
  }
};

// Big mascot — friendly round-headed scientist with glasses
const Mascot = ({ size = 180, mood = 'happy' }) => {
  const stroke = '#2C2A4A';
  const sw = 3;
  return (
    <svg viewBox="0 0 200 220" width={size} height={size} fill="none">
      {/* coat body */}
      <path d="M50 220 L60 130 Q100 110 140 130 L150 220 Z" fill="#FFFDF7" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* coat lapels */}
      <path d="M100 122 L80 160 L100 175 L120 160 Z" fill="#FFFDF7" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* tie */}
      <path d="M100 130 L94 138 L100 148 L106 138 Z" fill="#E8845C" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M97 148 L92 175 L108 175 L103 148 Z" fill="#E8845C" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* arms */}
      <ellipse cx="56" cy="170" rx="14" ry="22" fill="#FFFDF7" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="144" cy="170" rx="14" ry="22" fill="#FFFDF7" stroke={stroke} strokeWidth={sw} />
      {/* hands */}
      <circle cx="56" cy="195" r="10" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      <circle cx="144" cy="195" r="10" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      {/* neck */}
      <rect x="92" y="110" width="16" height="14" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      {/* head */}
      <circle cx="100" cy="78" r="42" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      {/* hair tuft */}
      <path d="M64 70 Q70 38 100 38 Q130 38 136 70 Q130 56 110 56 Q90 56 84 64 Q76 62 64 70 Z" fill="#3D2E22" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* ears */}
      <ellipse cx="58" cy="80" rx="5" ry="8" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="142" cy="80" rx="5" ry="8" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      {/* glasses */}
      <circle cx="85" cy="80" r="12" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <circle cx="115" cy="80" r="12" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <line x1="97" y1="80" x2="103" y2="80" stroke={stroke} strokeWidth={sw} />
      {/* eyes */}
      <circle cx="85" cy="80" r="3.5" fill={stroke} />
      <circle cx="115" cy="80" r="3.5" fill={stroke} />
      <circle cx="86" cy="78.5" r="1.2" fill="#fff" />
      <circle cx="116" cy="78.5" r="1.2" fill="#fff" />
      {/* eyebrows */}
      <path d="M76 64 L94 62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <path d="M106 62 L124 64" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* mouth */}
      {mood === 'happy' && (
        <path d="M88 100 Q100 110 112 100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />
      )}
      {mood === 'sad' && (
        <path d="M88 106 Q100 96 112 106" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />
      )}
      {/* badge */}
      <circle cx="76" cy="148" r="6" fill="#FFD23F" stroke={stroke} strokeWidth={sw} />
      <text x="76" y="151" fontSize="7" fontFamily="Fredoka" fontWeight="700" fill={stroke} textAnchor="middle">E</text>
    </svg>
  );
};

// Mini head-only mascot for tips
const MascotMini = ({ size = 56, mood = 'happy' }) => {
  const stroke = '#2C2A4A';
  const sw = 3;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
      <circle cx="50" cy="50" r="38" fill="#F5D5B3" stroke={stroke} strokeWidth={sw} />
      <path d="M14 44 Q20 14 50 14 Q80 14 86 44 Q80 30 60 30 Q40 30 34 38 Q26 36 14 44 Z" fill="#3D2E22" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="36" cy="52" r="11" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <circle cx="64" cy="52" r="11" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <line x1="47" y1="52" x2="53" y2="52" stroke={stroke} strokeWidth={sw} />
      <circle cx="36" cy="52" r="3" fill={stroke} />
      <circle cx="64" cy="52" r="3" fill={stroke} />
      {mood === 'happy' && <path d="M40 72 Q50 80 60 72" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />}
      {mood === 'sad' && <path d="M40 76 Q50 68 60 76" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />}
    </svg>
  );
};

// Yellow star for results
const Star = ({ filled = true, size = 44 }) => (
  <svg className={`star ${filled ? '' : 'off'}`} viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M12 2 L14.7 8.6 L22 9.2 L16.5 13.9 L18.2 21 L12 17.3 L5.8 21 L7.5 13.9 L2 9.2 L9.3 8.6 Z"
      fill={filled ? '#FFD23F' : '#D9D6CC'} stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

Object.assign(window, { VarIcon, Mascot, MascotMini, Star });
