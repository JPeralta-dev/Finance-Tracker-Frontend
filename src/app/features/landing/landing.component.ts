import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-landing",
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">
            Take control of your
            <span class="highlight">finances</span>
          </h1>
          <p class="hero-subtitle">
            Track income and expenses, visualize spending patterns, and make
            smarter financial decisions — all in one place.
          </p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn-primary">Get Started</a>
            <a routerLink="/login" class="btn-secondary">Sign In</a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <h2 class="features-title">Everything you need</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Dashboard Overview</h3>
            <p>See your balance, income, and expenses at a glance with real-time summaries.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Transaction Tracking</h3>
            <p>Log and categorize every transaction. Filter by date, type, or category.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Monthly Charts</h3>
            <p>Visualize your financial trends over the last 6 months with interactive charts.</p>
          </div>
        </div>
      </section>

      <!-- Telegram Bot Promo -->
      <section class="telegram-promo">
        <div class="promo-content">
          <div class="promo-icon">🤖</div>
          <h2>Quick add via Telegram</h2>
          <p>
            Log transactions on the go with our Telegram bot. Just send a message
            and it's tracked automatically.
          </p>
          <a
            href="https://t.me/hormigaTrackerBot"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-telegram"
          >
            Open Telegram Bot
          </a>
        </div>
      </section>

      <!-- Footer CTA -->
      <section class="footer-cta">
        <h2>Ready to start?</h2>
        <p>It's free and takes less than a minute to set up.</p>
        <a routerLink="/register" class="btn-primary">Create your account</a>
      </section>
    </div>
  `,
  styles: [`
    .landing { min-height: 100vh; }

    /* Hero */
    .hero {
      padding: 80px 24px 60px;
      text-align: center;
      background: linear-gradient(180deg, #fff 0%, #f9f9f6 100%);
    }
    .hero-content { max-width: 640px; margin: 0 auto; }
    .hero-title {
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 800;
      color: #111;
      line-height: 1.15;
      margin: 0 0 16px;
    }
    .highlight { color: #FF5C4D; }
    .hero-subtitle {
      font-size: 18px;
      color: #555;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      padding: 14px 28px;
      background: #FF5C4D;
      color: white;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-primary:hover { background: #e54535; transform: translateY(-1px); }
    .btn-secondary {
      padding: 14px 28px;
      background: transparent;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-secondary:hover { border-color: #999; }

    /* Features */
    .features {
      padding: 60px 24px;
      text-align: center;
    }
    .features-title {
      font-size: 28px;
      font-weight: 700;
      color: #111;
      margin: 0 0 40px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .feature-card {
      background: white;
      border-radius: 14px;
      padding: 32px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .feature-icon { font-size: 36px; margin-bottom: 16px; }
    .feature-card h3 {
      font-size: 18px;
      font-weight: 700;
      color: #111;
      margin: 0 0 8px;
    }
    .feature-card p {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }

    /* Telegram Promo */
    .telegram-promo {
      padding: 60px 24px;
      background: #f0f9ff;
      text-align: center;
    }
    .promo-content { max-width: 500px; margin: 0 auto; }
    .promo-icon { font-size: 48px; margin-bottom: 16px; }
    .telegram-promo h2 {
      font-size: 24px;
      font-weight: 700;
      color: #111;
      margin: 0 0 12px;
    }
    .telegram-promo p {
      color: #555;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .btn-telegram {
      display: inline-block;
      padding: 12px 24px;
      background: #0088cc;
      color: white;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-telegram:hover { background: #0077b5; transform: translateY(-1px); }

    /* Footer CTA */
    .footer-cta {
      padding: 60px 24px 80px;
      text-align: center;
    }
    .footer-cta h2 {
      font-size: 28px;
      font-weight: 700;
      color: #111;
      margin: 0 0 8px;
    }
    .footer-cta p {
      color: #666;
      font-size: 16px;
      margin: 0 0 24px;
    }
  `],
})
export class LandingComponent {}
