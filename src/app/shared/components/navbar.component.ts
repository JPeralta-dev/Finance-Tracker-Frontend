import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { drawerSlide } from '../animations';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  animations: [drawerSlide],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/" class="brand">
          <span class="brand-icon">FL</span>
          <span class="brand-name">Flowr</span>
        </a>

        <!-- Desktop links -->
        <ul class="nav-links desktop-only">
          @for (item of navItems; track item.path) {
            <li>
              <a [routerLink]="item.path"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                 class="nav-link">
                <span class="nav-icon">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            </li>
          }
        </ul>

        <a routerLink="/transactions/new" class="btn-new desktop-only">
          + New
        </a>

        <!-- Mobile hamburger -->
        <button class="hamburger mobile-only" (click)="toggleDrawer()" [attr.aria-label]="'Toggle menu'">
          <span [class.open]="drawerOpen()"></span>
          <span [class.open]="drawerOpen()"></span>
          <span [class.open]="drawerOpen()"></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    @if (drawerOpen()) {
      <div class="drawer-overlay" (click)="closeDrawer()"></div>
    }
    <aside class="drawer mobile-only" [@drawerSlide]="drawerOpen() ? 'open' : 'closed'">
      <div class="drawer-header">
        <span class="brand-icon">FL</span>
        <span class="brand-name">Flowr</span>
        <button class="close-btn" (click)="closeDrawer()">Close</button>
      </div>
      <ul class="drawer-links">
        @for (item of navItems; track item.path) {
          <li>
            <a [routerLink]="item.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.path === '/' }"
               class="drawer-link"
               (click)="closeDrawer()">
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          </li>
        }
        <li>
          <a routerLink="/transactions/new" class="drawer-new" (click)="closeDrawer()">
            + New Transaction
          </a>
        </li>
      </ul>
    </aside>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(249, 249, 246, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      margin-right: auto;
    }
    .brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(255, 92, 77, 0.12);
      color: #ff5c4d;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .brand-name {
      font-family: 'Clash Display', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #111;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      list-style: none;
      gap: 4px;
      margin: 0;
      padding: 0;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      transition: all 0.18s ease;
    }
    .nav-link:hover { background: rgba(0,0,0,0.05); color: #111; }
    .nav-link.active { background: rgba(255, 92, 77, 0.1); color: #FF5C4D; }
    .nav-icon {
      min-width: 22px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: inherit;
    }
    .btn-new {
      padding: 8px 18px;
      background: #FF5C4D;
      color: white;
      border-radius: 9px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .btn-new:hover { background: #e54535; transform: translateY(-1px); }
    .btn-new:active { transform: scale(0.97); }

    /* Hamburger */
    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: #111;
      border-radius: 2px;
      transition: all 0.25s ease;
      transform-origin: center;
    }
    .hamburger span.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger span.open:nth-child(2) { opacity: 0; }
    .hamburger span.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Drawer */
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 200;
    }
    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      background: #F9F9F6;
      z-index: 201;
      padding: 0;
      box-shadow: 4px 0 20px rgba(0,0,0,0.12);
    }
    .drawer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.07);
    }
    .drawer-header .close-btn {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      color: #888;
      padding: 6px 10px;
      border-radius: 6px;
    }
    .drawer-header .close-btn:hover { background: rgba(0,0,0,0.05); }
    .drawer-links {
      list-style: none;
      padding: 12px;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .drawer-link,
    .drawer-new {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border-radius: 10px;
      text-decoration: none;
      color: #333;
      font-weight: 500;
    }
    .drawer-link.active {
      background: rgba(255, 92, 77, 0.1);
      color: #ff5c4d;
    }
    .drawer-link:hover,
    .drawer-new:hover {
      background: rgba(0,0,0,0.04);
    }
    .drawer-new {
      margin-top: 8px;
      background: #FF5C4D;
      color: white;
      justify-content: center;
      font-weight: 600;
      text-align: center;
    }

    .desktop-only { display: flex; }
    .mobile-only { display: none; }

    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: flex !important; }
      .drawer.mobile-only { display: block !important; }
      .brand { margin-right: 0; }
    }
  `]
})
export class NavbarComponent {
  drawerOpen = signal(false);

  navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'DB' },
    { path: '/transactions', label: 'Transactions', icon: 'TX' },
    { path: '/categories', label: 'Categories', icon: 'CT' },
  ];

  toggleDrawer() {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDrawer();
  }
}
