const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateOgImage() {
  const markPath = path.resolve(__dirname, '../src/assets/kipu-mark.png');
  const markBase64 = fs.existsSync(markPath) 
    ? `data:image/png;base64,${fs.readFileSync(markPath).toString('base64')}`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #0c0914;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      padding: 72px 84px;
    }

    /* Ambient background lighting */
    .glow-1 {
      position: absolute;
      width: 650px;
      height: 650px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(168, 85, 247, 0) 70%);
      top: -150px;
      right: -80px;
      pointer-events: none;
    }

    .glow-2 {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%);
      bottom: -160px;
      left: 100px;
      pointer-events: none;
    }

    /* Subtle grid pattern */
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
    }

    /* Left accent vertical stripe like Sumant */
    .accent-bar {
      position: absolute;
      left: 48px;
      top: 72px;
      bottom: 72px;
      width: 5px;
      border-radius: 4px;
      background: linear-gradient(to bottom, #d946ef, #a855f7, #6366f1);
      box-shadow: 0 0 16px rgba(217, 70, 239, 0.4);
    }

    /* Content layout */
    .top-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 2;
    }

    .logo-mark {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
    }

    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #f8fafc;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #e9d5ff;
      margin-left: 8px;
    }

    .main-body {
      z-index: 2;
      margin-top: 10px;
    }

    .headline {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 74px;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: -0.04em;
      color: #ffffff;
      max-width: 950px;
    }

    .headline .gradient-text {
      background: linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }

    .underline-accent {
      position: relative;
      display: inline-block;
    }

    .underline-accent::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 85%;
      height: 5px;
      border-radius: 3px;
      background: linear-gradient(90deg, #d946ef, #a855f7);
    }

    .subheadline {
      margin-top: 24px;
      font-size: 26px;
      line-height: 1.4;
      font-weight: 400;
      color: #cbd5e1;
      max-width: 820px;
    }

    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 2;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .features {
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 500;
      color: #94a3b8;
    }

    .feature-icon {
      color: #a855f7;
      font-weight: 700;
    }

    .domain-tag {
      font-family: 'Space Grotesk', monospace;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #a855f7;
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="grid-overlay"></div>
  <div class="accent-bar"></div>

  <div class="top-bar">
    ${markBase64 ? `<img class="logo-mark" src="${markBase64}" alt="Kipu" />` : ''}
    <span class="brand-name">Kipu</span>
    <span class="badge">Personal Finance</span>
  </div>

  <div class="main-body">
    <h1 class="headline">
      <span class="underline-accent">Your money,</span><br/>
      <span class="gradient-text">perfectly organized.</span>
    </h1>
    <p class="subheadline">
      Track expenses, uncover spending habits, and take full control of your finances.
    </p>
  </div>

  <div class="bottom-bar">
    <div class="features">
      <div class="feature-item">
        <span class="feature-icon">✓</span> Free forever
      </div>
      <div class="feature-item">
        <span class="feature-icon">✓</span> 100% Private
      </div>
      <div class="feature-item">
        <span class="feature-icon">✓</span> No card required
      </div>
    </div>
    <div class="domain-tag">kipufinance.online</div>
  </div>
</body>
</html>
  `;

  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputDir = path.resolve(__dirname, '../src/assets/og');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'og-image.png');
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`OG Image generated at: ${outputPath} (${Math.round(stats.size / 1024)} KB)`);
}

generateOgImage().catch(err => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
