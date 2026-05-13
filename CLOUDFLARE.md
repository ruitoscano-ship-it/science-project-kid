# Cloudflare Pages

Este projeto é **estático** (HTML + CSS + JS/JSX servidos tal como estão). O `npm run build` copia só o necessário para `dist/`.

## Painel (recomendado)

1. Repositório no GitHub/GitLab.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → ligar o repositório.
3. Definições do build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (raiz do repo)
4. **Environment variables:** nenhuma obrigatória.
5. **Deploy** — cada push na branch configurada gera um novo deploy.

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
