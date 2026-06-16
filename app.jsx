// Main app for the Ciência vs. Catástrofes simulator
const { useState, useEffect, useMemo, useRef } = React;

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
const LearnMoreArticle = ({ article, accent, initialOpen = false }) => {
  const [open, setOpen] = useState(initialOpen);
  const panelId = `learn-panel-${article.id}`;

  return (
    <article
      className={`learn-card ${open ? 'is-open' : ''}`}
      style={{ '--learn-accent': accent }}
    >
      <header className="learn-card-head">
        <span className="learn-card-emoji" aria-hidden="true">{article.emoji}</span>
        <div className="learn-card-head-text">
          <h3 className="learn-card-title">{article.title}</h3>
          <p className="learn-card-resumo">{article.resumo || article.oQueE}</p>
        </div>
        <button
          type="button"
          className="learn-card-toggle btn-press"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(v => !v)}
        >
          {open ? 'Esconder ▲' : 'Ver mais ▼'}
        </button>
      </header>

      {open && (
        <div id={panelId} className="learn-card-body tab-enter">
          {article.oQueE && article.resumo && (
            <p className="learn-card-intro">{article.oQueE}</p>
          )}
          <div className="learn-card-grid">
            <div className="learn-card-block prevent">
              <h4 className="learn-card-block-title">🛡️ Prevenir</h4>
              <ul className="learn-card-list">
                {(article.prevenir || []).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="learn-card-block tech">
              <h4 className="learn-card-block-title">🛠️ Tecnologia</h4>
              <ul className="learn-card-list">
                {(article.tecnologia || []).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="learn-card-block science">
              <h4 className="learn-card-block-title">🔬 Ciência</h4>
              <ul className="learn-card-list">
                {(article.ciencia || []).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          {article.lembrar && (
            <p className="learn-card-tip">💡 {article.lembrar}</p>
          )}
        </div>
      )}
    </article>
  );
};

const LearnMorePanel = () => {
  const articles = typeof LEARN_MORE !== 'undefined' ? LEARN_MORE : [];
  const [expandAll, setExpandAll] = useState(false);
  const [expandKey, setExpandKey] = useState(0);

  const toggleAll = () => {
    setExpandAll(v => !v);
    setExpandKey(k => k + 1);
  };

  return (
    <section className="learn-more comic-page" aria-labelledby="learn-main-title">
      <h2 id="learn-main-title" className="learn-more-title comic-title">📚 Revista da escola</h2>
      <ComicBubble className="comic-bubble-center">
        Lê o resumo de cada catástrofe. Clica <strong>Ver mais</strong> só quando quiseres saber mais!
      </ComicBubble>

      {articles.length > 1 && (
        <div className="learn-more-toolbar">
          <button type="button" className="learn-more-all btn-press" onClick={toggleAll}>
            {expandAll ? '📕 Esconder tudo' : '📖 Abrir tudo'}
          </button>
        </div>
      )}

      <div className="learn-more-stack">
        {articles.map((a) => {
          const meta = DISASTERS.find(d => d.id === a.id);
          const accent = meta?.accent || '#2C2A4A';
          return (
            <LearnMoreArticle
              key={`${a.id}-${expandKey}`}
              article={a}
              accent={accent}
              initialOpen={expandAll}
            />
          );
        })}
      </div>
    </section>
  );
};

// ---------- Diploma de Especialista ----------
const DIPLOMA_STORAGE_KEY = 'cvc-diploma-stars';
const DIPLOMA_MAX_STARS = 9;

const DIPLOMA_GROUPS = [
  { id: 'agua', disasters: ['cheias', 'tempestades', 'secas', 'deslizamentos'], tone: 'water' },
  { id: 'fogo', disasters: ['incendios'], tone: 'fire' },
  { id: 'terra', disasters: ['terramotos'], tone: 'earth' }
];

const loadDiplomaStars = () => {
  try {
    const raw = localStorage.getItem(DIPLOMA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveDiplomaStar = (disasterId, stars) => {
  const cur = Math.max(0, Math.min(3, Number(stars) || 0));
  const prev = loadDiplomaStars();
  const best = Math.max(Number(prev[disasterId]) || 0, cur);
  if (best === (Number(prev[disasterId]) || 0)) return;
  const next = { ...prev, [disasterId]: best };
  try {
    localStorage.setItem(DIPLOMA_STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
};

const buildDiplomaGroups = (stored) =>
  DIPLOMA_GROUPS.map(g => ({
    ...g,
    stars: Math.min(
      3,
      g.disasters.reduce((max, id) => Math.max(max, Number(stored[id]) || 0), 0)
    )
  }));

const diplomaLevelLabel = (total) => {
  if (total >= 8) return 'Mini-Cientista de Topo';
  if (total >= 5) return 'Bom Cientista';
  if (total >= 2) return 'Cientista em Formação';
  return 'Aprendiz de Cientista';
};

const formatCertDate = () => {
  try {
    return new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const DiplomaMicroscope = ({ size = 28 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <circle cx="14" cy="14" r="9" fill="#E8EEF5" stroke="#2D3250" strokeWidth="2" />
    <rect x="20" y="18" width="4" height="10" rx="1" fill="#2D3250" transform="rotate(35 22 23)" />
    <circle cx="14" cy="14" r="4" fill="#fff" stroke="#2D3250" strokeWidth="1.5" />
    <line x1="8" y1="8" x2="5" y2="5" stroke="#2D3250" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DiplomaSeal = () => (
  <div className="diploma-v2-seal" aria-hidden="true">
    <svg viewBox="0 0 88 104" width="72" height="85">
      <circle cx="44" cy="38" r="30" fill="#E8EEF5" stroke="#2D3250" strokeWidth="3" />
      <circle cx="44" cy="38" r="14" fill="#fff" stroke="#2D3250" strokeWidth="2" />
      <rect x="52" y="48" width="5" height="22" rx="2" fill="#2D3250" transform="rotate(32 54 59)" />
      <line x1="28" y1="22" x2="20" y2="14" stroke="#2D3250" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 66 L38 92 L44 78 L50 92 L58 66 Z" fill="#F39C6B" stroke="#2D3250" strokeWidth="2" strokeLinejoin="round" />
      <path d="M34 78 L54 78" stroke="#2D3250" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const DiplomaDisasterIcon = ({ tone }) => {
  if (tone === 'water') {
    return (
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <path d="M24 8 C18 20 10 24 10 32 C10 38 16 42 24 42 C32 42 38 38 38 32 C38 24 30 20 24 8Z" fill="#4A9FD9" stroke="#2D3250" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 34 C20 30 24 28 28 32" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      </svg>
    );
  }
  if (tone === 'fire') {
    return (
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <path d="M24 6 C24 18 14 22 14 32 C14 40 20 44 24 44 C28 44 34 40 34 32 C34 22 24 18 24 6Z" fill="#FF6B3D" stroke="#2D3250" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 16 C24 24 20 26 20 32 C20 36 22 38 24 38 C26 38 28 36 28 32 C28 26 24 24 24 16Z" fill="#FFD23F" stroke="#2D3250" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
      <circle cx="24" cy="24" r="16" fill="#6BBE5E" stroke="#2D3250" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="16" ry="6" fill="none" stroke="#2D3250" strokeWidth="1.5" />
      <path d="M8 24 H40" stroke="#2D3250" strokeWidth="1.5" />
      <path d="M12 16 C18 20 30 20 36 16" stroke="#2D3250" strokeWidth="1.5" fill="none" />
      <path d="M12 32 C18 28 30 28 36 32" stroke="#2D3250" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

const DiplomaStarRow = ({ count }) => (
  <div className="diploma-v2-stars" aria-hidden="true">
    {[1, 2, 3].map(i => <Star key={i} filled={count >= i} size={20} />)}
  </div>
);

const parseStudentNames = (text) =>
  (text || '')
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 2)
    .filter((name, i, arr) =>
      arr.findIndex(n => n.toLowerCase() === name.toLowerCase()) === i
    );

const shuffleArray = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickQuizQuestions = (pool, count = 10) => {
  const source = pool?.length ? pool : [];
  if (source.length >= count) return shuffleArray(source).slice(0, count);
  const out = [];
  while (out.length < count) out.push(...shuffleArray(source));
  return out.slice(0, count);
};

const pickStudentForQuestion = (students) =>
  students[Math.floor(Math.random() * students.length)];

const buildQuizSession = (students, pool) => {
  const questions = pickQuizQuestions(pool, 10);
  const assignees = questions.map(() => pickStudentForQuestion(students));
  return { questions, assignees };
};

const safePdfFilename = (name) =>
  (name || '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-') || 'aluno';

const DIPLOMA_PAGE = {
  marginTopMm: 20,
  marginBottomMm: 20,
  marginSideMm: 10,
  widthMm: 190,
  heightMm: 257
};
const DIPLOMA_PX_PER_MM = 96 / 25.4;
const diplomaExportPx = () => ({
  w: Math.round(DIPLOMA_PAGE.widthMm * DIPLOMA_PX_PER_MM),
  h: Math.round(DIPLOMA_PAGE.heightMm * DIPLOMA_PX_PER_MM)
});

const getJsPDF = () => {
  if (typeof jspdf !== 'undefined' && jspdf.jsPDF) return jspdf.jsPDF;
  return null;
};

const canExportPdf = () =>
  typeof html2canvas !== 'undefined' && !!getJsPDF();

const PDF_EXPORT_ERROR =
  'Não foi possível guardar o PDF. Verifica a ligação à internet e recarrega a página.';

const applyDiplomaExportNameStyle = (nameEl, studentName) => {
  if (!nameEl) return;
  nameEl.textContent = studentName;
  if (studentName.length > 30) nameEl.style.fontSize = '20px';
  else if (studentName.length > 22) nameEl.style.fontSize = '24px';
  else nameEl.style.fontSize = '';
};

const prepareDiplomaExportClone = (clone, studentName) => {
  const { w, h } = diplomaExportPx();
  clone.classList.add('diploma-exporting');
  clone.style.width = `${w}px`;
  clone.style.height = `${h}px`;
  clone.style.maxWidth = `${w}px`;
  clone.style.maxHeight = `${h}px`;
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';
  const frame = clone.querySelector('.diploma-v2-frame');
  if (frame) {
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.minHeight = `${h}px`;
    frame.style.maxHeight = `${h}px`;
    frame.style.overflow = 'hidden';
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.justifyContent = 'space-between';
  }
  applyDiplomaExportNameStyle(clone.querySelector('.diploma-v2-name'), studentName);
};

const diplomaHtml2CanvasOpts = (studentName) => ({
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: '#FDF8EE',
  scrollX: 0,
  scrollY: 0,
  onclone: (_doc, clone) => prepareDiplomaExportClone(clone, studentName)
});

const captureDiplomaCanvas = async (element, studentName) => {
  if (typeof html2canvas === 'undefined') {
    throw new Error('html2canvas unavailable');
  }
  const { w, h } = diplomaExportPx();
  const opts = diplomaHtml2CanvasOpts(studentName);
  return html2canvas(element, {
    ...opts,
    width: w,
    height: h,
    windowWidth: w,
    windowHeight: h
  });
};

const writeDiplomaCanvasToPdf = (canvas, filename) => {
  const JsPDF = getJsPDF();
  if (!JsPDF) throw new Error('jsPDF unavailable');

  const pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(
    imgData,
    'JPEG',
    DIPLOMA_PAGE.marginSideMm,
    DIPLOMA_PAGE.marginTopMm,
    DIPLOMA_PAGE.widthMm,
    DIPLOMA_PAGE.heightMm,
    undefined,
    'FAST'
  );
  pdf.save(filename);
};

const saveDiplomaPdfFile = async (element, studentName, filename) => {
  const canvas = await captureDiplomaCanvas(element, studentName);
  writeDiplomaCanvasToPdf(canvas, filename);
};

const DiplomaCard = React.forwardRef(({ studentName, groups, totalStars, level }, ref) => (
  <article
    ref={ref}
    className="diploma diploma-v2"
    aria-label={studentName ? `Diploma de ${studentName}` : 'Diploma'}
  >
    <div className="diploma-v2-frame">
      <span className="diploma-v2-corner tl" aria-hidden="true" />
      <span className="diploma-v2-corner tr" aria-hidden="true" />
      <span className="diploma-v2-corner bl" aria-hidden="true" />
      <span className="diploma-v2-corner br" aria-hidden="true" />

      <header className="diploma-v2-head">
        <DiplomaSeal />
        <p className="diploma-v2-kicker">Diploma oficial de</p>
        <h3 className="diploma-v2-title">Mini-Cientista da Prevenção</h3>
        <p className="diploma-v2-sub">Ciência e Tecnologia contra as Catástrofes Naturais</p>
        <div className="diploma-v2-rule" aria-hidden="true">
          <span className="diploma-v2-rule-star">★</span>
          <span className="diploma-v2-rule-line" />
          <span className="diploma-v2-rule-star">★</span>
        </div>
      </header>

      <div className="diploma-v2-body">
        <p className="diploma-v2-lead">Este diploma é orgulhosamente atribuído a</p>
        <p className="diploma-v2-name">{studentName}</p>
        <p className="diploma-v2-desc">
          por ter aprendido a usar a{' '}
          <span className="diploma-v2-hl">ciência</span> e a{' '}
          <span className="diploma-v2-hl">tecnologia</span> — estações meteorológicas,
          barragens, sensores, satélites e muito mais — para proteger pessoas, casas e
          florestas das catástrofes naturais. 🌍
        </p>

        <div className="diploma-v2-progress" aria-label={`${totalStars} de ${DIPLOMA_MAX_STARS} estrelas`}>
          {groups.map(g => (
            <div key={g.id} className={`diploma-v2-badge diploma-v2-badge--${g.tone}`}>
              <DiplomaDisasterIcon tone={g.tone} />
              <DiplomaStarRow count={g.stars} />
            </div>
          ))}
        </div>

        <p className="diploma-v2-level">
          Nível alcançado: <strong>{level}</strong>
        </p>
      </div>

      <footer className="diploma-v2-foot">
        <div className="diploma-v2-sign">
          <div className="diploma-v2-avatar" aria-hidden="true">
            <MascotMini size={52} />
          </div>
          <p className="diploma-v2-sign-name">Prof. Eureka</p>
          <span className="diploma-v2-sign-line" />
          <p className="diploma-v2-sign-role">Diretor do Laboratório</p>
        </div>

        <div className="diploma-v2-date">
          <p className="diploma-v2-date-val">{formatCertDate()}</p>
          <span className="diploma-v2-sign-line" />
          <p className="diploma-v2-sign-role">Data de atribuição</p>
        </div>
      </footer>

      <div className="diploma-v2-micro-badge" aria-hidden="true">
        <DiplomaMicroscope size={22} />
      </div>
    </div>
  </article>
));

const CertificatePanel = () => {
  const [kidName, setKidName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classList, setClassList] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [starData, setStarData] = useState(() => loadDiplomaStars());
  const [pdfExportName, setPdfExportName] = useState('');
  const diplomaRef = useRef(null);

  const flushRender = () =>
    new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  useEffect(() => {
    const refresh = () => setStarData(loadDiplomaStars());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const groups = useMemo(() => buildDiplomaGroups(starData), [starData]);
  const totalStars = useMemo(() => groups.reduce((s, g) => s + g.stars, 0), [groups]);
  const level = diplomaLevelLabel(totalStars);
  const classNames = useMemo(() => parseStudentNames(classList), [classList]);

  const generate = (e) => {
    e.preventDefault();
    const n = kidName.trim();
    if (n.length < 2) return;
    setStarData(loadDiplomaStars());
    setDisplayName(n);
  };

  const applyExportStudentName = (studentName) => {
    const syncDom = (el) => {
      if (!el) return;
      applyDiplomaExportNameStyle(el.querySelector('.diploma-v2-name'), studentName);
    };
    if (typeof ReactDOM !== 'undefined' && typeof ReactDOM.flushSync === 'function') {
      ReactDOM.flushSync(() => setPdfExportName(studentName));
    } else {
      setPdfExportName(studentName);
    }
    syncDom(diplomaRef.current);
  };

  const saveDiplomaPdf = async (studentName) => {
    if (!diplomaRef.current || !studentName) return false;
    const el = diplomaRef.current;
    const slot = el.closest('.diploma-export-slot');
    const nameEl = el.querySelector('.diploma-v2-name');
    const { w, h } = diplomaExportPx();

    applyExportStudentName(studentName);
    el.classList.add('diploma-exporting');
    if (slot) slot.classList.add('is-exporting');
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.maxWidth = `${w}px`;
    el.style.maxHeight = `${h}px`;

    try {
      await flushRender();
      await new Promise((resolve) => setTimeout(resolve, 250));
      await saveDiplomaPdfFile(
        el,
        studentName,
        `diploma-${safePdfFilename(studentName)}.pdf`
      );
      return true;
    } finally {
      el.classList.remove('diploma-exporting');
      el.style.width = '';
      el.style.height = '';
      el.style.maxWidth = '';
      el.style.maxHeight = '';
      if (nameEl) nameEl.style.fontSize = '';
      if (slot) slot.classList.remove('is-exporting');
    }
  };

  const exportPdf = async () => {
    if (!displayName || !diplomaRef.current) return;
    if (!canExportPdf()) {
      window.alert(PDF_EXPORT_ERROR);
      return;
    }
    setPdfBusy(true);
    try {
      await saveDiplomaPdf(displayName);
    } catch (err) {
      console.error(err);
      window.alert(PDF_EXPORT_ERROR);
    } finally {
      setPdfBusy(false);
    }
  };

  const exportClassPdfs = async () => {
    if (!classNames.length || !diplomaRef.current) return;
    if (!canExportPdf()) {
      window.alert(PDF_EXPORT_ERROR);
      return;
    }
    setStarData(loadDiplomaStars());
    setPdfBusy(true);
    setBulkProgress({ current: 0, total: classNames.length });
    try {
      for (let i = 0; i < classNames.length; i++) {
        const name = classNames[i];
        setBulkProgress({ current: i + 1, total: classNames.length });
        await saveDiplomaPdf(name);
        if (i < classNames.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 450));
        }
      }
    } catch (err) {
      console.error(err);
      window.alert(PDF_EXPORT_ERROR);
    } finally {
      setPdfBusy(false);
      setBulkProgress(null);
    }
  };

  return (
    <section className="cert-page comic-page" aria-labelledby="cert-title">
      <h2 id="cert-title" className="learn-more-title comic-title">🏅 Diploma de Especialista</h2>
      <ComicBubble className="comic-bubble-center">
        Gera um diploma individual ou exporta diplomas para toda a turma de uma vez.
      </ComicBubble>

      <form className="cert-form" onSubmit={generate}>
        <label className="cert-label" htmlFor="kid-name">Um aluno</label>
        <input
          id="kid-name"
          className="cert-input"
          type="text"
          maxLength={48}
          placeholder="Ex.: Maria Silva"
          value={kidName}
          onChange={e => setKidName(e.target.value)}
          autoComplete="name"
        />
        <button type="submit" className="cta btn-press green" disabled={kidName.trim().length < 2}>
          ✨ Gerar diploma
        </button>
      </form>

      <div className="cert-class-block">
        <h3 className="cert-class-title">Entrega à turma</h3>
        <p className="cert-class-hint">
          Cola a lista de nomes — um aluno por linha (também podes separar por vírgula).
        </p>
        <label className="cert-label" htmlFor="class-list">Lista de alunos</label>
        <textarea
          id="class-list"
          className="cert-textarea"
          rows={8}
          maxLength={4000}
          placeholder={'Maria Silva\nJoão Santos\nAna Costa'}
          value={classList}
          onChange={e => setClassList(e.target.value)}
          disabled={pdfBusy}
        />
        <p className="cert-class-count" aria-live="polite">
          {classNames.length === 0
            ? 'Ainda não há nomes válidos na lista.'
            : `${classNames.length} aluno${classNames.length === 1 ? '' : 's'} na lista`}
        </p>
        <button
          type="button"
          className="cta btn-press"
          onClick={exportClassPdfs}
          disabled={pdfBusy || classNames.length === 0}
        >
          {pdfBusy && bulkProgress
            ? `A guardar ${bulkProgress.current}/${bulkProgress.total}…`
            : `📄 Exportar ${classNames.length} diploma${classNames.length === 1 ? '' : 's'}`}
        </button>
      </div>

      <div className="diploma-export-slot" aria-hidden="true">
        <DiplomaCard
          ref={diplomaRef}
          studentName={pdfExportName || displayName || ' '}
          groups={groups}
          totalStars={totalStars}
          level={level}
        />
      </div>

      {displayName && !pdfBusy && (
        <div className="cert-result">
          <div className="cert-actions no-print">
            <button
              type="button"
              className="cta btn-press"
              onClick={exportPdf}
              disabled={pdfBusy}
            >
              {pdfBusy ? 'A guardar…' : '📄 Guardar PDF'}
            </button>
          </div>

          <DiplomaCard
            studentName={displayName}
            groups={groups}
            totalStars={totalStars}
            level={level}
          />
        </div>
      )}
    </section>
  );
};

// ---------- Quiz Surpresa ----------
const QUIZ_SPIN_TICKS = 22;
const QUIZ_SPIN_MS = 75;

const SurpriseQuizPanel = () => {
  const questionPool = typeof QUIZ_SURPRISA !== 'undefined' ? QUIZ_SURPRISA : [];
  const [classList, setClassList] = useState('');
  const [phase, setPhase] = useState('setup');
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const spinTimerRef = useRef(null);

  const parsedNames = useMemo(() => parseStudentNames(classList), [classList]);
  const currentQ = questions[qIndex];
  const currentStudent = assignees[qIndex];
  const totalQ = questions.length;

  useEffect(() => () => {
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
  }, []);

  const startQuiz = (e) => {
    e.preventDefault();
    if (parsedNames.length < 2 || questionPool.length < 1) return;
    const session = buildQuizSession(parsedNames, questionPool);
    setStudents(parsedNames);
    setQuestions(session.questions);
    setAssignees(session.assignees);
    setQIndex(0);
    setRevealed(false);
    setShowAnswer(false);
    setSpinLabel('');
    setPhase('playing');
  };

  const runSpin = () => {
    if (spinning || revealed || !students.length || !currentStudent) return;
    setSpinning(true);
    setShowAnswer(false);
    let tick = 0;
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    spinTimerRef.current = setInterval(() => {
      tick += 1;
      if (tick >= QUIZ_SPIN_TICKS) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
        setSpinLabel(currentStudent);
        setSpinning(false);
        setRevealed(true);
        return;
      }
      setSpinLabel(students[Math.floor(Math.random() * students.length)]);
    }, QUIZ_SPIN_MS);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase('done');
      return;
    }
    setQIndex(i => i + 1);
    setRevealed(false);
    setShowAnswer(false);
    setSpinLabel('');
  };

  const restart = () => {
    setPhase('setup');
    setQIndex(0);
    setRevealed(false);
    setShowAnswer(false);
    setSpinLabel('');
  };

  return (
    <section className="quiz-page comic-page" aria-labelledby="quiz-title">
      <h2 id="quiz-title" className="learn-more-title comic-title">🎲 Quiz Surpresa</h2>
      <ComicBubble className="comic-bubble-center">
        Carrega a turma, sorteia quem responde — 10 perguntas sobre catástrofes, ciência e tecnologia!
      </ComicBubble>

      {phase === 'setup' && (
        <form className="quiz-setup cert-class-block" onSubmit={startQuiz}>
          <h3 className="cert-class-title">A tua turma</h3>
          <p className="cert-class-hint">
            Escreve os nomes dos alunos — um por linha. Precisas de pelo menos <strong>2 alunos</strong>.
          </p>
          <label className="cert-label" htmlFor="quiz-class-list">Lista de alunos</label>
          <textarea
            id="quiz-class-list"
            className="cert-textarea"
            rows={8}
            maxLength={4000}
            placeholder={'Maria Silva\nJoão Santos\nAna Costa\nPedro Lima'}
            value={classList}
            onChange={e => setClassList(e.target.value)}
          />
          <p className="cert-class-count" aria-live="polite">
            {parsedNames.length < 2
              ? `${parsedNames.length} aluno${parsedNames.length === 1 ? '' : 's'} — faltam mais nomes!`
              : `${parsedNames.length} alunos prontos para o sorteio 🎉`}
          </p>
          <button
            type="submit"
            className="cta btn-press green quiz-start-btn"
            disabled={parsedNames.length < 2 || questionPool.length < 1}
          >
            🚀 Começar o Quiz Surpresa!
          </button>
        </form>
      )}

      {phase === 'playing' && currentQ && (
        <div className="quiz-play tab-enter">
          <div className="quiz-progress" aria-label={`Pergunta ${qIndex + 1} de ${totalQ}`}>
            {questions.map((q, i) => (
              <span
                key={q.id}
                className={`quiz-dot ${i < qIndex ? 'done' : ''} ${i === qIndex ? 'on' : ''}`}
                aria-hidden="true"
              />
            ))}
            <span className="quiz-progress-label">Pergunta {qIndex + 1} / {totalQ}</span>
          </div>

          <article key={qIndex} className="quiz-q-card comic-panel">
            <header className="quiz-q-head">
              <span className="quiz-q-emoji" aria-hidden="true">{currentQ.emoji}</span>
              <span className="quiz-q-topic">{currentQ.topic}</span>
            </header>
            <h3 className="quiz-q-text">{currentQ.question}</h3>
            <ul className="quiz-options">
              {currentQ.options.map((opt, i) => (
                <li
                  key={i}
                  className={`quiz-option ${showAnswer && i === currentQ.answerIndex ? 'correct' : ''} ${showAnswer && i !== currentQ.answerIndex ? 'dim' : ''}`}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
            {!showAnswer && (
              <button
                type="button"
                className="quiz-reveal-answer cta btn-press"
                onClick={() => setShowAnswer(true)}
              >
                💡 Mostrar resposta certa
              </button>
            )}
            {showAnswer && (
              <ComicBubble className="quiz-hint-bubble">{currentQ.hint}</ComicBubble>
            )}
          </article>

          <div className={`quiz-picker ${spinning ? 'is-spinning' : ''} ${revealed ? 'is-revealed' : ''}`}>
            <p className="quiz-picker-label">Quem responde?</p>
            <div className="quiz-picker-stage" aria-live="polite">
              {revealed ? (
                <>
                  <div className="quiz-picker-burst" aria-hidden="true">✨</div>
                  <p className="quiz-picker-name">{currentStudent}</p>
                  <p className="quiz-picker-cheer">A vez é tua! 🙋</p>
                </>
              ) : (
                <p className={`quiz-picker-name ${spinning ? 'blur-spin' : 'waiting'}`}>
                  {spinning ? spinLabel : '🎲 Clica para sortear!'}
                </p>
              )}
            </div>
            {!revealed && (
              <button
                type="button"
                className="cta btn-press green quiz-spin-btn"
                onClick={runSpin}
                disabled={spinning}
              >
                {spinning ? '🎰 A sortear…' : '🎲 Sortear aluno!'}
              </button>
            )}
            {revealed && (
              <button type="button" className="cta btn-press quiz-next-btn" onClick={nextQuestion}>
                {qIndex + 1 >= totalQ ? '🏁 Ver resultados' : '➡️ Próxima pergunta'}
              </button>
            )}
          </div>

          <div className="quiz-mascot-row" aria-hidden="true">
            <MascotMini size={64} mood={revealed ? 'happy' : 'happy'} />
            <ComicBubble className="quiz-mascot-bubble">
              {revealed ? 'Boa sorte, cientista!' : 'Prof. Eureka está atento…'}
            </ComicBubble>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="quiz-done tab-enter">
          <div className="quiz-done-hero">
            <span className="quiz-done-trophy" aria-hidden="true">🏆</span>
            <h3 className="quiz-done-title">Quiz terminado!</h3>
            <p className="quiz-done-sub">10 perguntas · turma em grande</p>
          </div>
          <ul className="quiz-recap">
            {questions.map((q, i) => (
              <li key={q.id} className="quiz-recap-item">
                <span className="quiz-recap-num">{i + 1}</span>
                <span className="quiz-recap-emoji" aria-hidden="true">{q.emoji}</span>
                <div className="quiz-recap-body">
                  <strong>{assignees[i]}</strong>
                  <span>{q.topic} — {q.question}</span>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="cta btn-press green" onClick={restart}>
            🔄 Novo Quiz Surpresa
          </button>
        </div>
      )}
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
        <button
          type="button"
          role="tab"
          aria-selected={homeTab === 'certificado'}
          aria-controls="panel-certificado"
          id="tab-certificado"
          className={`home-tab btn-press home-tab-cert ${homeTab === 'certificado' ? 'on' : ''}`}
          onClick={() => setHomeTab('certificado')}
        >
          🏅 Diploma
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={homeTab === 'quiz'}
          aria-controls="panel-quiz"
          id="tab-quiz"
          className={`home-tab btn-press home-tab-quiz ${homeTab === 'quiz' ? 'on' : ''}`}
          onClick={() => setHomeTab('quiz')}
        >
          🎲 Quiz Surpresa
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

      {homeTab === 'certificado' && (
        <div id="panel-certificado" role="tabpanel" aria-labelledby="tab-certificado" className="home-tab-panel tab-enter" key="tab-certificado">
          <CertificatePanel />
        </div>
      )}

      {homeTab === 'quiz' && (
        <div id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz" className="home-tab-panel tab-enter" key="tab-quiz">
          <SurpriseQuizPanel />
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
    saveDiplomaStar(disaster.id, outcome.stars);
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
