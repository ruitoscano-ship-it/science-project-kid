#!/usr/bin/env node
/**
 * Testes de layout em smartphone e tablet (Playwright).
 * Uso: npm run build && node scripts/responsive-test.mjs
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const PORT = 9876;
const BASE = `http://127.0.0.1:${PORT}`;

const VIEWPORTS = [
  { name: 'iPhone 14', ...devices['iPhone 14'] },
  { name: 'iPad (tablet)', viewport: { width: 768, height: 1024 }, isMobile: false, hasTouch: true },
  { name: 'Android phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['--yes', 'serve', 'dist', '-p', String(PORT)], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const timer = setTimeout(() => reject(new Error('Server timeout')), 15000);
    proc.stdout.on('data', (d) => {
      out += d.toString();
      if (out.includes('Accepting') || out.includes('http://')) {
        clearTimeout(timer);
        resolve(proc);
      }
    });
    proc.stderr.on('data', (d) => {
      out += d.toString();
      if (out.includes('Accepting') || out.includes('http://')) {
        clearTimeout(timer);
        resolve(proc);
      }
    });
    proc.on('error', reject);
  });
}

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const overflowX = doc.scrollWidth > doc.clientWidth + 2;
    const overflowY = doc.scrollHeight > doc.clientHeight + 2;
    return { overflowX, scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, overflowY };
  });
}

async function runFlow(page, label) {
  const issues = [];

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.home-hero', { timeout: 30000 });

  let ov = await checkOverflow(page);
  if (ov.overflowX) issues.push(`Home: scroll horizontal (${ov.scrollWidth}px > ${ov.clientWidth}px)`);

  await page.click('#tab-aprender');
  await page.waitForTimeout(400);
  ov = await checkOverflow(page);
  if (ov.overflowX) issues.push('Aprender Mais: scroll horizontal');

  await page.click('#tab-jogar');
  await page.waitForTimeout(300);

  const card = page.locator('.card:not(.disabled)').first();
  await card.waitFor({ state: 'visible' });
  await card.click();
  await page.waitForSelector('.sim-grid', { timeout: 15000 });

  ov = await checkOverflow(page);
  if (ov.overflowX) issues.push('Simulador: scroll horizontal');

  const slider = page.locator('input[type=range].chunky').first();
  await slider.waitFor();
  const box = await slider.boundingBox();
  if (!box || box.height < 20) issues.push('Slider: área de toque muito pequena');

  const back = page.locator('.back-btn');
  const backBox = await back.boundingBox();
  if (!backBox || backBox.height < 40) issues.push('Botão Voltar: altura < 40px');

  await page.locator('.cta.btn-press').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  return issues;
}

async function main() {
  console.log('A iniciar servidor estático…');
  const proc = await startServer();
  const browser = await chromium.launch();
  const allIssues = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n▶ ${vp.name} (${vp.viewport?.width || 'device'}×${vp.viewport?.height || 'device'})`);
      const context = await browser.newContext({
        ...vp,
        locale: 'pt-PT',
      });
      const page = await context.newPage();
      const issues = await runFlow(page, vp.name);
      if (issues.length) {
        console.log('  Problemas:', issues.join('; '));
        allIssues.push({ device: vp.name, issues });
      } else {
        console.log('  OK — sem overflow; controlos visíveis');
      }
      await context.close();
    }
  } finally {
    await browser.close();
    proc.kill('SIGTERM');
  }

  if (allIssues.length) {
    console.log('\n❌ Falhou em', allIssues.length, 'dispositivo(s)');
    process.exit(1);
  }
  console.log('\n✅ Todos os testes de ecrã passaram.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
