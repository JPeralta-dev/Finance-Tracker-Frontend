import { Component, signal, HostListener, OnInit, inject, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { drawerSlide } from '../animations';
import { AuthService } from '../../core/services/auth.service';

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

        <!-- Desktop links (only when authenticated) -->
        @if (isAuthenticated()) {
          <ul class="nav-links desktop-only">
            @for (item of navItems; track item.path) {
              <li>
                <a [routerLink]="item.path"
                   routerLinkActive="active"
                   [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
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
        }

        <!-- Auth section -->
        <div class="auth-section desktop-only">
          @if (isAuthenticated()) {
            <span class="user-email">{{ userEmail() }}</span>
            <button class="btn-logout" (click)="onLogout()" [disabled]="logoutLoading()">
              @if (logoutLoading()) {
                <span class="spinner-sm"></span>
              }
              Logout
            </button>
          } @else {
            <a routerLink="/login" class="btn-login">Sign In</a>
          }
        </div>

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

      @if (isAuthenticated()) {
        <div class="drawer-user">
          <span class="drawer-user-email">{{ userEmail() }}</span>
        </div>
        <ul class="drawer-links">
          @for (item of navItems; track item.path) {
            <li>
              <a [routerLink]="item.path"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
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
          <li>
            <button class="drawer-logout" (click)="onLogout()" [disabled]="logoutLoading()">
              Logout
            </button>
          </li>
        </ul>
      } @else {
        <ul class="drawer-links">
          <li>
            <a routerLink="/login" class="drawer-link" (click)="closeDrawer()">
              Sign In
            </a>
          </li>
          <li>
            <a routerLink="/register" class="drawer-new" (click)="closeDrawer()">
              Create Account
            </a>
          </li>
        </ul>
      }
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
      background: rgba(34, 56, 67, 0.12);
      color: #223843;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .brand-name {
      font-family: 'Poppins', sans-serif;
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
    .nav-link.active { background: rgba(34, 56, 67, 0.1); color: #223843; }
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
      background: #223843;
      color: white;
      border-radius: 9px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .btn-new:hover { background: #1A2D36; transform: translateY(-1px); }
    .btn-new:active { transform: scale(0.97); }

    /* Auth section */
    .auth-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-email {
      font-size: 13px;
      color: #666;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .btn-logout {
      padding: 8px 14px;
      background: transparent;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #555;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-logout:hover { border-color: #999; color: #111; }
    .btn-logout:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-login {
      padding: 8px 18px;
      background: #223843;
      color: white;
      border-radius: 9px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.15s;
    }
    .btn-login:hover { background: #1A2D36; }

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
    .drawer-user {
      padding: 12px 20px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .drawer-user-email {
      font-size: 13px;
      color: #666;
    }
    .drawer-links {
      list-style: none;
      padding: 12px;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .drawer-link {
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
      background: rgba(34, 56, 67, 0.1);
      color: #223843;
    }
    .drawer-link:hover {
      background: rgba(0,0,0,0.04);
    }
    .drawer-new {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 14px;
      border-radius: 10px;
      text-decoration: none;
      background: #223843;
      color: white;
      font-weight: 600;
      text-align: center;
    }
    .drawer-new:hover { background: #1A2D36; }
    .drawer-logout {
      display: block;
      width: 100%;
      padding: 12px 14px;
      border: none;
      background: transparent;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      border-radius: 10px;
    }
    .drawer-logout:hover { background: rgba(0,0,0,0.04); }

    .desktop-only { display: flex; }
    .mobile-only { display: none; }

    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: flex !important; }
      .drawer.mobile-only { display: block !important; }
      .brand { margin-right: 0; }
    }

    .spinner-sm {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(0,0,0,0.15);
      border-top-color: #555;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private routerSub?: Subscription;

  drawerOpen = signal(false);
  isAuthenticated = signal(false);
  userEmail = signal('');
  logoutLoading = signal(false);

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'DB' },
    { path: '/transactions', label: 'Transactions', icon: 'TX' },
    { path: '/categories', label: 'Categories', icon: 'CT' },
  ];

  ngOnInit(): void {
    this.checkAuth();
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkAuth();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  checkAuth(): void {
    const authenticated = this.authService.isAuthenticated();
    this.isAuthenticated.set(authenticated);

    if (authenticated) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.userEmail.set(user.displayName ?? user.email);
        },
        error: () => {
          // Token might be expired, clear and redirect
          this.authService.clearTokens();
        },
      });
    }
  }

  toggleDrawer() {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  onLogout(): void {
    this.logoutLoading.set(true);
    this.authService.logout().pipe(
      finalize(() => {
        this.logoutLoading.set(false);
      }),
    ).subscribe({
      next: () => {
        this.isAuthenticated.set(false);
        this.userEmail.set('');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isAuthenticated.set(false);
        this.userEmail.set('');
        this.router.navigate(['/login']);
      },
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDrawer();
  }
}
