// Disaster definitions for the simulator (pt-PT)
// Each variable has weight (importance to outcome). Mission mode adds an "intensity" multiplier.
// strand: papel principal — ciência | tecnologia | ambos (para o trabalho de 4.º ano)

window.HOME_EDUCATION = {
  lead: 'Ciência + tecnologia = equipa que protege a tua vila!',
  blocks: [
    { icon: '🎮', title: 'Jogar', text: 'Escolhe uma catástrofe. Distribui 250 pontos — máx. 70 em cada ideia!' },
    { icon: '🔬', title: 'Ciência', text: 'Perguntar, medir e perceber a Natureza antes do perigo chegar.' },
    { icon: '🛠️', title: 'Tecnologia', text: 'Sensores, avisos no telemóvel e máquinas que ajudam a salvar vidas.' },
    { icon: '⭐', title: 'Objetivo', text: 'Ver se casas e pessoas ficam mais seguras. Prevenir também é ciência!' }
  ]
};

window.DISASTERS = [
  {
    id: 'cheias',
    name: 'Cheias',
    emoji: '🌊',
    short: 'Quando os rios transbordam.',
    population: 12000,
    buildings: 850,
    enabled: true,
    accent: '#4A9FD9',
    factTitle: 'Sabias que?',
    facts: [
      'Os satélites conseguem ver as nuvens de cima e prever chuvas fortes com dias de antecedência!',
      'Plantar árvores junto aos rios ajuda a "beber" a água da chuva e evita que ela chegue toda ao rio de uma vez.',
      'Em Portugal há uma rede de mais de 800 estações meteorológicas que medem a chuva todos os dias.',
      'As barragens não servem só para fazer eletricidade — também guardam água para evitar cheias!'
    ],
    intro: 'Está a chover muito! Ajusta a ciência para proteger a vila do rio.',
    teachIntro:
      'Nas cheias, a água desce em grande quantidade e pode inundar campos, estradas e casas.',
    variables: [
      {
        id: 'meteo',
        name: 'Estações meteorológicas',
        hint: 'Medem chuva e vento em tempo real',
        icon: 'meteo',
        color: '#7FC8E8',
        weight: 1.0,
        default: 30,
        strand: 'ambos',
        preventExplain:
          'Estas estações são tecnologia à nossa volta: pluviómetros, anemómetros e…'
      },
      {
        id: 'barragem',
        name: 'Controlo de barragens',
        hint: 'Liberta água aos poucos antes da tempestade',
        icon: 'dam',
        color: '#4A9FD9',
        weight: 1.2,
        default: 40,
        strand: 'ambos',
        preventExplain:
          'Uma barragem é uma grande obra de engenharia (tecnologia) desenhada com…'
      },
      {
        id: 'arvores',
        name: 'Florestas e árvores',
        hint: 'As raízes absorvem a chuva como uma esponja',
        icon: 'tree',
        color: '#6BBE5E',
        weight: 0.9,
        default: 50,
        strand: 'ciencia',
        preventExplain:
          'Aqui o destaque é a ciência da Natureza: o solo com raízes e matéria orgânica…'
      },
      {
        id: 'alerta',
        name: 'Alertas no telemóvel',
        hint: 'Avisa as pessoas em minutos',
        icon: 'phone',
        color: '#E8845C',
        weight: 1.0,
        default: 40,
        strand: 'tecnologia',
        preventExplain:
          'Os alertas são tecnologia de comunicação: redes, aplicações e mensagens automáticas…'
      }
    ]
  },
  {
    id: 'incendios',
    name: 'Incêndios florestais',
    emoji: '🔥',
    short: 'Quando o fogo se espalha na floresta.',
    population: 8500,
    buildings: 620,
    enabled: true,
    accent: '#FF6B3D',
    factTitle: 'Sabias que?',
    facts: [
      'Há torres de vigia e satélites que vêem o fumo em segundos e chamam os bombeiros!',
      'Os "aceiros" são caminhos sem árvores que cortam o fogo — são como muralhas vazias.',
      'Os aviões dos bombeiros podem largar 6000 litros de água de uma só vez. É como 30 banheiras!',
      'Limpar os matos perto das casas é uma das coisas mais importantes que uma família pode fazer.'
    ],
    intro: 'O verão está quente e seco. Prepara as defesas contra o fogo!',
    teachIntro:
      'Nos incêndios florestais, o fogo precisa de calor, oxigénio e “combustível” (mato seco).',
    variables: [
      {
        id: 'vigia',
        name: 'Torres e satélites de vigia',
        hint: 'Detetam fumo em segundos',
        icon: 'tower',
        color: '#FFD23F',
        weight: 1.1,
        default: 30,
        strand: 'ambos',
        preventExplain:
          'Torres com pessoas atentas e satélites com câmaras térmicas são tecnologia de…'
      },
      {
        id: 'aceiros',
        name: 'Aceiros (corta-fogos)',
        hint: 'Faixas sem mato que travam as chamas',
        icon: 'firebreak',
        color: '#C9A06B',
        weight: 1.0,
        default: 35,
        strand: 'ambos',
        preventExplain:
          'Aceiros são faixas sem vegetação que partem a continuidade do combustível — é uma…'
      },
      {
        id: 'avioes',
        name: 'Aviões e drones bombeiros',
        hint: 'Atacam o fogo com água do céu',
        icon: 'plane',
        color: '#4A9FD9',
        weight: 1.0,
        default: 40,
        strand: 'tecnologia',
        preventExplain:
          'Aviões-canadair, helicópteros e drones são tecnologia aérea que leva água ou espuma…'
      },
      {
        id: 'limpeza',
        name: 'Limpeza dos matos',
        hint: 'Menos combustível = menos fogo',
        icon: 'broom',
        color: '#6BBE5E',
        weight: 1.1,
        default: 35,
        strand: 'ciencia',
        preventExplain:
          'Limpar mato junto a casas e estradas é prevenção baseada na ciência do combustível:…'
      }
    ]
  },
  {
    id: 'terramotos',
    name: 'Terramotos',
    emoji: '🌍',
    short: 'Quando a Terra treme.',
    population: 25000,
    buildings: 1400,
    enabled: true,
    accent: '#A85439',
    factTitle: 'Sabias que?',
    facts: [
      'Os sismógrafos sentem tremores de terra do outro lado do mundo!',
      'No Japão, há um alerta que avisa o telemóvel 10 segundos antes do terramoto chegar. Esses segundos salvam vidas!',
      'Edifícios modernos têm "amortecedores" gigantes na base que abanam em vez do edifício.',
      'Em Portugal, há um plano chamado "Terra Segura" e simulacros nas escolas — para as crianças saberem o que fazer.'
    ],
    intro: 'A Terra pode tremer a qualquer momento. Quão preparada está a tua cidade?',
    teachIntro:
      'Nos terramotos, a energia libertada na crosta propaga-se em ondas.',
    variables: [
      {
        id: 'sensores',
        name: 'Sensores sísmicos',
        hint: 'Detetam ondas no subsolo',
        icon: 'sensor',
        color: '#E8845C',
        weight: 1.0,
        default: 35,
        strand: 'ambos',
        preventExplain:
          'Os sismógrafos e redes de sensores são instrumentos (tecnologia) que transformam…'
      },
      {
        id: 'antissismico',
        name: 'Edifícios antissísmicos',
        hint: 'Construções que abanam sem partir',
        icon: 'building',
        color: '#C9A06B',
        weight: 1.3,
        default: 40,
        strand: 'ambos',
        preventExplain:
          'Edifícios antissísmicos resultam de décadas de estudos (ciência dos materiais e das…'
      },
      {
        id: 'alerta_eq',
        name: 'Alerta precoce',
        hint: 'Avisa segundos antes do tremor chegar',
        icon: 'phone',
        color: '#FFD23F',
        weight: 1.0,
        default: 30,
        strand: 'tecnologia',
        preventExplain:
          'O alerta no telemóvel é um sistema tecnológico que liga sensores, computadores e…'
      },
      {
        id: 'simulacro',
        name: 'Simulacros nas escolas',
        hint: 'Treinar saber o que fazer',
        icon: 'school',
        color: '#6BBE5E',
        weight: 0.9,
        default: 45,
        strand: 'ciencia',
        preventExplain:
          'Simulacro é treino baseado no conhecimento: professores e alunos repetem passos…'
      }
    ]
  },
  {
    id: 'tempestades',
    name: 'Tempestades',
    emoji: '⛈️',
    short: 'Vento forte, chuva torrencial e relâmpagos.',
    population: 18000,
    buildings: 920,
    enabled: true,
    accent: '#6B6890',
    factTitle: 'Sabias que?',
    facts: [
      'Um raio pode aquecer o ar à volta mais depressa do que um forno industrial — por isso ouve-se um estrondo enorme!',
      'Os meteorologistas usam supercomputadores para simular tempestades e avisar com horas de antecedência.',
      'Janelas com proteção e portas bem fechadas ajudam a que o vento não empurre a chuva para dentro das casas.',
      'Em muitos países existem “códigos de cores” no telemóvel: verde, amarelo, laranja, vermelho — para toda a gente perceber o perigo.'
    ],
    intro: 'O céu escureceu e o vento sopra forte. Prepara a cidade para a tempestade!',
    teachIntro:
      'Nas tempestades severas, o vento puxa telhados, a chuva entra pelas frestas e os relâmpagos podem…',
    variables: [
      {
        id: 'previsao',
        name: 'Previsão e radares',
        hint: 'Avisar com antecedência',
        icon: 'meteo',
        color: '#7FC8E8',
        weight: 1.0,
        default: 35,
        strand: 'ambos',
        preventExplain:
          'Radares, satélites e modelos no computador são tecnologia que “fotografam” as…'
      },
      {
        id: 'estruturas',
        name: 'Casas e escolas mais seguras',
        hint: 'Telhados e janelas reforçados',
        icon: 'building',
        color: '#C9A06B',
        weight: 1.2,
        default: 38,
        strand: 'ambos',
        preventExplain:
          'Engenheiros estudam ventos extremos e materiais (ciência) e desenham telhados…'
      },
      {
        id: 'eletrica',
        name: 'Proteção elétrica',
        hint: 'Para-raios e redes mais seguras',
        icon: 'bolt',
        color: '#FFD23F',
        weight: 1.0,
        default: 32,
        strand: 'tecnologia',
        preventExplain:
          'Para-raios e boa ligação à terra desviam a energia do relâmpago de forma controlada…'
      },
      {
        id: 'rotas',
        name: 'Avisos e rotas seguras',
        hint: 'Saber para onde ir e quando',
        icon: 'phone',
        color: '#E8845C',
        weight: 1.0,
        default: 40,
        strand: 'ambos',
        preventExplain:
          'Mensagens no telemóvel, sirenes e planos de evacuação são tecnologia e organização…'
      }
    ]
  },
  {
    id: 'secas',
    name: 'Secas',
    emoji: '☀️',
    short: 'Quando chove pouco e a água falta.',
    population: 14000,
    buildings: 780,
    enabled: true,
    accent: '#E8B85C',
    factTitle: 'Sabias que?',
    facts: [
      'Cerca de 97% da água do planeta é salgada — por isso a água doce é preciosa e deve ser bem gerida!',
      'As plantas “suam” água para o ar: florestas ajudam a manter o clima mais húmido nas regiões à volta.',
      'Em seca, engenheiros podem reutilizar água tratada para regar parques — com muita ciência para a tornar segura.',
      'Medir o nível dos poços e rios com sensores ajuda autarquias a decidir quando pedir poupança à população.'
    ],
    intro: 'O sol não para e os rios baixam. Como vais proteger a comunidade?',
    teachIntro:
      'Na seca prolongada, falta água para beber, regar plantas e apagar fogos.',
    variables: [
      {
        id: 'medicao',
        name: 'Medir água nos rios e poços',
        hint: 'Sensores e dados em tempo real',
        icon: 'sensor',
        color: '#4A9FD9',
        weight: 1.0,
        default: 36,
        strand: 'ambos',
        preventExplain:
          'Sensores nos rios, barragens e poços enviam números para computadores (tecnologia).'
      },
      {
        id: 'reuso',
        name: 'Poupar e reutilizar água',
        hint: 'Torneiras eficientes e água tratada',
        icon: 'droplet',
        color: '#7FC8E8',
        weight: 1.1,
        default: 34,
        strand: 'tecnologia',
        preventExplain:
          'Redutores nas torneiras, rega por gotejamento e estações que tratam água cinzenta…'
      },
      {
        id: 'floresta',
        name: 'Árvores e florestas saudáveis',
        hint: 'Solo que retém humidade',
        icon: 'tree',
        color: '#6BBE5E',
        weight: 1.0,
        default: 42,
        strand: 'ciencia',
        preventExplain:
          'Florestas e matos bem cuidados protegem o solo do sol direto e ajudam a água da…'
      },
      {
        id: 'escolas',
        name: 'Campanhas nas escolas',
        hint: 'Aprender a fechar a torneira a tempo',
        icon: 'school',
        color: '#FFD23F',
        weight: 0.9,
        default: 38,
        strand: 'ciencia',
        preventExplain:
          'Campanhas e projetos na escola ensinam crianças e famílias a fechar torneiras, a…'
      }
    ]
  },
  {
    id: 'deslizamentos',
    name: 'Deslizamentos',
    emoji: '⛰️',
    short: 'Quando a encosta desce com lama e pedras.',
    population: 9500,
    buildings: 540,
    enabled: true,
    accent: '#8B6B4A',
    factTitle: 'Sabias que?',
    facts: [
      'Muitos deslizamentos acontecem depois de chuva forte em encostas já fragilizadas.',
      'As raízes das árvores seguram a terra como uma rede invisível de cordas.',
      'Drenagens ajudam a água a escorrer por caminhos seguros em vez de “empurrar” o solo.',
      'Mapas de risco mostram em cor as zonas mais perigosas — para não se construir casas no sítio errado.'
    ],
    intro: 'A chuva molhou a montanha. Será que a encosta aguenta?',
    teachIntro:
      'Nos deslizamentos, solo e rochas descem a encosta por causa da água, do peso e da gravidade.',
    variables: [
      {
        id: 'chuva',
        name: 'Sensores de chuva e movimento',
        hint: 'Avisar quando a encosta se mexe',
        icon: 'sensor',
        color: '#E8845C',
        weight: 1.0,
        default: 33,
        strand: 'ambos',
        preventExplain:
          'Pluviómetros e, em alguns sítios, instrumentos que detetam vibrações minúsculas…'
      },
      {
        id: 'drenagem',
        name: 'Drenagens e obras de estabilização',
        hint: 'Canos e muros que guiam a água',
        icon: 'dam',
        color: '#4A9FD9',
        weight: 1.2,
        default: 36,
        strand: 'ambos',
        preventExplain:
          'Drenagens levam a água da chuva para longe da encosta instável; muros e estacas…'
      },
      {
        id: 'encosta',
        name: 'Vegetação na encosta',
        hint: 'Raízes que seguram a terra',
        icon: 'tree',
        color: '#6BBE5E',
        weight: 1.0,
        default: 44,
        strand: 'ciencia',
        preventExplain:
          'Plantas com raízes profundas ligam partículas de solo como uma rede natural…'
      },
      {
        id: 'alertas_risco',
        name: 'Alertas e mapas de risco',
        hint: 'Não construir no sítio errado',
        icon: 'phone',
        color: '#FFD23F',
        weight: 1.0,
        default: 37,
        strand: 'ambos',
        preventExplain:
          'Mapas de risco traduzem estudos científicos em cores e regras de urbanização…'
      }
    ]
  }
];

// Encouragement messages from the mascot
window.MASCOT_TIPS = {
  cheias: [
    'Olá! Sou o Professor Eureka. As cheias podem ser controladas com ciência!',
    'Experimenta as estações meteorológicas — são os nossos olhos no céu! ☁️',
    'As barragens são fortes mas precisam de bom controlo.',
    'As árvores são amigas: as raízes "bebem" a chuva!'
  ],
  incendios: [
    'Os incêndios espalham-se depressa. A prevenção é tudo!',
    'Quanto mais cedo virmos o fumo, mais rápido apagamos.',
    'Aceiros são como labirintos vazios que confundem o fogo.',
    'Lembra-te: limpar o mato é poupar a casa.'
  ],
  terramotos: [
    'Não podemos parar a Terra de tremer — mas podemos preparar-nos!',
    'Os edifícios certos abanam mas não caem.',
    'Treinar nas escolas faz a diferença numa emergência.',
    'Cada segundo de aviso pode salvar centenas de vidas.'
  ],
  tempestades: [
    'Raios e vento são perigosos — mas a previsão dá-nos superpoderes! ⛈️',
    'Telhados bem presos e janelas seguras fazem uma diferença enorme.',
    'Para-raios são como escudos mágicos contra a eletricidade do céu.',
    'Lembra-te: saber para onde ir vale tanto como ter um bom casaco!'
  ],
  secas: [
    'A água doce é um tesouro — cada gota conta! 💧',
    'Medir rios e poços é como pôr um termómetro na sede da Terra.',
    'Árvores ajudam o solo a guardar humidade por baixo dos nossos pés.',
    'Na escola aprendemos truques simples que salvam milhares de litros.'
  ],
  deslizamentos: [
    'Chuva + encosta íngreme = precisamos de muita ciência em cima! ⛰️',
    'Drenagens guiam a água como um escorrega seguro para longe das casas.',
    'Raízes seguram a terra — a floresta é uma rede viva.',
    'Mapas de risco dizem-nos onde não convém construir.'
  ]
};

window.LOW_SCORE_MESSAGES = {
  cheias: 'O rio transbordou. Da próxima, sobe a previsão e o controlo da barragem!',
  incendios: 'O fogo alastrou. Mais vigilância e limpeza vão ajudar!',
  terramotos: 'Houve muitos danos. Aposta em edifícios antissísmicos e em simulacros!',
  tempestades: 'A tempestade fez estragos. Reforça previsão, casas e avisos!',
  secas: 'A comunidade sofreu com a falta de água. Medição, poupança e florestas ajudam!',
  deslizamentos: 'A lama desceu depressa. Sensores, drenagens e vegetação são a tua equipa!'
};
window.HIGH_SCORE_MESSAGES = {
  cheias: 'Boa! A vila ficou seca e segura. Tu serias um excelente engenheiro hidráulico! 💧',
  incendios: 'Incrível! A floresta foi salva. Os bombeiros agradecem! 🚁',
  terramotos: 'Fantástico! A cidade resistiu sem grandes danos. Bravo! 🏗️',
  tempestades: 'Excelente! A cidade aguentou a trovoada como um castelo bem preparado! ⛈️',
  secas: 'Muito bem! Guardaste água e cuidaste da terra — verdadeiro guardião do planeta! ☀️',
  deslizamentos: 'Bravo! A encosta ficou mais segura — geólogo em formação! ⛰️'
};

// Dicas gerais após o resultado (rodam com o factIndex no modal)
window.RESULT_POST_TIPS = {
  cheias: [
    'Em casa, combina caixas de água limpa com o plano que a escola ou a junta de freguesia divulga em cheias.',
    'Plantar árvores de espécies adequadas nas zonas húmidas protege o solo e ajuda o rio a não “inchar” de repente.',
    'Nunca brincar nem estacionar junto a um rio quando há aviso de cheia — a água sobe mais depressa do que parece.',
    'Partilhar informação correta com vizinhos evita pânico e salva tempo em emergências.'
  ],
  incendios: [
    'Manter um aceiro ou zona limpa à volta da casa é um hábito de prevenção que protege famílias e habitat de animais.',
    'Reportar fumo cedo (112) dá tempo aos bombeiros e reduz o CO₂ libertado por grandes fogos.',
    'Florestas saudáveis e mistas ardem com mais dificuldade do que eucaliptal seco e denso.',
    'Evitar fogueiras e balões em tempo seco protege o ar que todos respiram.'
  ],
  terramotos: [
    'Fixar móveis altos à parede em casa reduz quedas quando a Terra treme — é prevenção simples.',
    'Saber onde é o ponto de encontro da escola ou do prédio treina a comunidade inteira.',
    'Edifícios antigos podem ser reforçados: obras de reabilitação sísmica salvam vidas durante décadas.',
    'Ter uma mochila com água, lanterna e apito ajuda enquanto esperas ajuda profissional.'
  ],
  tempestades: [
    'Guardar objetos soltos no quintal ou na varanda evita que o vento os transforme em projéteis perigosos.',
    'Desligar aparelhos sensíveis durante trovoadas fortes protege a rede elétrica e reduz desperdício de equipamento.',
    'Árvores antigas perto de linhas elétricas devem ser podadas por profissionais — evita cortes de energia e fogos.',
    'Ouvir avisos oficiais em vez de rumores nas redes sociais mantém toda a gente mais segura.'
  ],
  secas: [
    'Fechar a torneira enquanto escovas os dentes poupa litros todos os dias — multiplica por milhares de casas!',
    'Regar de manhã ou à noite reduz a água perdida por evaporação no jardim da escola ou em casa.',
    'Reutilizar água da lavagem de legumes para regar plantas dá uma segunda vida à água potável.',
    'Florestas e solos húmidos ajudam a recarregar lençóis freáticos — por isso proteger natureza é proteger água.'
  ],
  deslizamentos: [
    'Não construir em vales muito íngremes ou em leitos antigos de cheias protege gerações futuras.',
    'Relvado e raízes fixam melhor o solo do que terreno nu após obras — revegetar rápido é importante.',
    'Em dias de chuva forte, evitar estradas sinalizadas como perigosas protege condutores e equipas de socorro.',
    'Pequenas drenagens mal mantidas entopem — limpar sarjetas na rua é cidadania e prevenção.'
  ]
};

// Textos para a aba "Aprender mais" (4.º ano · pt-PT) — resumo visível + detalhe ao expandir
window.LEARN_MORE = [
  {
    id: 'cheias',
    emoji: '🌊',
    title: 'Cheias',
    resumo: 'Chove muito → o rio enche → a água pode invadir casas e estradas.',
    oQueE: 'O rio leva a água da chuva. Se chover demasiado depressa, transborda.',
    prevenir: [
      'Ouve avisos da meteorologia e da proteção civil.',
      'Não brinques perto do rio quando há aviso de cheias.'
    ],
    tecnologia: [
      'Estações que medem chuva e satélites que veem as nuvens.',
      'Barragens e alertas no telemóvel.'
    ],
    ciencia: [
      'Meteorologia: saber quanto vai chover.',
      'Estudar rios e solos para perceber onde a água corre.'
    ],
    lembrar: 'Prevenir cheias junta ciência, tecnologia e cuidado de todos.'
  },
  {
    id: 'incendios',
    emoji: '🔥',
    title: 'Incêndios florestais',
    resumo: 'Fogo na floresta espalha-se depressa com vento e calor.',
    oQueE: 'Mato seco e vento ajudam o fogo a correr. O fumo faz mal à saúde.',
    prevenir: [
      'Nunca brinques com fogo nem fósforos.',
      'Liga 112 se vires fumo — avisa depressa!'
    ],
    tecnologia: [
      'Torres, câmaras e satélites detetam fumo.',
      'Aviões e helicópteros largam água no fogo.'
    ],
    ciencia: [
      'Triângulo do fogo: calor + oxigénio + combustível.',
      'Estudar vento e plantas secas.'
    ],
    lembrar: 'Menos mato seco perto das casas = mais segurança.'
  },
  {
    id: 'terramotos',
    emoji: '🌍',
    title: 'Terramotos',
    resumo: 'A Terra abana — não dá para prever o dia, mas dá para treinar.',
    oQueE: 'Placas da crosta mexem-se. O abanão pode ser forte e rápido.',
    prevenir: [
      'Faz simulacros na escola: agachar e proteger a cabeça.',
      'Fixa móveis altos à parede (com adultos).'
    ],
    tecnologia: [
      'Sensores avisam em segundos.',
      'Edifícios com estruturas mais seguras.'
    ],
    ciencia: [
      'Geologia: estudar zonas com mais abanões.',
      'Perceber como as ondas se propagam na rocha.'
    ],
    lembrar: 'Treinar na escola ajuda a saber o que fazer no susto.'
  },
  {
    id: 'tempestades',
    emoji: '⛈️',
    title: 'Tempestades',
    resumo: 'Vento forte, chuva, trovões — às vezes granizo.',
    oQueE: 'Tudo junto pode arrancar telhas e encher ruas depressa.',
    prevenir: [
      'Ouve avisos (amarelo, laranja, vermelho).',
      'Fica em casa, longe de janelas, durante relâmpagos.'
    ],
    tecnologia: [
      'Radares veem a tempestade antes de chegar.',
      'Para-raios e avisos no telemóvel.'
    ],
    ciencia: [
      'Meteorologia: nuvens carregadas e vento.',
      'Mapas mostram ruas que enchem primeiro.'
    ],
    lembrar: 'Aviso + calma = mais proteção para todos.'
  },
  {
    id: 'secas',
    emoji: '☀️',
    title: 'Secas',
    resumo: 'Falta chuva durante muito tempo — água escassa.',
    oQueE: 'Rios baixam, plantas sofrem, há menos água para todos.',
    prevenir: [
      'Fecha a torneira depressa.',
      'Gasta só a água que precisas.'
    ],
    tecnologia: [
      'Sensores medem nível dos rios e poços.',
      'Torneiras e contadores que poupam água.'
    ],
    ciencia: [
      'Climatologia: ciclos de chuva.',
      'Estudar aquíferos debaixo do solo.'
    ],
    lembrar: 'Cada gota poupada conta — a água doce é preciosa.'
  },
  {
    id: 'deslizamentos',
    emoji: '⛰️',
    title: 'Deslizamentos de terras',
    resumo: 'Chuva forte + encosta → o solo escorrega como lama.',
    oQueE: 'Pedras e terra podem cobrir estradas e casas muito depressa.',
    prevenir: [
      'Não vás a sítios com aviso de perigo.',
      'Mantém drenagens desentupidas.'
    ],
    tecnologia: [
      'Sensores medem chuva e movimento da encosta.',
      'Mapas 3D e alertas no telemóvel.'
    ],
    ciencia: [
      'Geologia: que tipo de solo existe na encosta.',
      'Estudar deslizamentos antigos.'
    ],
    lembrar: 'Encosta íngreme + muita chuva = cuidado redobrado.'
  }
];

// Quiz Surpresa — perguntas de escolha múltipla (4.º ano · pt-PT)
window.QUIZ_SURPRISA = [
  {
    id: 'cheias_meteo',
    emoji: '🌊',
    topic: 'Cheias',
    question: 'Para que servem as estações meteorológicas?',
    options: ['Medem chuva e vento em tempo real', 'Fazem eletricidade nas barragens', 'Plantam árvores nos rios'],
    answerIndex: 0,
    hint: 'Avisam-nos quando está a chover muito!'
  },
  {
    id: 'cheias_barragem',
    emoji: '🌊',
    topic: 'Cheias',
    question: 'Uma barragem pode ajudar a prevenir cheias porque…',
    options: ['Guarda ou liberta água com controlo', 'Seca o rio completamente', 'Torna o rio mais fundo para sempre'],
    answerIndex: 0,
    hint: 'Engenheiros decidem quando abrir as comportas.'
  },
  {
    id: 'incendio_triangulo',
    emoji: '🔥',
    topic: 'Incêndios',
    question: 'O “triângulo do fogo” precisa de três coisas. Qual destas NÃO faz parte?',
    options: ['Calor', 'Oxigénio', 'Água'],
    answerIndex: 2,
    hint: 'Sem calor, oxigénio ou combustível, o fogo apaga.'
  },
  {
    id: 'incendio_vigia',
    emoji: '🔥',
    topic: 'Incêndios',
    question: 'Como é que satélites e torres de vigia ajudam?',
    options: ['Detetam fumo e calor de longe', 'Apagam o fogo sozinhos', 'Fazem chover em cima das chamas'],
    answerIndex: 0,
    hint: 'Quanto mais cedo avisamos, mais pequeno fica o fogo.'
  },
  {
    id: 'terra_sismo',
    emoji: '🌍',
    topic: 'Terramotos',
    question: 'O que fazem os sensores sísmicos?',
    options: ['Detetam abanões na Terra', 'Preveem o dia exato do terramoto', 'Impedem que a Terra trema'],
    answerIndex: 0,
    hint: 'Não dá para prever o dia, mas dá para medir e avisar.'
  },
  {
    id: 'terra_simulacro',
    emoji: '🌍',
    topic: 'Terramotos',
    question: 'Num simulacro de terramoto na escola, o que devemos fazer primeiro?',
    options: ['Agachar-nos e proteger a cabeça', 'Correr para a rua a gritar', 'Ficar de pé junto à janela'],
    answerIndex: 0,
    hint: 'Treinar ajuda a reagir bem no susto.'
  },
  {
    id: 'tempestade_radar',
    emoji: '⛈️',
    topic: 'Tempestades',
    question: 'Radares e satélites ajudam a prever tempestades porque…',
    options: ['“Veem” nuvens e vento antes de chegarem', 'Aumentam a temperatura do ar', 'Tiram trovões das nuvens'],
    answerIndex: 0,
    hint: 'Meteorologistas leem estes mapas todos os dias.'
  },
  {
    id: 'tempestade_relampago',
    emoji: '⛈️',
    topic: 'Tempestades',
    question: 'Durante um relâmpago, o sítio mais seguro é…',
    options: ['Dentro de casa, longe de janelas', 'Debaixo de uma árvore alta', 'No meio do campo aberto'],
    answerIndex: 0,
    hint: 'Árvores altas e metal atraem raios.'
  },
  {
    id: 'seca_agua',
    emoji: '☀️',
    topic: 'Secas',
    question: 'Numa seca, uma boa atitude em casa é…',
    options: ['Gastar menos água potável', 'Deixar a torneira aberta', 'Regar o jardim ao meio-dia'],
    answerIndex: 0,
    hint: 'Cada gota conta quando chove pouco.'
  },
  {
    id: 'seca_medicao',
    emoji: '☀️',
    topic: 'Secas',
    question: 'Sensores que medem humidade do solo ajudam a…',
    options: ['Saber quando falta água nas plantas', 'Fazer nevar no verão', 'Encher rios instantaneamente'],
    answerIndex: 0,
    hint: 'Ciência + tecnologia poupam água.'
  },
  {
    id: 'desliz_chuva',
    emoji: '⛰️',
    topic: 'Deslizamentos',
    question: 'Deslizamentos de terra acontecem sobretudo quando…',
    options: ['Chove muito e o solo fica encharcado', 'Faz sol durante semanas', 'Nevar nas montanhas'],
    answerIndex: 0,
    hint: 'Água + encosta íngreme = perigo.'
  },
  {
    id: 'desliz_drenagem',
    emoji: '⛰️',
    topic: 'Deslizamentos',
    question: 'Boas drenagens nas estradas ajudam porque…',
    options: ['Levam a água da chuva para sítios seguros', 'Deixam a água parada na estrada', 'Aumentam o peso da encosta'],
    answerIndex: 0,
    hint: 'Água parada enfraquece o solo.'
  },
  {
    id: 'geral_112',
    emoji: '📱',
    topic: 'Prevenção',
    question: 'Se vires fumo de incêndio ou perigo grave, deves…',
    options: ['Ligar 112 e avisar um adulto', 'Gravar vídeo e partilhar só', 'Esconder-te e não dizer nada'],
    answerIndex: 0,
    hint: 'Avisar cedo salva vidas.'
  },
  {
    id: 'geral_ciencia_tech',
    emoji: '🔬',
    topic: 'Ciência e Tecnologia',
    question: 'Prevenir catástrofes naturais junta…',
    options: ['Ciência, tecnologia e boas decisões', 'Só sorte e adivinhação', 'Apenas obras gigantes sozinhos'],
    answerIndex: 0,
    hint: 'Todos podemos ajudar — até na escola!'
  },
  {
    id: 'geral_alertas',
    emoji: '📲',
    topic: 'Tecnologia',
    question: 'Alertas no telemóvel da proteção civil servem para…',
    options: ['Avisar muitas pessoas ao mesmo tempo', 'Jogar videojogos', 'Medir a temperatura do corpo'],
    answerIndex: 0,
    hint: 'Tecnologia que protege a comunidade.'
  },
  {
    id: 'cheias_arvores',
    emoji: '🌳',
    topic: 'Cheias',
    question: 'Árvores junto aos rios ajudam a prevenir cheias porque…',
    options: ['As raízes absorvem água como uma esponja', 'Bloqueiam o rio para sempre', 'Fazem o rio desaparecer'],
    answerIndex: 0,
    hint: 'A Natureza também é uma defesa.'
  }
];
