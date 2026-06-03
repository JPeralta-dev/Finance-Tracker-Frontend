import { Component, HostListener, inject, AfterViewInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TopbarComponent } from './shared/layout/topbar/topbar.component';
import { CommandPaletteComponent } from './shared/ui/command-palette/command-palette.component';
import { ToastContainerComponent } from './shared/ui/toast/toast.component';
import { CategoryModalComponent } from './shared/ui/category-modal/category-modal.component';
import { CommandService } from './core/services/command.service';
import { AuthService } from './core/services/auth.service';
import { pageTransition } from './shared/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, CommandPaletteComponent, ToastContainerComponent, CategoryModalComponent],
  animations: [pageTransition],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  private commandService = inject(CommandService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Rutas públicas donde no se muestra el topbar privado
  private readonly publicRoutes = ['', 'login', 'register'];

  readonly showTopbar = signal(false);

  ngAfterViewInit(): void {
    // Register global commands
    this.commandService.register([
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: 'dashboard', shortcut: 'G D', group: 'Navigation', action: () => this.router.navigate(['/dashboard']) },
      { id: 'nav-transactions', label: 'Go to Transactions', icon: 'transactions', shortcut: 'G T', group: 'Navigation', action: () => this.router.navigate(['/transactions']) },
      { id: 'nav-categories', label: 'Go to Categories', icon: 'categories', shortcut: 'G C', group: 'Navigation', action: () => this.router.navigate(['/categories']) },
      { id: 'nav-analytics', label: 'Go to Analytics', icon: 'analytics', shortcut: 'G A', group: 'Navigation', action: () => this.router.navigate(['/analytics']) },
      { id: 'action-new-transaction', label: 'New Transaction', icon: 'plus', shortcut: 'N', group: 'Actions', action: () => this.router.navigate(['/transactions/new']) },
    ]);

    // Listen to route changes to update topbar visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTopbarVisibility();
    });

    // Initial check
    this.updateTopbarVisibility();
  }

  private updateTopbarVisibility(): void {
    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    const isPublicRoute = this.publicRoutes.includes(currentUrl);
    // Only show topbar if user is authenticated AND NOT on a public route
    this.showTopbar.set(!isPublicRoute && this.authService.isAuthenticated());
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // ⌘K or Ctrl+K to open command palette
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.commandService.toggle();
    }
  }
}
