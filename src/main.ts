import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerECharts } from './app/shared/charts';

// Register ECharts modules before bootstrapping to prevent init failures
registerECharts();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
