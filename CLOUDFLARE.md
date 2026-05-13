# Cloudflare Pages

Este projeto é **estático** (HTML + CSS + JS/JSX servidos tal como estão). O `npm run build` copia só o necessário para `dist/`.

## Painel (recomendado)

1. Repositório no GitHub/GitLab.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → ligar o repositório.
3. Definições do build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (raiz do repo)
   - **Deploy command:** deixa **vazio** (não configures nada aqui).
4. **Environment variables:** nenhuma obrigatória.
5. **Deploy** — cada push na branch configurada gera um novo deploy. O Pages **publica automaticamente** o conteúdo da pasta `dist` após o build; **não** uses `npx wrangler deploy` aí (isso é para **Workers**, não para este site estático).

## Erro: `Missing entry-point to Worker script` após `wrangler deploy`

Se no log aparece `Executing user deploy command: npx wrangler deploy` e depois falha:

1. No projeto **Pages** → **Settings** → **Builds & deployments** → **Build configuration** (ou **Edit configuration**).
2. Apaga o conteúdo do campo **Deploy command** / **Non-production branch deploy command** (deixa em branco).
3. Guarda e faz **Retry deployment** ou um novo commit.

`wrangler deploy` tenta publicar um **Worker**; este projeto só precisa do **output directory** `dist`. O `npm run build` já é suficiente.

## Linha de comandos

```bash
npm install
npm run deploy
```

Na primeira vez o Wrangler pede login. O nome do projeto no Cloudflare pode ser fixado assim:

```bash
npx wrangler pages deploy dist --project-name=ciencia-catastrofes
```

(Altera `ciencia-catastrofes` para o nome que quiseres no dashboard.)

## Ficheiros importantes

| Ficheiro | Função |
|----------|--------|
| `index.html` | Entrada em `/` (React/Babel em produção, caminhos absolutos `/…`) |
| `_headers` | Cabeçalhos de segurança + `Content-Type` para `.jsx` |
| `wrangler.toml` | Metadados do Wrangler (nome sugerido do projeto) |
| `scripts/prepare-pages.mjs` | Gera `dist/` só com assets públicos |

Para desenvolvimento local continua a poderes usar `Simulador Ciência vs. Catástrofes.html` (caminhos relativos).
