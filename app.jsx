// Main app for the Ciência vs. Catástrofes simulator
const { useState, useEffect, useMemo } = React;

/** 250 pontos no total; cada variável: 0–70 (não dá para maximizar tudo). */
const BUDGET_TOTAL = 250;
const BUDGET_MAX = 70;
const BUDGET_STEP = 5;

const budgetQuant = (x) => Math.round(Number(x) / BUDGET_STEP) * BUDGET_STEP;

const sumBudget = (values, variables) =>
  variables.reduce((s, v) => s + (Number(values[v.id]) || 0), 0);

/** Máximo que este controlo pode ter sem passar o total nem 70. */
const maxPointsForVar = (values, variables, varId) => {
  const others = variables.reduce(
    (s, v) => (v.id === varId ? s : s + (Number(values[v.id]) || 0)),
    0
  );
  return Math.min(BUDGET_MAX, BUDGET_TOTAL - others);
};

/** Converte pontos (0–70) na escala 0–100 do motor e das cenas. */
const pointsToEngineHundred = (pointsMap, variables) => {
  const scale = 100 / BUDGET_MAX;
  const o = {};
  variables.forEach(v => {
    const p = Number(pointsMap[v.id]) || 0;
    o[v.id] = Math.min(100, Math.round(p * scale));
  });
  return o;
};

/** Orçamento inicial: 0 em cada variável (o jogador distribui os 250). */
const buildInitialBudget = (disaster) => {
  const out = {};
  (disaster?.variables || []).forEach(v => { out[v.id] = 0; });
  return out;
};

/** Só altera o controlo que mexeste; os outros ficam iguais. */
const setVarBudget = (prev, disaster, changedId, rawNew) => {
  const vars = disaster.variables;
  const othersSum = vars.reduce(
    (s, v) => (v.id === changedId ? s : s + (Number(prev[v.id]) || 0)),
    0
  );
  let nv = budgetQuant(Number(rawNew));
  nv = Math.max(0, Math.min(BUDGET_MAX, nv, BUDGET_TOTAL - othersSum));
  return { ...prev, [changedId]: nv };
};

// ---------- helpers ----------
const computeProtection = (disaster, pointsMap) => {
  const eff = pointsToEngineHundred(pointsMap, disaster.variables);
  const totalWeight = disaster.variables.reduce((s, v) => s + v.weight, 0);
  const weighted = disaster.variables.reduce((s, v) => s + (eff[v.id] ?? 0) * v.weight, 0);
  return Math.min(1, (weighted / totalWeight) / 100);
};

const computeOutcome = (disaster, pointsMap, intensity) => {
  const protection = computeProtection(disaster, pointsMap);
  // damage: how badly things were hit
  const rawDamage = Math.max(0, intensity - protection * 0.95);
  const damage = Math.min(1, rawDamage);

  const buildingsPct = Math.round(Math.max(0, Math.min(100, (1 - damage) * 100)));
  const peopleSaved = Math.round(disaster.population * (1 - damage * 0.85));
  const score = Math.round((protection - intensity * 0.4) * 100 + 60); // rough
  let stars = 1;
  if (buildingsPct >= 90) stars = 3;
  else if (buildingsPct >= 70) stars = 2;
  return { protection, damage, buildingsPct, peopleSaved, stars };
};

const ratingLabel = (stars) => stars >= 3 ? 'Cientista de Topo!' : stars === 2 ? 'Boa Defesa!' : 'Podes melhorar!';

/** Dicas pós-resultado: gera texto a partir dos controlos e de RESULT_POST_TIPS (data.js). */
const buildPostSimulationAdvice = (disaster, outcome, values, factIndex) => {
  const pool = (typeof RESULT_POST_TIPS !== 'undefined' && RESULT_POST_TIPS[disaster.id])
    ? RESULT_POST_TIPS[disaster.id]
    : [
        'Em casa, combina um plano simples: quem avisa quem e para onde vais em emergência.',
        'Apoiar ciência e tecnologia na escola e na comunidade constrói defesas para todos.'
      ];
  const tips = [];
  if (pool.length) {
    tips.push(pool[((factIndex ?? 0) + disaster.id.length) % pool.length]);
  }

  const eff = pointsToEngineHundred(values, disaster.variables);
  const scored = disaster.variables.map(v => ({
    name: v.name,
    hint: v.hint,
    val: eff[v.id] ?? 0,
    pts: values[v.id] ?? 0
  }));
  const sortedAsc = [...scored].sort((a, b) => a.val - b.val);
  const sortedDesc = [...scored].sort((a, b) => b.val - a.val);

  const praiseLines = [];
  const minPraise = outcome.stars >= 3 ? 58 : 54;
  if (outcome.stars >= 2) {
    sortedDesc.forEach(v => {
      if (v.val >= minPraise && praiseLines.length < 3) {
        praiseLines.push(`💪 «${v.name}» (${Math.round(v.pts)} pts) — ${v.hint}`);
      }
    });
    if (praiseLines.length === 0) {
      praiseLines.push('🛡️ Várias defesas juntas protegem melhor!');
    }
  }

  const showImprove = outcome.stars < 2 || outcome.damage > 0.26;
  const improveLines = [];
  if (showImprove) {
    sortedAsc.forEach(v => {
      if (v.val < 56 && improveLines.length < 3) {
        improveLines.push(`⬆️ Sobe «${v.name}» (tens ${Math.round(v.pts)} pts) — ${v.hint}`);
      }
    });
    if (improveLines.length === 0) {
      improveLines.push(
        '⚖️ Gasta os 250 pontos — máx. 70 em cada controlo!'
      );
    }
  }

  return {
    tips,
    praiseLines,
    improveLines,
    showPraise: outcome.stars >= 2,
    showImprove
  };
};

const strandBadge = (strand) => {
  if (strand === 'ciencia') return { label: 'Ciência', emoji: '🔬', className: 'strand ciencia' };
  if (strand === 'tecnologia') return { label: 'Tecnologia', emoji: '🛠️', className: 'strand tecnologia' };
  return { label: 'Ciência e tecnologia', emoji: '🔬🛠️', className: 'strand ambos' };
};

const ComicBubble = ({ children, className = '' }) => (
  <div className={`comic-bubble ${className}`.trim()}>{children}</div>
);

const ComicPanel = ({ icon, title, children, accent, className = '' }) => (
  <article className={`comic-panel ${className}`.trim()} style={accent ? { borderColor: accent } : undefined}>
    <header className="comic-panel-head" style={accent ? { background: accent + '22' } : undefined}>
      {icon && <span className="comic-panel-icon" aria-hidden="true">{icon}</span>}
      {title && <h3 className="comic-panel-title">{title}</h3>}
    </header>
    <div className="comic-panel-body">{children}</div>
  </article>
);

const ComicChips = ({ items }) => (
  <ul className="comic-chips">
    {(items || []).slice(0, 2).map((line, i) => (
      <li key={i} className="comic-chip">{line}</li>
    ))}
  </ul>
);

// ---------- Aprender mais (conteúdo da aba na página inicial) ----------
const LearnMorePanel = () => {
  const articles = typeof LEARN_MORE !== 'undefined' ? LEARN_MORE : [];
  return (
    <section className="learn-more comic-page" aria-labelledby="learn-main-title">
      <h2 id="learn-main-title" className="learn-more-title comic-title">📚 Revista da escola</h2>
      <ComicBubble className="comic-bubble-center">Cada página é uma catástrofe — lê os quadrinhos!</ComicBubble>
      <div className="learn-more-stack">
        {articles.map((a) => {
          const meta = DISASTERS.find(d => d.id === a.id);
          const accent = meta?.accent || '#2C2A4A';
          return (
            <ComicPanel key={a.id} icon={a.emoji} title={a.title} accent={accent}>
              <p className="comic-intro">{a.oQueE}</p>
              <div className="comic-trio">
                <div className="comic-tile prevent">
                  <span className="comic-tile-label">🛡️ Prevenir</span>
                  <ComicChips items={a.prevenir} />
                </div>
                <div className="comic-tile tech">
                  <span className="comic-tile-label">🛠️ Tecnologia</span>
                  <ComicChips items={a.tecnologia} />
                </div>
                <div className="comic-tile science">
                  <span className="comic-tile-label">🔬 Ciência</span>
                  <ComicChips items={a.ciencia} />
                </div>
              </div>
              <p className="comic-punchline">💡 {a.lembrar}</p>
            </ComicPanel>
          );
        })}
      </div>
    </section>
  );
};

// ---------- Home screen ----------
const Home = ({ onPick }) => {
  const edu = typeof HOME_EDUCATION !== 'undefined' ? HOME_EDUCATION : null;
  const [homeTab, setHomeTab] = useState('jogar');
  return (
    <div className="app">
      <div className="home-hero hero-enter">
        <div className="sun" />
        <div className="cloud c1" />
        <div className="cloud c2" />

        <div className="home-header">
          <span className="home-badge"><span className="dot" /> 4.º Ano · Ciência e Tecnologia</span>
        </div>

        <h1 className="home-title">
          Ciência vs. <span className="accent">Catástrofes</span>
        </h1>
        <ComicBubble className="home-hero-bubble">
          Reparte <strong>{BUDGET_TOTAL} pontos</strong> · protege a vila · diverte-te a aprender!
        </ComicBubble>

        <div className="floating-mascot wobble">
          <Mascot size={180} />
        </div>
      </div>

      <nav className="home-tabs" role="tablist" aria-label="Secções da página inicial">
        <button
          type="button"
          role="tab"
          aria-selected={homeTab === 'jogar'}
          aria-controls="panel-jogar"
          id="tab-jogar"
          className={`home-tab btn-press ${homeTab === 'jogar' ? 'on' : ''}`}
          onClick={() => setHomeTab('jogar')}
        >
          Jogar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={homeTab === 'aprender'}
          aria-controls="panel-aprender"
          id="tab-aprender"
          className={`home-tab btn-press ${homeTab === 'aprender' ? 'on' : ''}`}
          onClick={() => setHomeTab('aprender')}
        >
          Aprender Mais
        </button>
      </nav>

      {homeTab === 'jogar' && (
        <div id="panel-jogar" role="tabpanel" aria-labelledby="tab-jogar" className="home-tab-panel tab-enter" key="tab-jogar">
      {edu && (
        <section className="home-edu comic-strip" aria-labelledby="home-edu-title">
          <h2 id="home-edu-title" className="home-edu-title comic-title">Como funciona?</h2>
          <ComicBubble className="comic-bubble-center">{edu.lead}</ComicBubble>
          <div className="home-edu-grid">
            {edu.blocks.map((b, i) => (
              <ComicPanel key={i} icon={b.icon || '💬'} title={b.title} className="home-edu-comic">
                <p className="comic-intro">{b.text}</p>
              </ComicPanel>
            ))}
          </div>
        </section>
      )}

      <div className="section-h">
        <h2>Escolhe a tua catástrofe</h2>
        <p>6 catástrofes · todas para explorares</p>
      </div>

      <div className="cards">
        {DISASTERS.map(d => (
          <div key={d.id}
            className={`card ${d.enabled ? '' : 'disabled'}`}
            onClick={() => d.enabled && onPick(d.id)}
            role="button"
            tabIndex={d.enabled ? 0 : -1}
            onKeyDown={(e) => { if (d.enabled && (e.key === 'Enter' || e.key === ' ')) onPick(d.id); }}>
            <div className="preview" style={{ background: d.accent + '22' }}>
              <ScenePreview disasterId={d.id} />
            </div>
            <div className="card-body">
              <h3 className="card-title">{d.emoji} {d.name}</h3>
              <p className="card-desc">{d.short}</p>
              {d.enabled ? (
                <div className="card-foot">
                  <span className="chip green">{BUDGET_TOTAL} pts</span>
                  <span className="chip">Livre + Missão</span>
                </div>
              ) : (
                <div className="card-foot">
                  <span className="chip muted">Em breve</span>
                </div>
              )}
            </div>
            {!d.enabled && <span className="ribbon">EM BREVE</span>}
          </div>
        ))}
      </div>
        </div>
      )}

      {homeTab === 'aprender' && (
        <div id="panel-aprender" role="tabpanel" aria-labelledby="tab-aprender" className="home-tab-panel tab-enter" key="tab-aprender">
          <LearnMorePanel />
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
};

// ---------- Simulator screen ----------
const Simulator = ({ disasterId, onBack }) => {
  const disaster = useMemo(() => DISASTERS.find(d => d.id === disasterId), [disasterId]);

  const [values, setValues] = useState(() => buildInitialBudget(disaster));

  const [mode, setMode] = useState('livre'); // livre | missao
  // Mission state
  const [missionState, setMissionState] = useState('idle'); // idle | running | over
  const [timeLeft, setTimeLeft] = useState(45);
  const [intensity, setIntensity] = useState(0); // current intensity (rises during mission)
  const [showResult, setShowResult] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Intensity for live preview
  const liveIntensity = mode === 'livre' ? 0.65 : intensity;
  const outcome = useMemo(
    () => computeOutcome(disaster, values, liveIntensity),
    [disaster, values, liveIntensity]
  );

  const sceneVars = useMemo(
    () => pointsToEngineHundred(values, disaster.variables),
    [values, disaster]
  );

  const budgetUsed = useMemo(
    () => disaster.variables.reduce((s, v) => s + (values[v.id] ?? 0), 0),
    [disaster, values]
  );

  const budgetRemaining = BUDGET_TOTAL - budgetUsed;

  /* Sempre 0 ao abrir ou mudar de catástrofe (evita estado antigo). */
  useEffect(() => {
    setValues(buildInitialBudget(disaster));
    setMode('livre');
    setMissionState('idle');
    setTimeLeft(45);
    setIntensity(0);
    setShowResult(false);
  }, [disasterId]);

  useEffect(() => {
    if (mode !== 'livre') return;
    const tips = MASCOT_TIPS[disaster.id] || [];
    if (!tips.length) return;
    const id = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 6000);
    return () => clearInterval(id);
  }, [mode, disaster.id]);

  // Mission countdown
  useEffect(() => {
    if (mode !== 'missao' || missionState !== 'running') return;
    if (timeLeft <= 0) {
      // run disaster
      setMissionState('over');
      // intensity peaks at end
      setIntensity(0.88);
      setTimeout(() => setShowResult(true), 900);
      return;
    }
    const id = setTimeout(() => {
      setTimeLeft(t => t - 1);
      // gradually rise intensity for visual tension
      setIntensity(i => Math.min(0.6, i + 0.02));
    }, 1000);
    return () => clearTimeout(id);
  }, [mode, missionState, timeLeft]);

  const startMission = () => {
    setTimeLeft(45);
    setIntensity(0.1);
    setMissionState('running');
    setShowResult(false);
  };

  const onModeChange = (newMode) => {
    setMode(newMode);
    setMissionState('idle');
    setTimeLeft(45);
    setIntensity(0);
    setShowResult(false);
  };

  const reset = () => {
    setValues(buildInitialBudget(disaster));
    setMissionState('idle');
    setTimeLeft(45);
    setIntensity(0);
    setShowResult(false);
  };

  const trySimulateLivre = () => {
    setIntensity(0.85);
    setMissionState('over'); // freezes UI for visualisation
    setTimeout(() => setShowResult(true), 1000);
  };

  const closeResult = () => {
    setShowResult(false);
    if (mode === 'missao') {
      setMissionState('idle');
      setTimeLeft(45);
      setIntensity(0);
    } else {
      setMissionState('idle');
      setIntensity(0);
    }
    setFactIndex(i => (i + 1) % (disaster.facts?.length || 1));
  };

  const sliderDisabled = mode === 'missao' && missionState === 'over';

  const currentTip = (() => {
    const tips = MASCOT_TIPS[disaster.id] || [];
    if (!tips.length) return '';
    if (mode === 'missao' && missionState === 'running') {
      return `⏱️ ${timeLeft}s! Distribui ${BUDGET_TOTAL} pts (máx. ${BUDGET_MAX} cada)!`;
    }
    if (mode === 'missao' && missionState === 'over') {
      return 'A catástrofe aconteceu! Vamos ver os resultados...';
    }
    return tips[tipIndex];
  })();

  return (
    <div className="app">
      {/* Top bar */}
      <div className="sim-top sim-enter">
        <button type="button" className="back-btn btn-press" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18 L9 12 L15 6" />
          </svg>
          Voltar
        </button>

        <div className="sim-title-wrap">
          <h1 className="h-title sim-title">
            <span className="sim-title-emoji" aria-hidden="true">{disaster.emoji}</span>
            {disaster.name}
          </h1>
        </div>

        <div className="mode-switch" role="tablist">
          <button type="button" className={`btn-press ${mode === 'livre' ? 'on' : ''}`} onClick={() => onModeChange('livre')}>🧪 Livre</button>
          <button type="button" className={`btn-press ${mode === 'missao' ? 'on' : ''}`} onClick={() => onModeChange('missao')}>🎯 Missão</button>
        </div>
      </div>

      <div className="sim-grid sim-enter sim-enter-delay">
        {/* Left: variables */}
        <div className="panel">
          <div className="panel-head">
            <h3>Ciência e tecnologia</h3>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>
              {mode === 'livre'
                ? `${BUDGET_TOTAL} pts no total · máx. ${BUDGET_MAX} em cada`
                : `Distribui ${BUDGET_TOTAL} pts (máx. ${BUDGET_MAX} cada)!`}
            </span>
          </div>

          <div className={`budget-strip ${budgetRemaining === 0 ? 'budget-ok' : ''}`} aria-live="polite">
            <span className="budget-strip-total">{budgetUsed}/{BUDGET_TOTAL} pontos</span>
            <span className="budget-strip-hint">
              {budgetRemaining > 0
                ? `🪙 Faltam ${budgetRemaining} — máx. ${BUDGET_MAX} em cada`
                : `✅ Todos os pontos distribuídos`}
            </span>
          </div>

          {disaster.teachIntro && (
            <ComicBubble className="sim-teach-comic">{disaster.emoji} {disaster.teachIntro}</ComicBubble>
          )}

          <div className="mascot-row comic-mascot-row">
            <MascotMini size={56} mood={outcome.stars >= 2 || mode === 'livre' ? 'happy' : 'happy'} />
            <ComicBubble>{currentTip}</ComicBubble>
          </div>

          <div className="panel-body">
            {disaster.variables.map(v => {
              const sb = v.strand ? strandBadge(v.strand) : null;
              return (
                <div key={v.id} className="var comic-var">
                  <div className="var-top">
                    <div className="var-icon" style={{ background: v.color }}>
                      <VarIcon name={v.icon} />
                    </div>
                    <div className="var-text">
                      <h4 className="var-name">{v.name}</h4>
                      <p className="var-hint">{v.hint}</p>
                      {sb && (
                        <span className={sb.className} title="Ligação ao trabalho de Ciência e Tecnologia">
                          <span className="strand-emoji" aria-hidden="true">{sb.emoji}</span>
                          {sb.label}
                        </span>
                      )}
                    </div>
                    <div className="var-val">{values[v.id] ?? 0}<span className="var-pts">/{BUDGET_MAX}</span></div>
                  </div>
                  <input
                    type="range" min={0} max={maxPointsForVar(values, disaster.variables, v.id)} step={BUDGET_STEP}
                    className="chunky"
                    value={values[v.id] ?? 0}
                    disabled={sliderDisabled}
                    onChange={e => setValues(prev => setVarBudget(prev, disaster, v.id, Number(e.target.value)))}
                  />
                  {v.preventExplain && (
                    <details className="var-prevent comic-details">
                      <summary>💡 Saber mais</summary>
                      <p className="var-prevent-text">{v.preventExplain}</p>
                    </details>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sim-actions">
            {mode === 'livre' && (
              <>
                <button className="cta" onClick={trySimulateLivre}>
                  ▶ Simular catástrofe
                </button>
                <button className="cta btn-press ghost" onClick={reset}>↻ Repor</button>
              </>
            )}
            {mode === 'missao' && missionState === 'idle' && (
              <>
                <button className="cta btn-press big green" onClick={startMission}>
                  🎯 Começar missão (45s)
                </button>
                <button className="cta btn-press ghost" onClick={reset}>↻ Repor</button>
              </>
            )}
            {mode === 'missao' && missionState === 'running' && (
              <button className="cta btn-press ghost" onClick={() => { setMissionState('over'); setIntensity(0.88); setTimeout(()=>setShowResult(true),800); }}>
                ⚡ Saltar para o final
              </button>
            )}
            {mode === 'missao' && missionState === 'over' && !showResult && (
              <button className="cta" onClick={() => setShowResult(true)}>Ver resultado</button>
            )}
          </div>
        </div>

        {/* Right: scene + live stats */}
        <div className="panel">
          <div className="panel-head">
            <h3>Cenário</h3>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>
              Intensidade: {mode === 'livre' ? 'Pré-visualização' : (missionState === 'running' ? 'A aproximar...' : missionState === 'over' ? 'CATÁSTROFE!' : 'Em espera')}
            </span>
          </div>

          <div className="scene-wrap">
            <Scene
              disasterId={disaster.id}
              vars={sceneVars}
              damage={outcome.damage}
              intensity={liveIntensity}
              active={mode === 'missao'}
              name={disaster.name}
            />
            {/* Protection meter */}
            <div className="scene-meter">
              <span className="mlabel">Proteção</span>
              <div className="bar">
                <div style={{
                  width: `${Math.round(outcome.protection * 100)}%`,
                  background: outcome.protection > 0.66 ? '#6BBE5E' : outcome.protection > 0.33 ? '#FFD23F' : '#E8513D'
                }} />
              </div>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(outcome.protection * 100)}%</span>
            </div>
            {/* Timer (mission running) */}
            {mode === 'missao' && missionState === 'running' && (
              <div className={`timer-pill ${timeLeft <= 10 ? 'warn' : ''}`}>
                <span className="pulse" />
                {timeLeft}s
              </div>
            )}
            {mode === 'missao' && missionState === 'over' && (
              <div className="timer-pill warn"><span className="pulse" />FIM</div>
            )}
          </div>

          {/* live stats */}
          <div className="stats">
            <div className="stat">
              <div className="ico" style={{ background: '#C9F0B4' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2C2A4A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="9" width="16" height="12" fill="#FFFDF7" />
                  <polygon points="3,9 12,3 21,9" fill="#E8845C" strokeLinejoin="round" />
                  <rect x="10" y="13" width="4" height="8" fill="#5B3422" />
                </svg>
              </div>
              <div>
                <div className="label">Edifícios protegidos</div>
                <div className="val">{outcome.buildingsPct}%</div>
              </div>
            </div>
            <div className="stat">
              <div className="ico" style={{ background: '#FFE7B8' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2C2A4A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" fill="#F5D5B3" />
                  <path d="M4 21 Q4 14 12 14 Q20 14 20 21" fill="#4A9FD9" />
                </svg>
              </div>
              <div>
                <div className="label">Pessoas a salvo</div>
                <div className="val">{outcome.peopleSaved.toLocaleString('pt-PT')}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 18 }} />
        </div>
      </div>

      {/* Results modal */}
      {showResult && (
        <ResultsModal
          disaster={disaster}
          outcome={outcome}
          values={values}
          onClose={closeResult}
          factIndex={factIndex}
        />
      )}

      <div style={{ height: 40 }} />
    </div>
  );
};

// ---------- Results modal ----------
const ResultsModal = ({ disaster, outcome, values, onClose, factIndex }) => {
  const fact = disaster.facts[factIndex % disaster.facts.length];
  const isWin = outcome.stars >= 2;
  const advice = useMemo(
    () => buildPostSimulationAdvice(disaster, outcome, values, factIndex),
    [disaster, outcome, values, factIndex]
  );

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="stars">
            {[1, 2, 3].map(i => <Star key={i} filled={outcome.stars >= i} />)}
          </div>
          <h2>{ratingLabel(outcome.stars)}</h2>
          <p>{isWin ? HIGH_SCORE_MESSAGES[disaster.id] : LOW_SCORE_MESSAGES[disaster.id]}</p>
        </div>
        <div className="modal-body">
          <div className="result-stats">
            <div className="stat">
              <div className="ico" style={{ background: '#C9F0B4' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2C2A4A" strokeWidth="2.4" strokeLinejoin="round">
                  <rect x="4" y="9" width="16" height="12" fill="#FFFDF7" />
                  <polygon points="3,9 12,3 21,9" fill="#E8845C" />
                </svg>
              </div>
              <div>
                <div className="label">Edifícios</div>
                <div className="val">{outcome.buildingsPct}%</div>
              </div>
            </div>
            <div className="stat">
              <div className="ico" style={{ background: '#FFE7B8' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2C2A4A" strokeWidth="2.4" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" fill="#F5D5B3" />
                  <path d="M4 21 Q4 14 12 14 Q20 14 20 21" fill="#4A9FD9" />
                </svg>
              </div>
              <div>
                <div className="label">Pessoas a salvo</div>
                <div className="val">{outcome.peopleSaved.toLocaleString('pt-PT')}</div>
              </div>
            </div>
          </div>

          {advice.showPraise && (
            <div className="modal-reflect good">
              <h4 className="modal-reflect-title">O que funcionou muito bem</h4>
              <ul className="modal-reflect-list">
                {advice.praiseLines.slice(0, 2).map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          {advice.showImprove && (
            <div className="modal-reflect improve">
              <h4 className="modal-reflect-title">O que podias fazer diferente</h4>
              <ul className="modal-reflect-list">
                {advice.improveLines.slice(0, 2).map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          {advice.tips.length > 0 && (
            <div className="modal-reflect tips">
              <h4 className="modal-reflect-title">Dicas para a vida real</h4>
              <ul className="modal-reflect-list">
                {advice.tips.slice(0, 1).map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          <div className="fact">
            <div className="ico">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2C2A4A" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
                <path d="M12 3 Q5 3 5 11 Q5 14 8 16 L8 19 L16 19 L16 16 Q19 14 19 11 Q19 3 12 3 Z" fill="#FFD23F" />
                <line x1="9" y1="22" x2="15" y2="22" />
              </svg>
            </div>
            <div>
              <p className="title">{disaster.factTitle}</p>
              <p>{fact}</p>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="cta btn-press green" onClick={onClose}>↻ Jogar outra vez</button>
          <button className="cta btn-press ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

// ---------- Transições de ecrã ----------
const PageView = ({ direction, children }) => (
  <div className={`page-view page-${direction}`}>
    {children}
  </div>
);

// ---------- Root ----------
const App = () => {
  const [screen, setScreen] = useState('home'); // home | sim
  const [picked, setPicked] = useState(null);
  const [pageDir, setPageDir] = useState('forward'); // forward | back

  const pick = (id) => {
    setPageDir('forward');
    setPicked(id);
    setScreen('sim');
    window.scrollTo(0, 0);
  };
  const back = () => {
    setPageDir('back');
    setScreen('home');
    window.scrollTo(0, 0);
  };

  return (
    <PageView direction={pageDir}>
      {screen === 'home'
        ? <Home onPick={pick} />
        : <Simulator key={picked} disasterId={picked} onBack={back} />}
    </PageView>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
