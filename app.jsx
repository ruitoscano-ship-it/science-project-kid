// Main app for the Ciência vs. Catástrofes simulator
const { useState, useEffect, useMemo } = React;

/** Orçamento fixo: repartir pontos entre controlos (impossível “máximo em tudo”). */
const BUDGET_TOTAL = 150;
const BUDGET_MIN = 10;
/** Cada movimento dos controlos altera valores em passos de 5 (mais claro em tablet). */
const BUDGET_STEP = 5;

const budgetQuant = (x) => Math.round(Number(x) / BUDGET_STEP) * BUDGET_STEP;

/** Converte pontos (soma = BUDGET_TOTAL) na escala 0–100 usada pelo motor e pelas cenas. */
const pointsToEngineHundred = (pointsMap, variables) => {
  const n = variables.length;
  const mid = BUDGET_TOTAL / n;
  const scale = 50 / mid;
  const o = {};
  variables.forEach(v => {
    const p = Number(pointsMap[v.id]) || 0;
    o[v.id] = Math.min(100, Math.round(p * scale));
  });
  return o;
};

/** Garante soma = BUDGET_TOTAL e cada id entre BUDGET_MIN e o máximo possível. */
const finalizeBudget = (out, ids) => {
  const o = { ...out };
  let loop = 0;
  while (loop++ < 120) {
    const sum = ids.reduce((a, id) => a + (o[id] ?? 0), 0);
    const gap = BUDGET_TOTAL - sum;
    if (gap === 0) break;
    const step = Math.abs(gap) >= BUDGET_STEP ? BUDGET_STEP : 1;
    const adj = gap > 0 ? Math.min(step, gap) : Math.max(-step, gap);
    if (gap > 0) {
      const cand = ids
        .filter(id => {
          const others = ids.filter(i => i !== id);
          const maxV = BUDGET_TOTAL - BUDGET_MIN * others.length;
          return (o[id] ?? 0) + adj <= maxV;
        })
        .sort((a, b) => (o[b] ?? 0) - (o[a] ?? 0))[0];
      if (!cand) break;
      o[cand] += adj;
    } else {
      const cand = ids
        .filter(id => (o[id] ?? 0) + adj >= BUDGET_MIN)
        .sort((a, b) => (o[b] ?? 0) - (o[a] ?? 0))[0];
      if (!cand) break;
      o[cand] += adj;
    }
  }
  return o;
};

const buildInitialBudget = (disaster) => {
  const vars = disaster.variables;
  const ids = vars.map(v => v.id);
  const sumD = vars.reduce((s, v) => s + v.default, 0) || 1;
  const floats = ids.map((_, i) => (BUDGET_TOTAL * vars[i].default) / sumD);
  let ints = floats.map(x => Math.floor(x));
  let diff = BUDGET_TOTAL - ints.reduce((a, b) => a + b, 0);
  const frac = floats.map((x, i) => x - ints[i]);
  const order = ids.map((_, i) => i).sort((a, b) => frac[b] - frac[a]);
  for (let k = 0; k < diff; k++) ints[order[k % ids.length]]++;
  const out = {};
  ids.forEach((id, i) => { out[id] = ints[i]; });
  for (let iter = 0; iter < 80; iter++) {
    const low = ids.find(id => out[id] < BUDGET_MIN);
    if (!low) break;
    const need = BUDGET_MIN - out[low];
    const donor = ids.filter(id => id !== low && out[id] > BUDGET_MIN).sort((a, b) => out[b] - out[a])[0];
    if (!donor) {
      out[low] = BUDGET_MIN;
      break;
    }
    const take = Math.min(need, out[donor] - BUDGET_MIN);
    out[donor] -= take;
    out[low] += take;
  }
  ids.forEach(id => {
    out[id] = budgetQuant(out[id]);
    if (out[id] < BUDGET_MIN) out[id] = BUDGET_MIN;
  });
  return finalizeBudget(out, ids);
};

/** Reparte `rem` entre `others`, cada um múltiplo de BUDGET_STEP e ≥ BUDGET_MIN. */
const distributeRemAmongOthers = (rem, others, prev) => {
  const k = others.length;
  const minTotal = BUDGET_MIN * k;
  const out = {};
  if (rem < minTotal) {
    others.forEach(id => { out[id] = BUDGET_MIN; });
    return out;
  }
  const pool = rem - minTotal;
  const flex = others.map(id => Math.max(0, (prev[id] ?? BUDGET_MIN) - BUDGET_MIN));
  const sF = flex.reduce((a, b) => a + b, 0);
  const poolUnits = pool / BUDGET_STEP;

  if (pool <= 0 || sF === 0) {
    const remUnits = Math.round(rem / BUDGET_STEP);
    const minUnits = (BUDGET_MIN / BUDGET_STEP) * k;
    const extra = remUnits - minUnits;
    const baseU = Math.floor(extra / k);
    const remainder = extra - baseU * k;
    others.forEach((id, i) => {
      out[id] = BUDGET_MIN + (baseU + (i < remainder ? 1 : 0)) * BUDGET_STEP;
    });
    return out;
  }

  const rawU = others.map((_, i) => (poolUnits * flex[i]) / sF);
  let units = rawU.map(u => Math.floor(u));
  let deficit = Math.round(poolUnits) - units.reduce((a, b) => a + b, 0);
  const ord = others.map((_, i) => i).sort((a, b) => (rawU[b] - units[b]) - (rawU[a] - units[a]));
  for (let t = 0; t < deficit; t++) units[ord[t % ord.length]]++;
  others.forEach((id, i) => {
    out[id] = BUDGET_MIN + units[i] * BUDGET_STEP;
  });
  return out;
};

/** Ao mover um control, os outros ajustam-se para manter a soma em BUDGET_TOTAL (passos de BUDGET_STEP). */
const redistributeBudget = (prev, disaster, changedId, rawNew) => {
  const ids = disaster.variables.map(v => v.id);
  const others = ids.filter(id => id !== changedId);
  const maxC = BUDGET_TOTAL - BUDGET_MIN * others.length;
  let nv = Math.max(BUDGET_MIN, Math.min(Math.round(Number(rawNew)), maxC));
  nv = budgetQuant(nv);
  nv = Math.max(BUDGET_MIN, Math.min(nv, maxC));
  const rem = BUDGET_TOTAL - nv;
  const otherPart = distributeRemAmongOthers(rem, others, prev);
  const out = { ...otherPart, [changedId]: nv };
  return finalizeBudget(out, ids);
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
    const t2 = pool[((factIndex ?? 0) + disaster.id.length + 1) % pool.length];
    if (t2 !== tips[0]) tips.push(t2);
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
        praiseLines.push(
          `«${v.name}» com ${Math.round(v.pts)} pontos esteve forte: ${v.hint} — ajudou a proteger pessoas e o ambiente.`
        );
      }
    });
    if (praiseLines.length === 0) {
      praiseLines.push(
        'A soma das tuas escolhas criou mais “camadas” de proteção: lembra-te que prevenção raramente depende de uma só medida.'
      );
    }
  }

  const showImprove = outcome.stars < 2 || outcome.damage > 0.26;
  const improveLines = [];
  if (showImprove) {
    sortedAsc.forEach(v => {
      if (v.val < 56 && improveLines.length < 3) {
        improveLines.push(
          `Podes tentar dar mais pontos a «${v.name}» (tinhas ${Math.round(v.pts)}; o mínimo útil na escala do jogo costuma ser subir os mais fracos): ${v.hint}.`
        );
      }
    });
    if (improveLines.length === 0) {
      improveLines.push(
        'Tenta repartir os 150 pontos de forma mais equilibrada — muitas defesas só funcionam bem em equipa, como na vida real.'
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

// ---------- Aprender mais (conteúdo da aba na página inicial) ----------
const LearnMorePanel = () => {
  const articles = typeof LEARN_MORE !== 'undefined' ? LEARN_MORE : [];
  return (
    <section className="learn-more" aria-labelledby="learn-main-title">
      <h2 id="learn-main-title" className="learn-more-title">Aprender mais sobre desastres naturais</h2>
      <p className="learn-more-lead">
        Aqui podes ler com calma, como se fosse uma revista da escola. Cada bloco fala de um perigo da Natureza,
        do que fazemos para prevenir, da tecnologia que usamos e da ciência que explica tudo. Não precisas de decorar:
        o objetivo é perceberes ideias que te protegem a ti, à tua família e ao planeta.
      </p>
      <div className="learn-more-stack">
        {articles.map((a) => {
          const meta = DISASTERS.find(d => d.id === a.id);
          const accent = meta?.accent || '#2C2A4A';
          return (
            <article key={a.id} className="learn-card" style={{ borderColor: accent }}>
              <header className="learn-card-head" style={{ background: accent + '18' }}>
                <span className="learn-card-emoji" aria-hidden="true">{a.emoji}</span>
                <h3 className="learn-card-title">{a.title}</h3>
              </header>
              <div className="learn-card-body">
                <p className="learn-card-intro">{a.oQueE}</p>
                <h4 className="learn-subhead">Como prevenir (hábitos e planeamento)</h4>
                <ul className="learn-list">
                  {a.prevenir.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                <h4 className="learn-subhead">Tecnologia à nossa volta</h4>
                <ul className="learn-list">
                  {a.tecnologia.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                <h4 className="learn-subhead">O que a ciência explica</h4>
                <ul className="learn-list">
                  {a.ciencia.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                <p className="learn-remember"><strong>Para lembrar:</strong> {a.lembrar}</p>
              </div>
            </article>
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
      <div className="home-hero">
        <div className="sun" />
        <div className="cloud c1" />
        <div className="cloud c2" />

        <div className="home-header">
          <span className="home-badge"><span className="dot" /> 4.º Ano · Ciência e Tecnologia</span>
        </div>

        <h1 className="home-title">
          Ciência vs. <span className="accent">Catástrofes</span>
        </h1>
        <p className="home-subtitle">
          Um simulador para perceberes como o saber científico e as invenções úteis ajudam a prevenir desastres naturais
          e a proteger vidas — brinca com os controlos, lê as explicações e imagina uma comunidade bem preparada!
        </p>

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
          className={`home-tab ${homeTab === 'jogar' ? 'on' : ''}`}
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
          className={`home-tab ${homeTab === 'aprender' ? 'on' : ''}`}
          onClick={() => setHomeTab('aprender')}
        >
          Aprender Mais
        </button>
      </nav>

      {homeTab === 'jogar' && (
        <div id="panel-jogar" role="tabpanel" aria-labelledby="tab-jogar" className="home-tab-panel">
      {edu && (
        <section className="home-edu" aria-labelledby="home-edu-title">
          <h2 id="home-edu-title" className="home-edu-title">Para que serve este simulador?</h2>
          <p className="home-edu-lead">{edu.lead}</p>
          <div className="home-edu-grid">
            {edu.blocks.map((b, i) => (
              <article key={i} className="home-edu-card">
                <h3 className="home-edu-card-title">{b.title}</h3>
                <p className="home-edu-card-text">{b.text}</p>
              </article>
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
                  <span className="chip green">150 pts a repartir</span>
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
        <div id="panel-aprender" role="tabpanel" aria-labelledby="tab-aprender" className="home-tab-panel">
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

  const initialBudget = useMemo(() => buildInitialBudget(disaster), [disaster]);
  const [values, setValues] = useState(initialBudget);

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

  const maxSlider = BUDGET_TOTAL - BUDGET_MIN * (disaster.variables.length - 1);
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
      return `Faltam ${timeLeft}s! Reparte bem os 150 pontos — as decisões contam.`;
    }
    if (mode === 'missao' && missionState === 'over') {
      return 'A catástrofe aconteceu! Vamos ver os resultados...';
    }
    return tips[tipIndex];
  })();

  return (
    <div className="app">
      {/* Top bar */}
      <div className="sim-top">
        <button className="back-btn" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18 L9 12 L15 6" />
          </svg>
          Voltar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' }}>
          <h1 className="h-title" style={{ fontSize: 28 }}>
            <span style={{ fontSize: 28, marginRight: 8 }}>{disaster.emoji}</span>
            {disaster.name}
          </h1>
        </div>

        <div className="mode-switch" role="tablist">
          <button className={mode === 'livre' ? 'on' : ''} onClick={() => onModeChange('livre')}>🧪 Livre</button>
          <button className={mode === 'missao' ? 'on' : ''} onClick={() => onModeChange('missao')}>🎯 Missão</button>
        </div>
      </div>

      <div className="sim-grid">
        {/* Left: variables */}
        <div className="panel">
          <div className="panel-head">
            <h3>Ciência e tecnologia</h3>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>
              {mode === 'livre'
                ? `150 pontos no total — cada passo move ${BUDGET_STEP} pontos; os outros ajustam-se (mín. ${BUDGET_MIN} em cada)`
                : 'Reparte 150 pontos antes do tempo acabar'}
            </span>
          </div>

          <div className="budget-strip" aria-live="polite">
            <span className="budget-strip-total">{budgetUsed}/{BUDGET_TOTAL} pontos usados</span>
            <span className="budget-strip-hint">Não dá para maximizar tudo: é preciso escolher prioridades.</span>
          </div>

          {disaster.teachIntro && (
            <div className="sim-teach" role="region" aria-label="Sobre esta catástrofe">
              <p className="sim-teach-label">Sobre esta catástrofe</p>
              <p className="sim-teach-text">{disaster.teachIntro}</p>
            </div>
          )}

          <div className="mascot-row">
            <MascotMini size={56} mood={outcome.stars >= 2 || mode === 'livre' ? 'happy' : 'happy'} />
            <div className="bubble">{currentTip}</div>
          </div>

          <div className="panel-body">
            {disaster.variables.map(v => {
              const sb = v.strand ? strandBadge(v.strand) : null;
              return (
                <div key={v.id} className="var">
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
                    <div className="var-val">{values[v.id]} <span className="var-pts">pts</span></div>
                  </div>
                  <input
                    type="range" min={BUDGET_MIN} max={maxSlider} step={BUDGET_STEP}
                    className="chunky"
                    value={values[v.id]}
                    disabled={sliderDisabled}
                    onChange={e => setValues(prev => redistributeBudget(prev, disaster, v.id, Number(e.target.value)))}
                  />
                  {v.preventExplain && (
                    <div className="var-prevent">
                      <p className="var-prevent-title">Como isto ajuda a prevenir?</p>
                      <p className="var-prevent-text">{v.preventExplain}</p>
                    </div>
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
                <button className="cta ghost" onClick={reset}>↻ Repor</button>
              </>
            )}
            {mode === 'missao' && missionState === 'idle' && (
              <>
                <button className="cta big green" onClick={startMission}>
                  🎯 Começar missão (45s)
                </button>
                <button className="cta ghost" onClick={reset}>↻ Repor</button>
              </>
            )}
            {mode === 'missao' && missionState === 'running' && (
              <button className="cta ghost" onClick={() => { setMissionState('over'); setIntensity(0.88); setTimeout(()=>setShowResult(true),800); }}>
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
                {advice.praiseLines.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          {advice.showImprove && (
            <div className="modal-reflect improve">
              <h4 className="modal-reflect-title">O que podias fazer diferente</h4>
              <ul className="modal-reflect-list">
                {advice.improveLines.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          {advice.tips.length > 0 && (
            <div className="modal-reflect tips">
              <h4 className="modal-reflect-title">Dicas para a vida real</h4>
              <ul className="modal-reflect-list">
                {advice.tips.map((line, i) => <li key={i}>{line}</li>)}
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
          <button className="cta green" onClick={onClose}>↻ Jogar outra vez</button>
          <button className="cta ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

// ---------- Root ----------
const App = () => {
  const [screen, setScreen] = useState('home'); // home | sim
  const [picked, setPicked] = useState(null);

  const pick = (id) => { setPicked(id); setScreen('sim'); window.scrollTo(0, 0); };
  const back = () => { setScreen('home'); window.scrollTo(0, 0); };

  return screen === 'home'
    ? <Home onPick={pick} />
    : <Simulator key={picked} disasterId={picked} onBack={back} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
