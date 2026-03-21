import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { pageTransition } from './shared/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  animations: [pageTransition],
  template: `
    <app-navbar />
    <main class="main-content">
      <div [@pageTransition]>
        <router-outlet />
      </div>
    </main>
  `,
  styles: [`
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }
    @media (max-width: 768px) {
      .main-content { padding: 20px 16px 48px; }
    }
  `]
})
export class AppComponent {}
