import { Component, HostListener, inject, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './shared/layout/topbar/topbar.component';
import { CommandPaletteComponent } from './shared/ui/command-palette/command-palette.component';
import { ToastContainerComponent } from './shared/ui/toast/toast.component';
import { CommandService } from './core/services/command.service';
import { Router } from '@angular/router';
import { pageTransition } from './shared/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, CommandPaletteComponent, ToastContainerComponent],
  animations: [pageTransition],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  private commandService = inject(CommandService);
  private router = inject(Router);

  ngAfterViewInit(): void {
    // Register global commands
    this.commandService.register([
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: 'dashboard', shortcut: 'G D', group: 'Navigation', action: () => this.router.navigate(['/dashboard']) },
      { id: 'nav-transactions', label: 'Go to Transactions', icon: 'transactions', shortcut: 'G T', group: 'Navigation', action: () => this.router.navigate(['/transactions']) },
      { id: 'nav-categories', label: 'Go to Categories', icon: 'categories', shortcut: 'G C', group: 'Navigation', action: () => this.router.navigate(['/categories']) },
      { id: 'nav-analytics', label: 'Go to Analytics', icon: 'analytics', shortcut: 'G A', group: 'Navigation', action: () => this.router.navigate(['/analytics']) },
      { id: 'action-new-transaction', label: 'New Transaction', icon: 'plus', shortcut: 'N', group: 'Actions', action: () => this.router.navigate(['/transactions/new']) },
    ]);
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
