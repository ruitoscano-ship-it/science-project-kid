// Cartoon SVG scenes for each disaster. They react to the simulation state.
// Convention: protection 0..1, intensity 0..1 (mission mode). damage = max(0, intensity - protection*0.95)

// --- Shared helpers ---
const Sun = ({ x, y, r = 18, withSmile = false, color = '#FFD23F' }) => (
  <g>
    <circle cx={x} cy={y} r={r + 6} fill={color} opacity="0.25" />
    <circle cx={x} cy={y} r={r} fill={color} stroke="#2C2A4A" strokeWidth="2" />
    {withSmile && (
      <g stroke="#2C2A4A" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <circle cx={x - 6} cy={y - 2} r="1.3" fill="#2C2A4A" stroke="none" />
        <circle cx={x + 6} cy={y - 2} r="1.3" fill="#2C2A4A" stroke="none" />
        <path d={`M ${x - 5} ${y + 4} Q ${x} ${y + 9} ${x + 5} ${y + 4}`} />
      </g>
    )}
  </g>
);

const Cloud = ({ x, y, scale = 1, dark = false }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx="0" cy="0" rx="28" ry="12" fill={dark ? '#9CA3B5' : '#fff'} stroke="#2C2A4A" strokeWidth="2" />
    <ellipse cx="-14" cy="-4" rx="14" ry="11" fill={dark ? '#9CA3B5' : '#fff'} stroke="#2C2A4A" strokeWidth="2" />
    <ellipse cx="10" cy="-6" rx="16" ry="12" fill={dark ? '#9CA3B5' : '#fff'} stroke="#2C2A4A" strokeWidth="2" />
  </g>
);

const Tree = ({ x, y, scale = 1, burnt = false, fallen = false }) => {
  const angle = fallen ? -45 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${angle})`}>
      <rect x="-4" y="-6" width="8" height="22" fill="#7B4A2D" stroke="#2C2A4A" strokeWidth="2" />
      <circle cx="0" cy="-18" r="18" fill={burnt ? '#5C5048' : '#5B8F4A'} stroke="#2C2A4A" strokeWidth="2" />
      {!burnt && (
        <>
          <circle cx="-8" cy="-22" r="10" fill="#6BBE5E" stroke="#2C2A4A" strokeWidth="2" />
          <circle cx="9" cy="-24" r="11" fill="#6BBE5E" stroke="#2C2A4A" strokeWidth="2" />
        </>
      )}
    </g>
  );
};

const House = ({ x, y, scale = 1, color = '#E8845C', tilt = 0, cracked = false, submergedY = null }) => {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${tilt})`}>
      <rect x="-18" y="-2" width="36" height="28" fill={color} stroke="#2C2A4A" strokeWidth="2" />
      <polygon points="-22,-2 0,-22 22,-2" fill="#A85439" stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
      <rect x="-5" y="12" width="10" height="14" fill="#5B3422" stroke="#2C2A4A" strokeWidth="2" />
      <rect x="-14" y="2" width="8" height="8" fill="#FFD23F" stroke="#2C2A4A" strokeWidth="2" />
      <rect x="6" y="2" width="8" height="8" fill="#FFD23F" stroke="#2C2A4A" strokeWidth="2" />
      {cracked && (
        <path d="M -10 -1 L -6 8 L -10 16 L -6 24" stroke="#2C2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

const Hill = ({ cx, cy, rx, ry, color = '#5B8F4A' }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} stroke="#2C2A4A" strokeWidth="2" />
);

// =====================================================
// CHEIAS scene
// =====================================================
const SceneCheias = ({ vars, damage, intensity, active }) => {
  // water level rises from baseline based on damage; rain density based on intensity
  const W = 800, H = 500;
  const waterLevel = 380 - damage * 140; // higher damage -> water rises further up
  const rainCount = Math.round(20 + intensity * 50);
  const numTrees = Math.max(2, Math.round((vars.arvores / 100) * 8));
  const damStrength = vars.barragem / 100; // 0..1
  const damHeight = 80 + damStrength * 60;
  const damTop = 320 - damStrength * 50;
  const hasMeteo = vars.meteo > 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      {/* sky */}
      <defs>
        <linearGradient id="skyCheias" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7C99B0" />
          <stop offset="1" stopColor="#B8D6E8" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skyCheias)" />

      {/* dark clouds */}
      <Cloud x={120} y={70} scale={1.4} dark />
      <Cloud x={340} y={50} scale={1.1} dark />
      <Cloud x={550} y={85} scale={1.6} dark />
      <Cloud x={730} y={55} scale={1.0} dark />

      {/* rain */}
      {Array.from({ length: rainCount }).map((_, i) => {
        const x = (i * 37) % W + 8;
        const delay = (i % 11) * 0.1;
        return (
          <line key={i} x1={x} y1={-10} x2={x - 6} y2={4}
            stroke="#4A9FD9" strokeWidth="2" strokeLinecap="round"
            className="raindrop"
            style={{ animationDelay: `${delay}s` }} />
        );
      })}

      {/* hills behind */}
      <Hill cx={150} cy={360} rx={220} ry={90} color="#6F9863" />
      <Hill cx={620} cy={350} rx={260} ry={110} color="#6BBE5E" />

      {/* trees on hills - sponge effect */}
      {Array.from({ length: numTrees }).map((_, i) => {
        const xs = [70, 140, 220, 290, 540, 620, 700, 760];
        const ys = [300, 290, 320, 305, 290, 280, 300, 320];
        return <Tree key={i} x={xs[i]} y={ys[i]} scale={1} />;
      })}

      {/* meteo station */}
      {hasMeteo && (
        <g transform="translate(60 320)">
          <rect x="-3" y="-30" width="6" height="40" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2" />
          <circle cx="0" cy="-30" r="6" fill="#FFD23F" stroke="#2C2A4A" strokeWidth="2" />
          <line x1="0" y1="-30" x2="-12" y2="-42" stroke="#2C2A4A" strokeWidth="2" />
          <circle cx="-14" cy="-44" r="3" fill="#E8845C" stroke="#2C2A4A" strokeWidth="2" />
        </g>
      )}

      {/* dam wall */}
      <g>
        <rect x="320" y={damTop} width="60" height={damHeight} fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2.5" />
        <rect x="320" y={damTop} width="60" height="14" fill="#A07952" stroke="#2C2A4A" strokeWidth="2.5" />
        {/* water held back behind dam */}
        <rect x="380" y={damTop + 14} width={W - 380} height={H - damTop - 14} fill="#4A9FD9" opacity="0.5" />
      </g>

      {/* houses on plain */}
      <House x={460} y={356} scale={1} color="#E8845C" />
      <House x={540} y={356} scale={0.9} color="#F0B26B" />
      <House x={620} y={356} scale={1.1} color="#E8845C" />
      <House x={710} y={356} scale={0.85} color="#F2C28E" />

      {/* ground */}
      <rect x="0" y={380} width={W} height={H - 380} fill="#9CB87C" />
      <rect x="0" y={380} width={W} height="6" fill="#5B8F4A" />

      {/* flood water rising */}
      {damage > 0.01 && (
        <g>
          <rect x="0" y={waterLevel} width={W} height={H - waterLevel} fill="#4A9FD9" opacity="0.85" />
          {/* ripples */}
          <path d={`M0 ${waterLevel - 4} Q 100 ${waterLevel - 8} 200 ${waterLevel - 4} T 400 ${waterLevel - 4} T 600 ${waterLevel - 4} T 800 ${waterLevel - 4}`}
            stroke="#fff" strokeWidth="2" fill="none" opacity="0.7" />
        </g>
      )}

      {/* phone alert popup */}
      {vars.alerta > 50 && (
        <g transform="translate(680 220)">
          <rect x="-30" y="-26" width="60" height="48" rx="8" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="2.5" />
          <rect x="-22" y="-18" width="44" height="6" fill="#E8845C" />
          <rect x="-22" y="-8" width="36" height="3" fill="#D9D6CC" />
          <rect x="-22" y="-2" width="30" height="3" fill="#D9D6CC" />
          <rect x="-22" y="4" width="40" height="3" fill="#D9D6CC" />
          <text x="0" y="-19.5" fontSize="6" fill="#fff" fontFamily="Fredoka" fontWeight="600" textAnchor="middle">ALERTA!</text>
        </g>
      )}
    </svg>
  );
};

// =====================================================
// INCENDIOS scene
// =====================================================
const SceneIncendios = ({ vars, damage, intensity, active }) => {
  const W = 800, H = 500;
  const hasTower = vars.vigia > 30;
  const hasBreaks = vars.aceiros > 30;
  const planeCount = Math.round((vars.avioes / 100) * 2);
  const cleanLevel = vars.limpeza / 100;

  // fire spread: number of burning patches
  const fires = Math.max(0, Math.round(damage * 6));
  const burntTrees = Math.max(0, Math.round(damage * 5));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyFogo" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={damage > 0.2 ? '#F5A66B' : '#FFD78A'} />
          <stop offset="1" stopColor="#FFEAB8" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skyFogo)" />

      <Sun x={680} y={90} r={28} color={damage > 0.3 ? '#E8513D' : '#FFA94D'} />

      {/* smoke */}
      {damage > 0.05 && (
        <g opacity="0.7">
          <Cloud x={300} y={90} scale={1.4} dark />
          <Cloud x={460} y={70} scale={1.7} dark />
        </g>
      )}

      {/* mountains */}
      <Hill cx={180} cy={360} rx={260} ry={120} color="#8B6B4A" />
      <Hill cx={640} cy={370} rx={280} ry={120} color="#6F5238" />

      {/* dry ground */}
      <rect x="0" y={380} width={W} height={H - 380} fill={cleanLevel > 0.5 ? '#D4B97A' : '#B89A5C'} />

      {/* firebreak: a brown gap in the forest */}
      {hasBreaks && (
        <rect x="380" y="300" width="50" height="90" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2" />
      )}

      {/* trees - left forest */}
      {[120, 170, 220, 260, 310].map((x, i) => (
        <Tree key={`L${i}`} x={x} y={380} scale={1.1} burnt={i < burntTrees} />
      ))}
      {/* trees - right forest */}
      {[460, 510, 560, 610, 660, 710].map((x, i) => (
        <Tree key={`R${i}`} x={x} y={380} scale={1.0 + (i % 2) * 0.1} />
      ))}

      {/* watchtower */}
      {hasTower && (
        <g transform="translate(70 380)">
          <path d="M -12 0 L -8 -50 L 8 -50 L 12 0 Z" fill="#A85439" stroke="#2C2A4A" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="-14" y="-66" width="28" height="18" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2.5" />
          <polygon points="-16,-66 16,-66 0,-78" fill="#A85439" stroke="#2C2A4A" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="-6" y="-60" width="12" height="8" fill="#FFD23F" stroke="#2C2A4A" strokeWidth="2" />
        </g>
      )}

      {/* houses on right */}
      <House x={490} y={360} scale={0.85} color="#FFFDF7" />
      <House x={560} y={360} scale={0.9} />
      <House x={640} y={360} scale={1.0} color="#F2C28E" />
      <House x={720} y={360} scale={0.85} />

      {/* fires */}
      {Array.from({ length: fires }).map((_, i) => {
        const xs = [110, 165, 220, 270, 320, 360];
        const x = xs[i] ?? 100 + i * 60;
        return (
          <g key={i} transform={`translate(${x} 372)`} className="flame">
            <path d="M 0 0 Q -10 -10 -6 -22 Q 0 -14 4 -22 Q 8 -10 0 0 Z"
              fill="#FF6B3D" stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 0 -2 Q -4 -8 -2 -16 Q 2 -10 0 -2 Z" fill="#FFD23F" />
          </g>
        );
      })}

      {/* planes */}
      {Array.from({ length: planeCount }).map((_, i) => (
        <g key={`p${i}`} transform={`translate(${260 + i * 220} ${130 + i * 30})`}>
          <ellipse cx="0" cy="0" rx="22" ry="6" fill="#E8845C" stroke="#2C2A4A" strokeWidth="2" />
          <polygon points="-6,-2 6,-2 0,-14" fill="#A85439" stroke="#2C2A4A" strokeWidth="2" />
          <circle cx="-12" cy="14" r="3" fill="#4A9FD9" />
          <circle cx="-4" cy="14" r="3" fill="#4A9FD9" />
          <circle cx="4" cy="14" r="3" fill="#4A9FD9" />
          <circle cx="12" cy="14" r="3" fill="#4A9FD9" />
        </g>
      ))}

      {/* ground line */}
      <rect x="0" y={380} width={W} height="4" fill="#7B4A2D" />
    </svg>
  );
};

// =====================================================
// TERRAMOTOS scene
// =====================================================
const SceneTerramotos = ({ vars, damage, intensity, active }) => {
  const W = 800, H = 500;
  const antiseismicLevel = vars.antissismico / 100;
  const sensorOn = vars.sensores > 25;
  const alertOn = vars.alerta_eq > 30;
  const schoolOn = vars.simulacro > 25;
  const isShaking = active && damage > 0.15;
  const crackVisible = damage > 0.1;

  // building damage = inverse of antiseismic
  const buildingTilt = damage * (1 - antiseismicLevel) * 18; // degrees
  const buildingCrack = damage > 0.3 && antiseismicLevel < 0.6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyEq" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9FD9F0" />
          <stop offset="1" stopColor="#D6E9F2" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skyEq)" />
      <Sun x={120} y={80} r={26} withSmile color="#FFD23F" />
      <Cloud x={550} y={70} scale={1.2} />

      {/* mountains */}
      <Hill cx={100} cy={400} rx={220} ry={100} color="#A8B6C8" />
      <Hill cx={700} cy={420} rx={240} ry={100} color="#8B98A8" />

      <g className={isShaking ? 'quake' : ''}>
        {/* buildings */}
        <g transform="translate(180 380)">
          <g transform={`rotate(${-buildingTilt})`} style={{ transformOrigin: '0 0' }}>
            <rect x="-30" y="-130" width="60" height="130" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2.5" />
            <rect x="-30" y="-138" width="60" height="10" fill="#A85439" stroke="#2C2A4A" strokeWidth="2.5" />
            {[0, 1, 2, 3].map(row =>
              [0, 1].map(col => (
                <rect key={`${row}-${col}`}
                  x={-22 + col * 22} y={-118 + row * 28}
                  width="14" height="14"
                  fill={damage > 0.4 && (row + col) % 2 === 0 ? '#5C5048' : '#FFD23F'}
                  stroke="#2C2A4A" strokeWidth="2" />
              ))
            )}
            {buildingCrack && (
              <path d="M -10 -130 L -6 -90 L -12 -50 L -4 -10" stroke="#2C2A4A" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </g>
        </g>

        <g transform="translate(310 380)">
          <g transform={`rotate(${buildingTilt * 0.7})`} style={{ transformOrigin: '0 0' }}>
            <rect x="-26" y="-100" width="52" height="100" fill="#F2C28E" stroke="#2C2A4A" strokeWidth="2.5" />
            <polygon points="-30,-100 0,-118 30,-100" fill="#A85439" stroke="#2C2A4A" strokeWidth="2.5" strokeLinejoin="round" />
            {[0, 1, 2].map(row =>
              [0, 1].map(col => (
                <rect key={`${row}-${col}`}
                  x={-18 + col * 22} y={-90 + row * 28}
                  width="14" height="14"
                  fill="#FFD23F" stroke="#2C2A4A" strokeWidth="2" />
              ))
            )}
          </g>
        </g>

        {/* School */}
        {schoolOn && (
          <g transform="translate(430 380)">
            <rect x="-40" y="-50" width="80" height="50" fill="#FFF1B8" stroke="#2C2A4A" strokeWidth="2.5" />
            <polygon points="-44,-50 0,-78 44,-50" fill="#E8845C" stroke="#2C2A4A" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="-30" y="-30" width="14" height="16" fill="#4A9FD9" stroke="#2C2A4A" strokeWidth="2" />
            <rect x="16" y="-30" width="14" height="16" fill="#4A9FD9" stroke="#2C2A4A" strokeWidth="2" />
            <rect x="-7" y="-26" width="14" height="26" fill="#5B3422" stroke="#2C2A4A" strokeWidth="2" />
            {/* flag */}
            <line x1="0" y1="-78" x2="0" y2="-94" stroke="#2C2A4A" strokeWidth="2" />
            <path d="M 0 -94 L 14 -90 L 0 -86 Z" fill="#E8845C" stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
          </g>
        )}

        <House x={555} y={380} scale={1.1} color="#E8845C" tilt={damage > 0.5 ? 6 : 0} cracked={damage > 0.6} />
        <House x={650} y={380} scale={1} color="#F2C28E" tilt={damage > 0.4 ? -4 : 0} />
        <House x={735} y={380} scale={0.9} color="#FFFDF7" />
      </g>

      {/* ground */}
      <rect x="0" y={380} width={W} height={H - 380} fill="#C9A06B" />
      <rect x="0" y={380} width={W} height="4" fill="#7B4A2D" />

      {/* crack in ground */}
      {crackVisible && (
        <path d="M 0 440 L 100 432 L 180 446 L 280 436 L 380 450 L 500 438 L 620 448 L 740 436 L 800 444"
          stroke="#2C2A4A" strokeWidth={3 + damage * 4} fill="none" strokeLinecap="round" />
      )}

      {/* seismograph display top-right */}
      {sensorOn && (
        <g transform="translate(670 200)">
          <rect x="-50" y="-22" width="100" height="44" rx="8" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="2.5" />
          <path d={isShaking
            ? "M -42 0 L -32 0 L -28 -14 L -22 18 L -16 -12 L -10 14 L -4 0 L 8 0 L 12 -10 L 18 8 L 24 0 L 42 0"
            : "M -42 0 L -28 0 L -24 -3 L -18 3 L -12 0 L 8 0 L 12 -2 L 18 2 L 42 0"}
            stroke="#E8513D" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="-44" cy="-16" r="3" fill="#6BBE5E" />
        </g>
      )}

      {/* alert phone */}
      {alertOn && isShaking && (
        <g transform="translate(70 200)">
          <rect x="-22" y="-30" width="44" height="60" rx="6" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="2.5" />
          <rect x="-16" y="-22" width="32" height="8" fill="#E8513D" />
          <text x="0" y="-15.5" fontSize="6" fill="#fff" fontFamily="Fredoka" fontWeight="600" textAnchor="middle">SISMO!</text>
          <rect x="-16" y="-8" width="20" height="3" fill="#D9D6CC" />
          <rect x="-16" y="-2" width="28" height="3" fill="#D9D6CC" />
          <rect x="-16" y="4" width="22" height="3" fill="#D9D6CC" />
        </g>
      )}
    </svg>
  );
};

// =====================================================
// TEMPESTADES scene
// =====================================================
const SceneTempestades = ({ vars, damage, intensity, active }) => {
  const W = 800, H = 500;
  const estr = vars.estruturas / 100;
  const elec = vars.eletrica / 100;
  const houseTilt = damage * (1 - estr) * 16;
  const strikes = Math.max(0, Math.round(damage * 8 * (1 - elec * 0.9)));
  const rainCount = Math.round(18 + intensity * 48);
  const hasRadar = vars.previsao > 28;
  const showRotas = vars.rotas > 32;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyTemp" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={damage > 0.35 ? '#4A5568' : '#6B6890'} />
          <stop offset="1" stopColor="#8B9CB5" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skyTemp)" />

      <Cloud x={100} y={65} scale={1.5} dark />
      <Cloud x={320} y={45} scale={1.3} dark />
      <Cloud x={540} y={70} scale={1.6} dark />
      <Cloud x={720} y={50} scale={1.1} dark />

      {Array.from({ length: rainCount }).map((_, i) => {
        const x = (i * 41) % W + 10;
        const delay = (i % 9) * 0.08;
        return (
          <line key={i} x1={x} y1={-8} x2={x - 8} y2={6}
            stroke="#4A9FD9" strokeWidth="2" strokeLinecap="round"
            className="raindrop"
            style={{ animationDelay: `${delay}s` }} />
        );
      })}

      {/* wind streaks */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`w${i}`}
          x1={-20 + i * 160} y1={120 + i * 22} x2={140 + i * 160} y2={118 + i * 22}
          stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.12 + intensity * 0.18} />
      ))}

      <Hill cx={200} cy={380} rx={280} ry={110} color="#5B8F4A" />
      <Hill cx={620} cy={370} rx={300} ry={115} color="#6F9863" />

      {hasRadar && (
        <g transform="translate(90 310)">
          <rect x="-4" y="-36" width="8" height="44" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2" />
          <path d="M -22 -38 Q0 -52 22 -38" fill="none" stroke="#2C2A4A" strokeWidth="2.5" />
          <path d="M -18 -36 L0 -48 L18 -36" fill="#7FC8E8" stroke="#2C2A4A" strokeWidth="2" />
          <circle cx="0" cy="-42" r="4" fill="#FFD23F" stroke="#2C2A4A" strokeWidth="2" />
        </g>
      )}

      <House x={420} y={368} scale={1} color="#E8845C" tilt={-houseTilt} cracked={damage > 0.55} />
      <House x={520} y={368} scale={0.95} color="#F2C28E" tilt={houseTilt * 0.8} />
      <House x={620} y={368} scale={1.05} color="#FFFDF7" tilt={damage > 0.45 ? houseTilt * 0.5 : 0} />
      <House x={720} y={368} scale={0.9} color="#E8845C" tilt={damage > 0.5 ? -5 : 0} />

      {Array.from({ length: strikes }).map((_, i) => {
        const x = 200 + (i * 137) % 420;
        return (
          <path key={`L${i}`} d={`M ${x} 40 L ${x - 8} 95 L ${x + 4} 95 L ${x - 6} 160`}
            stroke="#FFD23F" strokeWidth="4" fill="none" strokeLinejoin="round" opacity="0.85" />
        );
      })}

      <rect x="0" y={380} width={W} height={H - 380} fill="#9CB87C" />
      <rect x="0" y={380} width={W} height="6" fill="#5B8F4A" />

      {showRotas && (
        <g transform="translate(680 240)">
          <rect x="-36" y="-28" width="72" height="52" rx="10" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="2.5" />
          <path d="M -8 8 L 8 -4 L -8 -4 Z" fill="#6BBE5E" stroke="#2C2A4A" strokeWidth="2" transform="translate(4,0)" />
          <text x="0" y="-10" fontSize="7" fontFamily="Fredoka" fontWeight="700" fill="#2C2A4A" textAnchor="middle">SAÍDA</text>
          <text x="0" y="2" fontSize="6" fontFamily="Nunito" fontWeight="700" fill="#6B6890" textAnchor="middle">rota segura</text>
        </g>
      )}
    </svg>
  );
};

// =====================================================
// SECAS scene
// =====================================================
const SceneSecas = ({ vars, damage, intensity, active }) => {
  const W = 800, H = 500;
  const med = vars.medicao / 100;
  const reus = vars.reuso / 100;
  const fl = vars.floresta / 100;
  const esc = vars.escolas / 100;
  const riverW = Math.max(40, 220 * (1 - damage * 0.75) * (0.35 + med * 0.65));
  const treeGreen = fl * (1 - damage * 0.6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skySeca" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE0A8" />
          <stop offset="1" stopColor="#FFD78A" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skySeca)" />

      <Sun x={680} y={85} r={32 + damage * 10} color={damage > 0.4 ? '#FF9A3D' : '#FFB347'} />

      <Hill cx={160} cy={390} rx={240} ry={100} color={damage > 0.35 ? '#C4A574' : '#D4B97A'} />
      <Hill cx={600} cy={385} rx={280} ry={105} color={damage > 0.35 ? '#A88B5C' : '#B89A5C'} />

      {/* dried river */}
      <ellipse cx={400} cy={415} rx={riverW} ry="14" fill={damage > 0.25 ? '#C9A06B' : '#4A9FD9'} opacity={damage > 0.25 ? 0.9 : 0.75} stroke="#2C2A4A" strokeWidth="2" />
      {damage > 0.2 && (
        <path d={`M ${400 - riverW * 0.7} 408 Q 400 400 ${400 + riverW * 0.7} 408`} stroke="#7B4A2D" strokeWidth="2" fill="none" strokeDasharray="6 8" opacity="0.8" />
      )}

      {[100, 180, 260, 540, 620].map((x, i) => (
        <Tree key={i} x={x} y={382} scale={0.95} burnt={damage + (1 - treeGreen) * 0.5 + i * 0.04 > 0.48} />
      ))}

      {med > 0.32 && (
        <g transform="translate(120 210)">
          <rect x="-48" y="-26" width="96" height="52" rx="10" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="2.5" />
          <text x="0" y="-12" fontSize="7" fontFamily="Fredoka" fontWeight="700" fill="#2C2A4A" textAnchor="middle">NÍVEL DO RIO</text>
          <rect x="-36" y="-4" width="72" height="10" fill="#EDEAFF" stroke="#2C2A4A" strokeWidth="2" />
          <rect x="-36" y="-4" width={Math.max(8, 72 * (1 - damage))} height="10" fill="#4A9FD9" />
        </g>
      )}

      {reus > 0.32 && (
        <g transform="translate(640 320)">
          <rect x="-22" y="0" width="44" height="52" rx="6" fill="#E8F4FF" stroke="#2C2A4A" strokeWidth="2" />
          <ellipse cx="0" cy="-8" rx="14" ry="18" fill="#4A9FD9" stroke="#2C2A4A" strokeWidth="2" />
          <text x="0" y="38" fontSize="6" fontFamily="Fredoka" fontWeight="700" fill="#2C2A4A" textAnchor="middle">reutilizar</text>
        </g>
      )}

      <House x={380} y={378} scale={1} color="#E8845C" />
      <House x={460} y={378} scale={0.9} color="#F2C28E" />
      <House x={700} y={378} scale={0.85} color="#FFFDF7" />

      {damage > 0.25 && (
        <path d="M 320 450 L 340 448 L 360 452 L 400 446 L 440 454 L 480 448 L 520 452"
          stroke="#7B4A2D" strokeWidth={2 + damage * 3} fill="none" strokeLinecap="round" opacity="0.7" />
      )}

      {esc > 0.3 && (
        <g transform="translate(400 160)">
          <rect x="-70" y="-22" width="140" height="44" rx="10" fill="#FFF1B8" stroke="#2C2A4A" strokeWidth="2.5" />
          <text x="0" y="-4" fontSize="8" fontFamily="Fredoka" fontWeight="700" fill="#2C2A4A" textAnchor="middle">POUPA ÁGUA</text>
          <text x="0" y="10" fontSize="6" fontFamily="Nunito" fontWeight="700" fill="#6B6890" textAnchor="middle">projeto da escola</text>
        </g>
      )}

      <rect x="0" y={380} width={W} height="4" fill="#7B4A2D" />
    </svg>
  );
};

// =====================================================
// DESLIZAMENTOS scene
// =====================================================
const SceneDeslizamentos = ({ vars, damage, intensity, active }) => {
  const W = 800, H = 500;
  const ch = vars.chuva / 100;
  const dr = vars.drenagem / 100;
  const enc = vars.encosta / 100;
  const rainCount = Math.round(12 + intensity * 40 * (0.4 + ch * 0.6));
  const mudShift = damage * 140 * (1 - dr * 0.45) * (1 - enc * 0.15);
  const numTrees = Math.max(2, Math.round(3 + enc * 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyDesliz" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8FA8BC" />
          <stop offset="1" stopColor="#C5D6E6" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skyDesliz)" />

      <Cloud x={130} y={55} scale={1.2} dark />
      <Cloud x={400} y={40} scale={1.4} dark />
      <Cloud x={650} y={60} scale={1.1} dark />

      {Array.from({ length: rainCount }).map((_, i) => {
        const x = (i * 43) % W + 12;
        const delay = (i % 10) * 0.09;
        return (
          <line key={i} x1={x} y1={-6} x2={x - 5} y2={8}
            stroke="#6B8FA8" strokeWidth="2" strokeLinecap="round"
            className="raindrop"
            style={{ animationDelay: `${delay}s` }} />
        );
      })}

      {/* mountain */}
      <path d="M 0 120 L 180 280 L 340 100 L 520 240 L 800 160 L 800 500 L 0 500 Z"
        fill="#7A9A6E" stroke="#2C2A4A" strokeWidth="2.5" strokeLinejoin="round" />

      {dr > 0.28 && (
        <g opacity="0.95">
          <path d="M 280 260 L 300 380 L 320 260" fill="none" stroke="#4A9FD9" strokeWidth="8" strokeLinecap="round" />
          <path d="M 400 200 L 415 360 L 430 200" fill="none" stroke="#4A9FD9" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {Array.from({ length: numTrees }).map((_, i) => {
        const xs = [120, 200, 260, 340, 450, 520];
        const ys = [250, 270, 240, 260, 230, 255];
        return <Tree key={i} x={xs[i] ?? 150 + i * 70} y={ys[i] ?? 260} scale={0.85} />;
      })}

      {/* village */}
      <House x={580} y={372} scale={1} color="#E8845C" tilt={damage > 0.35 ? -8 : 0} cracked={damage > 0.5} />
      <House x={660} y={372} scale={0.95} color="#F2C28E" tilt={damage > 0.4 ? 6 : 0} />
      <House x={740} y={372} scale={0.9} color="#FFFDF7" />

      {/* mudslide mass */}
      {damage > 0.08 && (
        <g transform={`translate(${mudShift} 0)`}>
          <path d="M 180 200 Q 320 320 520 380 L 800 420 L 800 500 L 120 500 L 80 280 Z"
            fill="#8B6B4A" stroke="#2C2A4A" strokeWidth="2.5" opacity={0.75 + damage * 0.2} />
          <path d="M 200 260 Q 340 360 560 400" stroke="#5C4030" strokeWidth="3" fill="none" opacity="0.5" />
        </g>
      )}

      <rect x="0" y={380} width={W} height={H - 380} fill="#C9A06B" />
      <rect x="0" y={380} width={W} height="4" fill="#7B4A2D" />

      {vars.alertas_risco > 34 && (
        <g transform="translate(720 200)">
          <rect x="-28" y="-30" width="56" height="56" rx="8" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="2.5" />
          <rect x="-20" y="-22" width="40" height="10" fill="#E8513D" />
          <text x="0" y="-14.5" fontSize="6" fill="#fff" fontFamily="Fredoka" fontWeight="700" textAnchor="middle">RISCO</text>
          <rect x="-18" y="-6" width="32" height="3" fill="#D9D6CC" />
          <rect x="-18" y="0" width="26" height="3" fill="#D9D6CC" />
        </g>
      )}
    </svg>
  );
};

// Placeholder scene for not-yet-built disasters
const ScenePlaceholder = ({ name }) => {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="diag" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="#E8E2D2" strokeWidth="10" />
        </pattern>
      </defs>
      <rect width="800" height="500" fill="#FFF6E0" />
      <rect width="800" height="500" fill="url(#diag)" />
      <g transform="translate(400 250)">
        <rect x="-160" y="-50" width="320" height="100" rx="20" fill="#FFFDF7" stroke="#2C2A4A" strokeWidth="3" />
        <text x="0" y="-8" textAnchor="middle" fontFamily="Fredoka" fontWeight="600" fontSize="26" fill="#2C2A4A">{name}</text>
        <text x="0" y="22" textAnchor="middle" fontFamily="Nunito" fontWeight="700" fontSize="14" fill="#6B6890">A construir com a tua ajuda…</text>
      </g>
    </svg>
  );
};

const Scene = ({ disasterId, ...rest }) => {
  if (disasterId === 'cheias') return <SceneCheias {...rest} />;
  if (disasterId === 'incendios') return <SceneIncendios {...rest} />;
  if (disasterId === 'terramotos') return <SceneTerramotos {...rest} />;
  if (disasterId === 'tempestades') return <SceneTempestades {...rest} />;
  if (disasterId === 'secas') return <SceneSecas {...rest} />;
  if (disasterId === 'deslizamentos') return <SceneDeslizamentos {...rest} />;
  return <ScenePlaceholder name={rest.name || '...'} />;
};

// Mini preview for home cards (static)
const ScenePreview = ({ disasterId }) => {
  if (disasterId === 'cheias') {
    return (
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="160" fill="#9FD9F0" />
        <Cloud x={70} y={36} scale={1.0} dark />
        <Cloud x={220} y={28} scale={1.2} dark />
        {[40, 80, 120, 220, 260].map((x, i) => <line key={i} x1={x} y1="50" x2={x - 4} y2="68" stroke="#4A9FD9" strokeWidth="2" />)}
        <Hill cx={60} cy={130} rx={100} ry={40} color="#6BBE5E" />
        <Hill cx={260} cy={140} rx={110} ry={40} color="#5B8F4A" />
        <Tree x={40} y={108} scale={0.7} />
        <Tree x={90} y={114} scale={0.6} />
        <Tree x={230} y={114} scale={0.7} />
        <rect x="100" y="80" width="22" height="44" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2" />
        <rect x="120" y="100" width="200" height="60" fill="#4A9FD9" />
        <House x={170} y={108} scale={0.6} color="#E8845C" />
        <House x={220} y={108} scale={0.55} />
      </svg>
    );
  }
  if (disasterId === 'incendios') {
    return (
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="160" fill="#FFD78A" />
        <Sun x={260} y={36} r={18} color="#E8513D" />
        <Cloud x={120} y={36} scale={1.1} dark />
        <Hill cx={60} cy={140} rx={110} ry={40} color="#8B6B4A" />
        <Hill cx={260} cy={140} rx={140} ry={50} color="#6F5238" />
        <Tree x={50} y={120} scale={0.7} burnt />
        <Tree x={90} y={124} scale={0.6} burnt />
        <Tree x={210} y={120} scale={0.75} />
        <Tree x={250} y={124} scale={0.7} />
        <g transform="translate(140 122)">
          <path d="M 0 0 Q -8 -8 -4 -18 Q 0 -10 3 -18 Q 7 -8 0 0 Z" fill="#FF6B3D" stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
        </g>
        <House x={200} y={130} scale={0.5} />
        <House x={240} y={130} scale={0.55} color="#F2C28E" />
      </svg>
    );
  }
  if (disasterId === 'terramotos') {
    return (
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="160" fill="#9FD9F0" />
        <Sun x={60} y={32} r={16} withSmile />
        <Hill cx={260} cy={140} rx={120} ry={36} color="#A8B6C8" />
        <g transform="translate(120 130)">
          <rect x="-18" y="-60" width="36" height="60" fill="#C9A06B" stroke="#2C2A4A" strokeWidth="2" />
          {[0,1,2].map(r => [0,1].map(c => <rect key={`${r}${c}`} x={-13 + c*13} y={-52 + r*16} width="8" height="8" fill="#FFD23F" stroke="#2C2A4A" strokeWidth="1.5" />))}
        </g>
        <House x={180} y={130} scale={0.55} tilt={6} cracked />
        <House x={235} y={130} scale={0.55} color="#F2C28E" />
        <rect x="0" y={130} width="320" height="30" fill="#C9A06B" />
        <path d="M 0 145 L 60 142 L 100 148 L 160 144 L 220 150 L 280 142 L 320 146" stroke="#2C2A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (disasterId === 'tempestades') {
    return (
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="160" fill="#5A6788" />
        <Cloud x={100} y={50} scale={1.5} dark />
        <Cloud x={230} y={40} scale={1.6} dark />
        <path d="M 140 70 L 130 100 L 145 100 L 135 130" stroke="#FFD23F" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 220 70 L 210 100 L 225 100 L 215 130" stroke="#FFD23F" strokeWidth="4" fill="none" strokeLinecap="round" />
        <Hill cx={160} cy={150} rx={200} ry={30} color="#3D4658" />
        <House x={120} y={140} scale={0.55} tilt={-6} />
        <House x={210} y={140} scale={0.55} color="#F2C28E" tilt={4} />
      </svg>
    );
  }
  if (disasterId === 'secas') {
    return (
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="160" fill="#FFD78A" />
        <Sun x={260} y={36} r={26} color="#FFB347" />
        <Hill cx={60} cy={140} rx={110} ry={36} color="#D4B97A" />
        <Hill cx={260} cy={144} rx={140} ry={36} color="#B89A5C" />
        <Tree x={50} y={120} scale={0.6} burnt />
        <Tree x={150} y={130} scale={0.5} burnt />
        <rect x="0" y={130} width="320" height="30" fill="#D4B97A" />
        <path d="M 20 145 L 80 145 M 100 150 L 160 150 M 180 148 L 240 148 M 260 152 L 310 152" stroke="#7B4A2D" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (disasterId === 'deslizamentos') {
    return (
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="160" fill="#9FD9F0" />
        <Cloud x={80} y={40} scale={1.1} dark />
        <path d="M 0 60 L 100 70 L 160 30 L 240 80 L 320 70 L 320 160 L 0 160 Z" fill="#8B6B4A" stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 120 90 Q 140 110 180 105 Q 210 100 230 120 L 230 160 L 120 160 Z" fill="#A07952" stroke="#2C2A4A" strokeWidth="2" strokeLinejoin="round" />
        <House x={230} y={150} scale={0.5} tilt={-10} cracked />
        <Tree x={60} y={70} scale={0.6} fallen />
      </svg>
    );
  }
  return null;
};

Object.assign(window, { Scene, ScenePreview, Sun, Cloud, Tree, House });
